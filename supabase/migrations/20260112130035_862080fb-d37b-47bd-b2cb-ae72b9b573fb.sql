-- Add unique constraint to prevent duplicate check-ins on the same day
ALTER TABLE public.daily_checkins 
ADD CONSTRAINT unique_user_checkin_date 
UNIQUE (user_id, checkin_date);