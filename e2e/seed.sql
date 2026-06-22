-- Seed E2E test data for virtualized chat tests.
-- Run with: psql "$DATABASE_URL" -v user_id="'<uuid>'" -f e2e/seed.sql
-- The user_id must be a real authenticated user (use the one your Playwright session logs in as).
--
-- Channel: chat-geral (5bec12f3-5344-41be-b58b-a11433ac29d5)
-- Inserts 200 messages spaced 1 minute apart so we have plenty to virtualize,
-- plus 3 marker messages with predictable content used by the tests.

DO $$
DECLARE
  v_user uuid := :user_id;
  v_channel uuid := '5bec12f3-5344-41be-b58b-a11433ac29d5';
  i integer;
  v_oldest_id uuid;
  v_target_id uuid;
BEGIN
  -- Clean previous seed
  DELETE FROM public.messages
   WHERE channel_id = v_channel
     AND user_id = v_user
     AND content LIKE '[E2E]%';

  -- Oldest marker
  INSERT INTO public.messages (channel_id, user_id, content, created_at)
  VALUES (v_channel, v_user, '[E2E] OLDEST MARKER',
          now() - interval '210 minutes')
  RETURNING id INTO v_oldest_id;

  -- 200 filler messages, oldest first
  FOR i IN 1..200 LOOP
    INSERT INTO public.messages (channel_id, user_id, content, created_at)
    VALUES (
      v_channel, v_user,
      '[E2E] msg #' || lpad(i::text, 3, '0'),
      now() - (interval '1 minute' * (200 - i) + interval '10 minutes')
    );
  END LOOP;

  -- Mid-list scroll-to-message target (sits ~message 100)
  INSERT INTO public.messages (channel_id, user_id, content, created_at)
  VALUES (v_channel, v_user, '[E2E] SCROLL TARGET — find me',
          now() - interval '100 minutes')
  RETURNING id INTO v_target_id;

  -- Newest marker (used for scroll-to-bottom assertion)
  INSERT INTO public.messages (channel_id, user_id, content, created_at)
  VALUES (v_channel, v_user, '[E2E] NEWEST MARKER', now());

  RAISE NOTICE 'Seeded oldest=%, target=%', v_oldest_id, v_target_id;
END $$;
