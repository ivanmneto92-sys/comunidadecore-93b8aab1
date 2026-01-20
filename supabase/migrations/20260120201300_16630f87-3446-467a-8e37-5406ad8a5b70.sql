
-- Fix search_path warning for calculate_season_level function
CREATE OR REPLACE FUNCTION public.calculate_season_level(p_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  level INTEGER := 1;
  xp_needed INTEGER := 0;
  remaining_xp INTEGER := p_xp;
BEGIN
  WHILE level < 50 AND remaining_xp >= xp_needed LOOP
    IF level <= 10 THEN
      xp_needed := level * 50;
    ELSIF level <= 25 THEN
      xp_needed := 500 + (level - 10) * 100;
    ELSIF level <= 40 THEN
      xp_needed := 2000 + (level - 25) * 200;
    ELSE
      xp_needed := 5000 + (level - 40) * 400;
    END IF;
    
    IF remaining_xp >= xp_needed THEN
      remaining_xp := remaining_xp - xp_needed;
      level := level + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN LEAST(level, 50);
END;
$$;
