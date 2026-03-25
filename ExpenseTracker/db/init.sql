-- ExpenseTracker Budget App — Database Schema

CREATE TABLE IF NOT EXISTS months (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  month_id INTEGER NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('income','thb','zar')),
  label VARCHAR(100) NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'THB',
  sort_order INTEGER DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

-- Independent debts table (debts persist across months)
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('owing', 'owed')),
  label VARCHAR(100) NOT NULL,
  original_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'THB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debt_payments (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
  debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_payments_entry_id ON debt_payments(entry_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);

INSERT INTO settings (key, value) VALUES ('zar_thb_rate', '1.65') ON CONFLICT DO NOTHING;

-- Seed March 2026
INSERT INTO months (year, month) VALUES (2026, 3) ON CONFLICT DO NOTHING;

DO $$
DECLARE m_id INTEGER;
BEGIN
  SELECT id INTO m_id FROM months WHERE year=2026 AND month=3;

  -- Income
  INSERT INTO entries (month_id,category,label,amount,currency,sort_order) VALUES
    (m_id,'income','Salary',53000,'THB',1),
    (m_id,'income','Bonus / mo',24000,'THB',2);

  -- Thailand expenses
  INSERT INTO entries (month_id,category,label,amount,currency,sort_order) VALUES
    (m_id,'thb','Rent',7500,'THB',1),
    (m_id,'thb','Food',4000,'THB',2),
    (m_id,'thb','Gym',1380,'THB',3),
    (m_id,'thb','Electricity',1300,'THB',4),
    (m_id,'thb','Transport',1500,'THB',5),
    (m_id,'thb','Internet',350,'THB',6),
    (m_id,'thb','Starlink',1000,'THB',7),
    (m_id,'thb','KBank CC',7500,'THB',8),
    (m_id,'thb','Krungsri CC',3000,'THB',9);

  -- SA expenses
  INSERT INTO entries (month_id,category,label,amount,currency,sort_order) VALUES
    (m_id,'zar','Rent',2050,'ZAR',1),
    (m_id,'zar','Fees Xul',2000,'ZAR',2),
    (m_id,'zar','Owing',500,'ZAR',3),
    (m_id,'zar','Ano',400,'ZAR',4),
    (m_id,'zar','Gas',700,'ZAR',5),
    (m_id,'zar','Electricity',500,'ZAR',6),
    (m_id,'zar','Transport',600,'ZAR',7),
    (m_id,'zar','Internet',500,'ZAR',8),
    (m_id,'zar','Food',4000,'ZAR',9);
END $$;

-- Seed independent debts
INSERT INTO debts (type, label, original_amount, currency) VALUES
  ('owing', 'Jah B', 4000, 'ZAR'),
  ('owed', 'Blessing', 4500, 'THB');
