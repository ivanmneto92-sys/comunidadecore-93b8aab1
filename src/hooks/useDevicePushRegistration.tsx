import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Status = 'idle' | 'unsupported' | 'denied' | 'registering' | 'registered' | 'error';

/**
 * Registers the current device's push token with the backend.
 * Only runs on native (iOS/Android) Capacitor platforms.
 * On web it returns status='unsupported'.
 */
export function useDevicePushRegistration() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    if (!user) return;
    if (!Capacitor.isNativePlatform()) {
      setStatus('unsupported');
      return;
    }

    try {
      setStatus('registering');
      const { PushNotifications } = await import('@capacitor/push-notifications');

      const perm = await PushNotifications.checkPermissions();
      let receive = perm.receive;
      if (receive !== 'granted') {
        const req = await PushNotifications.requestPermissions();
        receive = req.receive;
      }
      if (receive !== 'granted') {
        setStatus('denied');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const onReg = PushNotifications.addListener('registration', async (t) => {
          try {
            const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
            await supabase.from('device_tokens').upsert(
              { user_id: user.id, token: t.value, platform, last_seen_at: new Date().toISOString() },
              { onConflict: 'token' },
            );
            setStatus('registered');
            (await onReg).remove();
            (await onErr).remove();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
        const onErr = PushNotifications.addListener('registrationError', (e) => {
          setError(String(e?.error ?? e));
          setStatus('error');
          reject(new Error(String(e?.error ?? e)));
        });
        void PushNotifications.register();
      });
    } catch (e) {
      console.error('push registration failed', e);
      setError(String(e));
      setStatus('error');
    }
  }, [user]);

  // Auto-register on mount when user is present
  useEffect(() => {
    if (user && Capacitor.isNativePlatform()) {
      void register();
    } else if (user) {
      setStatus('unsupported');
    }
  }, [user, register]);

  return { status, error, register };
}
