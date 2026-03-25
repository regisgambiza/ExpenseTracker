-- Migration: Independent debts table
-- Debts are no longer tied to months - they persist until paid off

-- Create independent debts table
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('owing', 'owed')),
  label VARCHAR(100) NOT NULL,
  original_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add debt_id to debt_payments (optional reference, keeping entry_id for backwards compat)
ALTER TABLE debt_payments ADD COLUMN IF NOT EXISTS debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);

-- Migrate existing debt entries from March 2026 to independent debts table
DO $$
DECLARE
  m_id INTEGER;
  e RECORD;
  new_debt_id INTEGER;
BEGIN
  -- Get March 2026 month id (where seed debts exist)
  SELECT id INTO m_id FROM months WHERE year=2026 AND month=3;
  
  IF m_id IS NOT NULL THEN
    -- Migrate each debt entry
    FOR e IN 
      SELECT id, label, amount, currency 
      FROM entries 
      WHERE month_id = m_id AND category IN ('owing', 'owed')
    LOOP
      INSERT INTO debts (type, label, original_amount, currency)
      VALUES (
        (SELECT category FROM entries WHERE id = e.id),
        e.label,
        e.amount,
        e.currency
      ) RETURNING id INTO new_debt_id;
      
      -- Migrate payment history to reference the new debt
      UPDATE debt_payments 
      SET debt_id = new_debt_id 
      WHERE entry_id = e.id;
    END LOOP;
  END IF;
END $$;

-- Note: After migration, the frontend will fetch debts from the new table
-- Old debt entries in 'entries' table for category 'owing'/'owed' will be ignored
