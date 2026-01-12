-- Add max_drawdown_override column to trading_config
ALTER TABLE trading_config 
ADD COLUMN max_drawdown_override DECIMAL(5,2) DEFAULT NULL;

-- Set the historical max drawdown value
UPDATE trading_config 
SET max_drawdown_override = 19.9 
WHERE id = 'f0e2aca0-a4e0-430f-99d0-a1a75e50a64d';