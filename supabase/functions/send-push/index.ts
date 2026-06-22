import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---- Google OAuth2 access token from service account ----

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${b64url(new TextEncoder().encode(JSON.stringify(header)))}.${b64url(new TextEncoder().encode(JSON.stringify(claim)))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`oauth token error: ${await res.text()}`);
  const json = await res.json();
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.token;
}

// ---- main ----

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { user_ids, title, body, data } = await req.json() as {
      user_ids: string[];
      title: string;
      body: string;
      data?: Record<string, string>;
    };

    if (!Array.isArray(user_ids) || user_ids.length === 0 || !title || !body) {
      return new Response(JSON.stringify({ error: 'user_ids, title, body required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const saJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');
    if (!saJson) {
      return new Response(JSON.stringify({ error: 'FCM not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const sa = JSON.parse(saJson) as ServiceAccount;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Filter users that have push enabled
    const { data: prefs } = await supabase
      .from('user_notification_settings')
      .select('user_id, push_enabled')
      .in('user_id', user_ids);

    const allowedIds = new Set(
      user_ids.filter(uid => {
        const p = prefs?.find(x => x.user_id === uid);
        return p ? p.push_enabled !== false : true;
      })
    );
    if (allowedIds.size === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no opt-in' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: tokens } = await supabase
      .from('device_tokens')
      .select('token, user_id, platform')
      .in('user_id', Array.from(allowedIds));

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no tokens' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getAccessToken(sa);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

    let sent = 0;
    const invalid: string[] = [];

    await Promise.all(tokens.map(async ({ token }) => {
      const payload = {
        message: {
          token,
          notification: { title, body },
          data: data ?? {},
          android: { priority: 'HIGH' as const },
          apns: { headers: { 'apns-priority': '10' }, payload: { aps: { sound: 'default' } } },
        },
      };
      const r = await fetch(fcmUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        sent++;
      } else {
        const txt = await r.text();
        // Invalid/unregistered tokens -> mark for cleanup
        if (r.status === 404 || txt.includes('UNREGISTERED') || txt.includes('INVALID_ARGUMENT')) {
          invalid.push(token);
        }
        console.error('FCM error', r.status, txt);
      }
    }));

    if (invalid.length > 0) {
      await supabase.from('device_tokens').delete().in('token', invalid);
    }

    return new Response(JSON.stringify({ sent, invalid: invalid.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-push error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
