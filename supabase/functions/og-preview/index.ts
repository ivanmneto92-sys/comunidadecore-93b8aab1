import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_TTL_DAYS = 7;
const MAX_HTML_BYTES = 512 * 1024; // 512 KB
const FETCH_TIMEOUT_MS = 6000;

interface Preview {
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
}

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
  // IPv4 private/loopback ranges
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  // IPv6 loopback / link-local
  if (h === '::1' || h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  return false;
}

function validateUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (isPrivateHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function metaContent(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1]).trim().slice(0, 500);
  }
  return null;
}

function parseOg(url: URL, html: string): Preview {
  const head = html.slice(0, MAX_HTML_BYTES);
  const title =
    metaContent(head, [
      /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
      /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
      /<meta\s+[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]);
  const description = metaContent(head, [
    /<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s+[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i,
  ]);
  let image = metaContent(head, [
    /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
  ]);
  if (image && !/^https?:\/\//i.test(image)) {
    try { image = new URL(image, url.origin).toString(); } catch { image = null; }
  }
  const site = metaContent(head, [
    /<meta\s+[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i,
  ]) || url.hostname;

  return {
    url: url.toString(),
    title,
    description,
    image_url: image,
    site_name: site,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim() ?? '';
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { url: rawUrl } = await req.json();
    if (typeof rawUrl !== 'string') {
      return new Response(JSON.stringify({ error: 'url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const url = validateUrl(rawUrl);
    if (!url) {
      return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }


    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const normalized = url.toString();

    // Cache lookup
    const { data: cached } = await supabase
      .from('link_previews')
      .select('*')
      .eq('url', normalized)
      .maybeSingle();

    if (cached) {
      const ageMs = Date.now() - new Date(cached.fetched_at).getTime();
      if (ageMs < CACHE_TTL_DAYS * 86400_000) {
        return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Fetch with timeout
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let html = '';
    try {
      const res = await fetch(normalized, {
        method: 'GET',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CoreHubBot/1.0; +https://meoocore.com)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(t);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('text/html')) {
        return new Response(JSON.stringify({ error: 'not html' }), { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Re-validate final URL after redirect
      const finalUrl = validateUrl(res.url);
      if (!finalUrl) {
        return new Response(JSON.stringify({ error: 'invalid redirect' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const buf = await res.arrayBuffer();
      html = new TextDecoder().decode(buf.slice(0, MAX_HTML_BYTES));
    } catch (e) {
      clearTimeout(t);
      return new Response(JSON.stringify({ error: 'fetch failed' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const preview = parseOg(url, html);

    await supabase.from('link_previews').upsert({
      ...preview,
      fetched_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify(preview), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
