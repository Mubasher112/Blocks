-- Migration: 20260103000000_daily_challenges.sql
-- Description: Daily Challenges, Results, Streaks schema and server-side RPC validation.

-- 1. Daily Challenges Table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
    id TEXT PRIMARY KEY, -- Format: 'daily:YYYY-MM-DD'
    challenge_date DATE UNIQUE NOT NULL,
    seed BIGINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
    config JSONB NOT NULL,
    version INT NOT NULL DEFAULT 1,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Daily Challenge Results Table
CREATE TABLE IF NOT EXISTS public.daily_challenge_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id TEXT NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0 CHECK (score >= 0),
    lines_cleared INT NOT NULL DEFAULT 0 CHECK (lines_cleared >= 0),
    moves_used INT NOT NULL DEFAULT 0 CHECK (moves_used >= 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_count INT NOT NULL DEFAULT 1 CHECK (attempt_count >= 1),
    best_score INT NOT NULL DEFAULT 0 CHECK (best_score >= 0),
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_player_challenge UNIQUE (challenge_id, player_id)
);

-- 3. Player Streaks Table
CREATE TABLE IF NOT EXISTS public.player_streaks (
    player_id UUID PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_completed_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for high performance queries
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges (challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_results_challenge_score ON public.daily_challenge_results (challenge_id, best_score DESC);
CREATE INDEX IF NOT EXISTS idx_daily_results_player ON public.daily_challenge_results (player_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Daily challenges are viewable by everyone"
    ON public.daily_challenges FOR SELECT
    USING (true);

CREATE POLICY "Daily results are viewable by everyone"
    ON public.daily_challenge_results FOR SELECT
    USING (true);

CREATE POLICY "Players can insert/update own daily results"
    ON public.daily_challenge_results FOR ALL
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Player streaks viewable by everyone"
    ON public.player_streaks FOR SELECT
    USING (true);

CREATE POLICY "Players can update own streak"
    ON public.player_streaks FOR ALL
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);


-- 4. Server RPC for Submitting Daily Challenge Results & Calculating Streaks Idempotently
CREATE OR REPLACE FUNCTION submit_daily_challenge_result(
    p_challenge_id TEXT,
    p_score INT,
    p_lines_cleared INT,
    p_moves_used INT,
    p_completed BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_player_id UUID;
    v_challenge_date DATE;
    v_existing_result public.daily_challenge_results%ROWTYPE;
    v_new_best_score INT;
    v_reward_granted BOOLEAN := FALSE;
    v_streak_info public.player_streaks%ROWTYPE;
    v_prev_date DATE;
    v_new_current_streak INT := 1;
    v_new_longest_streak INT := 1;
BEGIN
    v_player_id := auth.uid();
    IF v_player_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Extract date from challenge ID (format daily:YYYY-MM-DD)
    v_challenge_date := SUBSTRING(p_challenge_id FROM 7)::DATE;

    -- Sanity check score bounds
    IF p_score < 0 OR p_score > 500000 THEN
        RAISE EXCEPTION 'Submitted score out of valid bounds.';
    END IF;

    -- Check if player already submitted for this challenge
    SELECT * INTO v_existing_result
    FROM public.daily_challenge_results
    WHERE challenge_id = p_challenge_id AND player_id = v_player_id;

    IF FOUND THEN
        v_new_best_score := GREATEST(v_existing_result.best_score, p_score);

        -- If newly completed and reward wasn't claimed yet
        IF p_completed AND NOT v_existing_result.reward_claimed THEN
            v_reward_granted := TRUE;
        END IF;

        UPDATE public.daily_challenge_results
        SET score = p_score,
            lines_cleared = p_lines_cleared,
            moves_used = p_moves_used,
            completed = v_existing_result.completed OR p_completed,
            attempt_count = v_existing_result.attempt_count + 1,
            best_score = v_new_best_score,
            reward_claimed = v_existing_result.reward_claimed OR v_reward_granted,
            updated_at = NOW()
        WHERE challenge_id = p_challenge_id AND player_id = v_player_id;
    ELSE
        v_new_best_score := p_score;
        v_reward_granted := p_completed;

        INSERT INTO public.daily_challenge_results (
            challenge_id,
            player_id,
            score,
            lines_cleared,
            moves_used,
            completed,
            attempt_count,
            best_score,
            reward_claimed,
            submitted_at,
            updated_at
        ) VALUES (
            p_challenge_id,
            v_player_id,
            p_score,
            p_lines_cleared,
            p_moves_used,
            p_completed,
            1,
            v_new_best_score,
            v_reward_granted,
            NOW(),
            NOW()
        );
    END IF;

    -- Calculate UTC Streak if completed
    IF p_completed THEN
        SELECT * INTO v_streak_info
        FROM public.player_streaks
        WHERE player_id = v_player_id;

        IF FOUND THEN
            v_prev_date := v_streak_info.last_completed_date;

            IF v_prev_date IS NULL THEN
                v_new_current_streak := 1;
            ELSIF v_prev_date = v_challenge_date THEN
                -- Same day completion, maintain streak
                v_new_current_streak := v_streak_info.current_streak;
            ELSIF v_prev_date = v_challenge_date - INTERVAL '1 day' THEN
                -- Consecutive day completion, increment streak
                v_new_current_streak := v_streak_info.current_streak + 1;
            ELSE
                -- Missed one or more days, reset streak to 1
                v_new_current_streak := 1;
            END IF;

            v_new_longest_streak := GREATEST(v_streak_info.longest_streak, v_new_current_streak);

            UPDATE public.player_streaks
            SET current_streak = v_new_current_streak,
                longest_streak = v_new_longest_streak,
                last_completed_date = v_challenge_date,
                updated_at = NOW()
            WHERE player_id = v_player_id;
        ELSE
            v_new_current_streak := 1;
            v_new_longest_streak := 1;

            INSERT INTO public.player_streaks (
                player_id,
                current_streak,
                longest_streak,
                last_completed_date,
                updated_at
            ) VALUES (
                v_player_id,
                1,
                1,
                v_challenge_date,
                NOW()
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'best_score', v_new_best_score,
        'reward_granted', v_reward_granted,
        'current_streak', v_new_current_streak,
        'longest_streak', v_new_longest_streak
    );
END;
$$;
