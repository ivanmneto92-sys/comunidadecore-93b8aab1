import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NotificationSettings {
  id: string;
  muted_channels: string[];
  notify_mentions: boolean;
  notify_replies: boolean;
  sound_enabled: boolean;
}

const defaultSettings: Omit<NotificationSettings, 'id'> = {
  muted_channels: [],
  notify_mentions: true,
  notify_replies: true,
  sound_enabled: true,
};

export function useNotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const { data: newData, error: insertError } = await supabase
          .from('user_notification_settings')
          .insert({ user_id: user.id, ...defaultSettings })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<Omit<NotificationSettings, 'id'>>) => {
    if (!user || !settings) return false;

    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }, [user, settings]);

  const muteChannel = useCallback(async (channelId: string) => {
    if (!settings) return false;
    const newMuted = [...settings.muted_channels, channelId];
    return updateSettings({ muted_channels: newMuted });
  }, [settings, updateSettings]);

  const unmuteChannel = useCallback(async (channelId: string) => {
    if (!settings) return false;
    const newMuted = settings.muted_channels.filter(id => id !== channelId);
    return updateSettings({ muted_channels: newMuted });
  }, [settings, updateSettings]);

  const isChannelMuted = useCallback((channelId: string) => {
    return settings?.muted_channels.includes(channelId) ?? false;
  }, [settings]);

  return {
    settings,
    loading,
    updateSettings,
    muteChannel,
    unmuteChannel,
    isChannelMuted,
    refetch: fetchSettings,
  };
}
