import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Allowlist of paths users can call via this proxy
const ALLOWED_PATHS = new Set<string>([
  '/api/external/summary',
  '/api/external/accounts',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
      authHeader.replace('Bearer ', ''),
    );
    if (claimsErr || !claims?.claims) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const baseUrl = Deno.env.get('AURUS_API_BASE_URL');
    const apiKey = Deno.env.get('AURUS_API_KEY');
    if (!baseUrl || !apiKey) {
      return json({ error: 'Aurus API not configured' }, 500);
    }

    const url = new URL(req.url);
    const path = url.searchParams.get('path') ?? '/api/external/summary';
    if (!ALLOWED_PATHS.has(path)) {
      return json({ error: `Path not allowed: ${path}` }, 400);
    }

    // Forward remaining query params (all except `path`)
    const forward = new URLSearchParams();
    for (const [k, v] of url.searchParams.entries()) {
      if (k !== 'path') forward.append(k, v);
    }
    const qs = forward.toString();
    const target = `${baseUrl.replace(/\/$/, '')}${path}${qs ? `?${qs}` : ''}`;

    const upstream = await fetch(target, {
      headers: { 'x-api-key': apiKey, Accept: 'application/json' },
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type':
          upstream.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch (err) {
    console.error('aurus-proxy error', err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
