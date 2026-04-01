-- Credit Cards Tracking Migration
-- Adds independent credit cards with payment history tracking

CREATE TABLE IF NOT EXISTS credit_cards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'THB',
  statement_date INTEGER,  -- Day of month (1-31)
  due_date INTEGER,        -- Day of month (1-31)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add credit_card_id to debt_payments for tracking CC payments
ALTER TABLE debt_payments ADD COLUMN IF NOT EXISTS credit_card_id INTEGER REFERENCES credit_cards(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_debt_payments_credit_card_id ON debt_payments(credit_card_id);

-- Seed data for existing credit cards (from KBank CC and Krungsri CC entries)
INSERT INTO credit_cards (name, credit_limit, currency, statement_date, due_date) VALUES
  ('KBank Credit Card', 50000, 'THB', 1, 25),
  ('Krungsri Credit Card', 30000, 'THB', 15, 10)
ON CONFLICT DO NOTHING;
