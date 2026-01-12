-- Delete all monthly returns from 2024 (keep only 2025 and later)
DELETE FROM monthly_returns WHERE month < '2025-01-01';