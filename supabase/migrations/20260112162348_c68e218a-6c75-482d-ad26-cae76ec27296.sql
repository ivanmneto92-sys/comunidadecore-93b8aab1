-- Add total_deposits and total_withdrawals columns to trading_config
ALTER TABLE trading_config 
ADD COLUMN IF NOT EXISTS total_deposits DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_withdrawals DECIMAL(15,2) DEFAULT 0;

-- Set the withdrawal value as specified by the user
UPDATE trading_config 
SET total_withdrawals = 8821 
WHERE id = 'f0e2aca0-a4e0-430f-99d0-a1a75e50a64d';