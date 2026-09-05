-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_id TEXT NOT NULL DEFAULT 'avatar_1',
    account_status TEXT NOT NULL DEFAULT 'GUEST', -- 'GUEST' | 'LINKED'
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    coins INTEGER NOT NULL DEFAULT 0,
    total_stars INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    classic_best_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLASSIC STATISTICS TABLE
CREATE TABLE IF NOT EXISTS classic_statistics (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    high_score INTEGER NOT NULL DEFAULT 0,
    total_lines_cleared INTEGER NOT NULL DEFAULT 0,
    total_blocks_placed INTEGER NOT NULL DEFAULT 0,
    longest_combo INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ADVENTURE PROGRESS TABLE
CREATE TABLE IF NOT EXISTS adventure_progress (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    unlocked_world_id TEXT NOT NULL DEFAULT 'world-1',
    unlocked_level_number INTEGER NOT NULL DEFAULT 1,
    completed_levels JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_stars INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    player_level INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PLAYER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS player_settings (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    haptics_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LEADERBOARD ENTRIES PREPARATION TABLE
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'CLASSIC_ALL_TIME',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES --

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Players can view and update their own record
CREATE POLICY "Players can view own profile" ON players
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Players can update own profile" ON players
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Players can insert own profile" ON players
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Classic Stats policies
CREATE POLICY "Players can manage own classic stats" ON classic_statistics
    FOR ALL USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL));

-- Adventure Progress policies
CREATE POLICY "Players can manage own adventure progress" ON adventure_progress
    FOR ALL USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL));

-- Player Settings policies
CREATE POLICY "Players can manage own settings" ON player_settings
    FOR ALL USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid() OR user_id IS NULL));

-- Leaderboard Public Read
CREATE POLICY "Anyone can view leaderboard entries" ON leaderboard_entries
    FOR SELECT USING (true);
