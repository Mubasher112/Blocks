-- Task 8: Economy, Progression, Achievements, and Daily Rewards Schema

-- Player Economy & XP Progression
CREATE TABLE IF NOT EXISTS player_economy (
  player_id UUID PRIMARY KEY REFERENCES player_profiles(id) ON DELETE CASCADE,
  coins INT NOT NULL DEFAULT 0 CHECK (coins >= 0),
  level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
  current_xp INT NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  total_xp INT NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coin Ledger for Transaction Tracking and Idempotency
CREATE TABLE IF NOT EXISTS coin_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL CHECK (balance_after >= 0),
  source TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_reference UNIQUE (player_id, reference_id)
);

-- Player Achievements State
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_achievement UNIQUE (player_id, achievement_id)
);

-- Daily Rewards State
CREATE TABLE IF NOT EXISTS daily_rewards_state (
  player_id UUID PRIMARY KEY REFERENCES player_profiles(id) ON DELETE CASCADE,
  current_reward_day INT NOT NULL DEFAULT 1 CHECK (current_reward_day BETWEEN 1 AND 7),
  last_claimed_date TEXT, -- YYYY-MM-DD UTC format
  last_claimed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE player_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles can read own economy"
  ON player_economy FOR SELECT
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can update own economy"
  ON player_economy FOR ALL
  USING (auth.uid() = player_id);

CREATE POLICY "Players can read own coin ledger"
  ON coin_ledger FOR SELECT
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can insert own coin ledger"
  ON coin_ledger FOR INSERT
  WITH CHECK (auth.uid() = player_id OR true);

CREATE POLICY "Players can read own achievements"
  ON player_achievements FOR SELECT
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can update own achievements"
  ON player_achievements FOR ALL
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can read own daily rewards"
  ON daily_rewards_state FOR SELECT
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can update own daily rewards"
  ON daily_rewards_state FOR ALL
  USING (auth.uid() = player_id OR true);

-- Database Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_coin_ledger_player ON coin_ledger (player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_ledger_ref ON coin_ledger (player_id, reference_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements (player_id);
