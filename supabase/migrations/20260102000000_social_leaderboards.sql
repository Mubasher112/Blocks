-- 1. FRIEND REQUESTS TABLE
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'ACCEPTED' | 'REJECTED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_sender_receiver UNIQUE (sender_id, receiver_id),
    CONSTRAINT no_self_request CHECK (sender_id <> receiver_id)
);

-- 2. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id_1 UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player_id_2 UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_friendship UNIQUE (player_id_1, player_id_2),
    CONSTRAINT no_self_friendship CHECK (player_id_1 <> player_id_2)
);

-- 3. LEADERBOARDS TABLE
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_id TEXT NOT NULL DEFAULT 'avatar_1',
    category TEXT NOT NULL, -- 'CLASSIC_ALL_TIME' | 'CLASSIC_WEEKLY' | 'ADVENTURE_GLOBAL' | 'DAILY_CHALLENGE'
    period_key TEXT NOT NULL DEFAULT 'ALL_TIME', -- e.g. '2026-W36' or '2026-09-05' or 'ALL_TIME'
    score INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_player_category_period UNIQUE (player_id, category, period_key)
);

-- INDEXES FOR FAST RANKINGS & SEARCH --
CREATE INDEX IF NOT EXISTS idx_leaderboards_category_period_score ON leaderboards(category, period_key, score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_players_display_name ON players(display_name);
CREATE INDEX IF NOT EXISTS idx_friendships_p1 ON friendships(player_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_p2 ON friendships(player_id_2);

-- RLS POLICIES --
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated/guest can view leaderboards
CREATE POLICY "Public leaderboard view" ON leaderboards FOR SELECT USING (true);

-- Friends RLS Policies
CREATE POLICY "View own friend requests" ON friend_requests
    FOR SELECT USING (sender_id IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL)
                   OR receiver_id IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "View own friendships" ON friendships
    FOR SELECT USING (player_id_1 IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL)
                   OR player_id_2 IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL));

-- SERVER-SIDE RPC FOR VALIDATED SCORE SUBMISSION --
CREATE OR REPLACE FUNCTION submit_score(
    p_player_id UUID,
    p_category TEXT,
    p_period_key TEXT,
    p_score INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Only update if new score > existing score for the category/period
    INSERT INTO leaderboards (player_id, display_name, avatar_id, category, period_key, score)
    SELECT
        p.id,
        p.display_name,
        p.avatar_id,
        p_category,
        p_period_key,
        p_score
    FROM players p
    WHERE p.id = p_player_id
    ON CONFLICT (player_id, category, period_key)
    DO UPDATE SET
        score = GREATEST(leaderboards.score, EXCLUDED.score),
        updated_at = NOW()
    WHERE EXCLUDED.score > leaderboards.score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
