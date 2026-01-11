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

  // Remove duplicates
  return mentions.filter((mention, index, self) => 
    index === self.findIndex(m => m.userId === mention.userId)
  );
}

/**
 * Cria notificações para usuários mencionados em uma mensagem
 */
export async function createMentionNotifications({
  content,
  senderId,
  senderName,
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
  const mentions = extractMentions(content);
  
  if (mentions.length === 0) return;

  // Filter out self-mentions
  const validMentions = mentions.filter(m => m.userId !== senderId);
  
  if (validMentions.length === 0) return;

  // Check notification settings for each mentioned user
  const { data: settingsData } = await supabase
    .from('user_notification_settings')
    .select('user_id, notify_mentions, muted_channels')
    .in('user_id', validMentions.map(m => m.userId));

  const settingsMap = new Map(
    (settingsData || []).map(s => [s.user_id, s])
  );

  // Create notifications for users who have mentions enabled
  const notificationsToCreate = validMentions
    .filter(mention => {
      const settings = settingsMap.get(mention.userId);
      // If no settings, default to enabled
      if (!settings) return true;
      // Check if mentions are enabled and channel is not muted
      if (!settings.notify_mentions) return false;
      if (settings.muted_channels?.includes(channelId)) return false;
      return true;
    })
    .map(mention => ({
      user_id: mention.userId,
      type: 'mention',
      title: `${senderName} mencionou você`,
      message: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      link: `/community?channel=${channelName}`,
      related_message_id: messageId || null,
      related_channel_id: channelId,
    }));

  if (notificationsToCreate.length > 0) {
    await supabase.from('notifications').insert(notificationsToCreate);
  }
}
