import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { getToken, onMessage } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getMessagingIfSupported, VAPID_KEY } from '@/lib/firebase';

type Status = 'idle' | 'unsupported' | 'denied' | 'registering' | 'registered' | 'error';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const mql = window.matchMedia?.('(display-mode: standalone)').matches;
  // iOS Safari
  // @ts-expect-error legacy
  const iosStandalone = window.navigator.standalone === true;
  return Boolean(mql || iosStandalone);
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Web push registration via Firebase Cloud Messaging.
 * No-op on Capacitor native (handled by useDevicePushRegistration).
 */
export function useWebPushRegistration() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [error, setError] = useState<string | null>(null);

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    !Capacitor.isNativePlatform();

  // iOS only allows web push when the PWA is installed to the home screen
  const iosRequiresInstall = isIOS() && !isStandalone();

  const enable = useCallback(async () => {
    if (!user) return;
    if (!supported || iosRequiresInstall) {
      setStatus('unsupported');
      return;
    }
    try {
      setStatus('registering');
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope',
      });

      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        setStatus('unsupported');
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg,
      });
      if (!token) {
        setStatus('error');
        setError('Não foi possível obter o token de push.');
        return;
      }

      await supabase.from('device_tokens').upsert(
        {
          user_id: user.id,
          token,
          platform: 'web',
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );

      // Foreground messages -> show local notification
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || 'INSTITUTO TRADER';
        const body = payload.notification?.body || payload.data?.body || '';
        try {
          new Notification(title, { body, icon: '/app-icon.png' });
        } catch {
          // ignore
        }
      });

      setStatus('registered');
    } catch (e) {
      console.error('web push register failed', e);
      setError(String(e));
      setStatus('error');
    }
  }, [user, supported, iosRequiresInstall]);

  useEffect(() => {
    if (!supported) setStatus('unsupported');
  }, [supported]);

  return { status, permission, error, enable, supported, iosRequiresInstall };
}
