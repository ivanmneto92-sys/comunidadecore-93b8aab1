-- Habilitar REPLICA IDENTITY FULL para que DELETE/UPDATE
-- funcionem corretamente com filtros no realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;