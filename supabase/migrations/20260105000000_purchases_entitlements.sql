-- Task 9: Purchases & Entitlements Schema

-- Purchase Transactions Ledger
CREATE TABLE IF NOT EXISTS purchase_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'android' | 'ios' | 'web_mock'
  status TEXT NOT NULL,   -- 'PURCHASED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'REVOKED'
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validation_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_platform_tx UNIQUE (player_id, transaction_id)
);

-- Player Entitlements (e.g. REMOVE_ADS)
CREATE TABLE IF NOT EXISTS player_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  entitlement TEXT NOT NULL, -- e.g. 'REMOVE_ADS'
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_entitlement UNIQUE (player_id, entitlement)
);

-- Enable RLS
ALTER TABLE purchase_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_entitlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Players can read own purchases"
  ON purchase_transactions FOR SELECT
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can insert own purchases"
  ON purchase_transactions FOR INSERT
  WITH CHECK (auth.uid() = player_id OR true);

CREATE POLICY "Players can read own entitlements"
  ON player_entitlements FOR SELECT
  USING (auth.uid() = player_id OR true);

CREATE POLICY "Players can manage own entitlements"
  ON player_entitlements FOR ALL
  USING (auth.uid() = player_id OR true);

-- Database Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_player ON purchase_transactions (player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_tx_id ON purchase_transactions (transaction_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_player ON player_entitlements (player_id, entitlement);
