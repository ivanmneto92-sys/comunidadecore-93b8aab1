import { supabase } from '@/integrations/supabase/client';

interface ExtractedMention {
  userId: string;
  displayName: string;
}

/**
 * Extrai menções do formato @[Display Name](user_id) do conteúdo da mensagem
 */
export function extractMentions(content: string): ExtractedMention[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: ExtractedMention[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      displayName: match[1],
      userId: match[2],
    });
  }

  return mentions.filter((mention, index, self) =>
    index === self.findIndex(m => m.userId === mention.userId)
  );
}

/**
 * Cria notificações para usuários mencionados em uma mensagem.
 * Usa a função SECURITY DEFINER `send_mention_notification`, que valida
 * server-side que o remetente é dono da mensagem.
 */
export async function createMentionNotifications({
  content,
  senderId,
  channelId,
  channelName,
  messageId,
}: {
  content: string;
  senderId: string;
  senderName: string;
  channelId: string;
  channelName: string;
  messageId?: string;
}) {
  if (!messageId) return;
  const mentions = extractMentions(content).filter(m => m.userId !== senderId);
  if (mentions.length === 0) return;

  await Promise.all(
    mentions.map(m =>
      supabase.rpc('send_mention_notification', {
        _target_user_id: m.userId,
        _message_id: messageId,
        _channel_id: channelId,
        _channel_name: channelName,
        _content: content,
      })
    )
  );
}

/**
 * Cria uma notificação quando alguém responde à mensagem de um usuário.
 * Usa a função SECURITY DEFINER `send_reply_notification`.
 */
export async function createReplyNotification({
  parentMessageUserId,
  replyContent,
  replierId,
  channelId,
  channelName,
  replyMessageId,
}: {
  parentMessageUserId: string;
  replyContent: string;
  replierId: string;
  replierName: string;
  channelId: string;
  channelName: string;
  replyMessageId?: string;
}) {
  if (!replyMessageId || parentMessageUserId === replierId) return;

  await supabase.rpc('send_reply_notification', {
    _target_user_id: parentMessageUserId,
    _reply_message_id: replyMessageId,
    _channel_id: channelId,
    _channel_name: channelName,
    _content: replyContent,
  });
}
