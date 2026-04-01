-- Bank Accounts Tracking Migration
-- Adds bank accounts for tracking balances across different accounts

CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  purpose VARCHAR(200),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency ON bank_accounts(currency);

-- Seed data for existing bank accounts
INSERT INTO bank_accounts (name, purpose, balance, currency) VALUES
  ('KBank', 'Savings', 4000.00, 'THB'),
  ('SCB', 'Building project', 49928.35, 'THB'),
  ('Krungsri', 'Day to day spending', 9500.00, 'THB')
ON CONFLICT DO NOTHING;
