-- =====================================================
-- ÍNDICES COMPOSTOS PARA ALTA CONCORRÊNCIA
-- =====================================================

-- Índice para mensagens não lidas (evita scan completo)
CREATE INDEX IF NOT EXISTS idx_messages_channel_created_parent 
ON messages(channel_id, created_at DESC, parent_id);

-- Índice para busca de checkins por usuário/data
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date 
ON daily_checkins(user_id, checkin_date DESC);

-- Índice para reports publicados por data
CREATE INDEX IF NOT EXISTS idx_reports_daily_published 
ON reports_daily(date DESC, published_at) 
WHERE published_at IS NOT NULL;

-- Índice para reactions de mensagens
CREATE INDEX IF NOT EXISTS idx_message_reactions_message 
ON message_reactions(message_id);

-- Índice para tutorial progress
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_completed 
ON tutorial_progress(user_id, completed_at);

-- Índice para user_channel_read_status
CREATE INDEX IF NOT EXISTS idx_user_channel_read_status_user_channel
ON user_channel_read_status(user_id, channel_id);

-- Índice para user_xp
CREATE INDEX IF NOT EXISTS idx_user_xp_user
ON user_xp(user_id);

-- Índice para user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user
ON user_achievements(user_id);

-- =====================================================
-- FUNÇÃO RPC PARA MENSAGENS NÃO LIDAS (ELIMINA N+1)
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_counts(p_user_id UUID)
RETURNS TABLE(channel_id UUID, unread_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as channel_id,
    COUNT(m.id)::BIGINT as unread_count
  FROM channels c
  LEFT JOIN user_channel_read_status ucrs 
    ON ucrs.channel_id = c.id AND ucrs.user_id = p_user_id
  LEFT JOIN messages m 
    ON m.channel_id = c.id 
    AND m.parent_id IS NULL
    AND m.user_id IS DISTINCT FROM p_user_id
    AND (ucrs.last_read_at IS NULL OR m.created_at > ucrs.last_read_at)
  GROUP BY c.id
  HAVING COUNT(m.id) > 0;
END;
$$;