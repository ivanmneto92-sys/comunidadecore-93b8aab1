-- Habilita pg_net se ainda não estiver
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_push_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_ids UUID[] := '{}';
  mention_name TEXT;
  mention_user UUID;
  parent_author UUID;
  author_name TEXT;
  channel_name TEXT;
  body_preview TEXT;
  fn_url TEXT;
  service_key TEXT;
BEGIN
  -- Skip bot messages
  IF NEW.is_bot_message = true THEN
    RETURN NEW;
  END IF;

  -- 1. Reply target
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_author FROM public.messages WHERE id = NEW.parent_id;
    IF parent_author IS NOT NULL AND parent_author <> NEW.user_id THEN
      recipient_ids := array_append(recipient_ids, parent_author);
    END IF;
  END IF;

  -- 2. Mentions: extract @display_name tokens, resolve to user_id
  FOR mention_name IN
    SELECT DISTINCT substring(m[1] FROM 2)
    FROM regexp_matches(COALESCE(NEW.content,''), '(@[A-Za-z0-9_\.\-]{2,32})', 'g') AS m
  LOOP
    SELECT id INTO mention_user
    FROM public.profiles
    WHERE lower(display_name) = lower(mention_name)
    LIMIT 1;
    IF mention_user IS NOT NULL AND mention_user <> NEW.user_id THEN
      recipient_ids := array_append(recipient_ids, mention_user);
    END IF;
  END LOOP;

  -- Dedup
  SELECT ARRAY(SELECT DISTINCT unnest(recipient_ids)) INTO recipient_ids;

  IF array_length(recipient_ids, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Build payload
  SELECT display_name INTO author_name FROM public.profiles WHERE id = NEW.user_id;
  SELECT name INTO channel_name FROM public.channels WHERE id = NEW.channel_id;
  body_preview := COALESCE(author_name,'Alguém') || ': ' || left(regexp_replace(COALESCE(NEW.content,''), E'[\\n\\r]+', ' ', 'g'), 140);

  fn_url := current_setting('app.supabase_url', true);
  IF fn_url IS NULL OR fn_url = '' THEN
    fn_url := 'https://qjiezjkvszaaehnuoypl.supabase.co';
  END IF;
  service_key := current_setting('app.service_role_key', true);

  PERFORM extensions.http_post(
    url := fn_url || '/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
    ),
    body := jsonb_build_object(
      'user_ids', to_jsonb(recipient_ids),
      'title', COALESCE('#' || channel_name, 'Nova mensagem'),
      'body', body_preview,
      'data', jsonb_build_object(
        'channel_id', NEW.channel_id::text,
        'message_id', NEW.id::text,
        'type', CASE WHEN NEW.parent_id IS NOT NULL THEN 'reply' ELSE 'mention' END
      )
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block message insert on push error
  RAISE WARNING 'notify_push_on_message failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_push_on_message ON public.messages;
CREATE TRIGGER trg_notify_push_on_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_push_on_message();