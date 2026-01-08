import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache
let cachedNews: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function translateHeadlines(headlines: string[]): Promise<string[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('LOVABLE_API_KEY not configured, skipping translation');
    return headlines;
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [{
          role: 'user',
          content: `Traduza estes títulos de notícias financeiras para português brasileiro de forma natural e jornalística. Retorne APENAS um JSON array com os títulos traduzidos na mesma ordem, sem explicações adicionais.

Títulos:
${JSON.stringify(headlines)}`
        }],
      }),
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status);
      return headlines;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return headlines;
    }

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const translated = JSON.parse(jsonMatch[0]);
      if (Array.isArray(translated) && translated.length === headlines.length) {
        return translated;
      }
    }
    
    return headlines;
  } catch (error) {
    console.error('Translation error:', error);
    return headlines;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Return cached data if valid
    if (cachedNews && (now - cachedNews.timestamp) < CACHE_DURATION) {
      console.log('Returning cached news');
      return new Response(JSON.stringify(cachedNews.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    // Fetch news from multiple categories in parallel
    const categories = ['forex', 'crypto', 'general'];
    const newsPromises = categories.map(category =>
      fetch(`https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    );

    const [forexNews, cryptoNews, generalNews] = await Promise.all(newsPromises);

    // Tag each news item with its category and combine
    const taggedNews = [
      ...forexNews.slice(0, 5).map((item: Record<string, unknown>) => ({ ...item, marketCategory: 'FOREX' })),
      ...cryptoNews.slice(0, 3).map((item: Record<string, unknown>) => ({ ...item, marketCategory: 'CRYPTO' })),
      ...generalNews.slice(0, 4).map((item: Record<string, unknown>) => ({ ...item, marketCategory: 'ÍNDICES' })),
    ];

    // Sort by datetime (most recent first) and take top 10
    const sortedNews = taggedNews.sort((a, b) => (b.datetime as number) - (a.datetime as number));
    const recentNews = sortedNews.slice(0, 10);
    
    // Extract headlines for translation
    const headlines = recentNews.map((item: { headline: string }) => item.headline);
    
    // Translate headlines to Portuguese
    const translatedHeadlines = await translateHeadlines(headlines);
    
    // Transform and combine with translated headlines
    const formattedNews = recentNews.map((item: {
      id: number;
      headline: string;
      summary: string;
      source: string;
      url: string;
      image: string;
      datetime: number;
      category: string;
      marketCategory: string;
    }, index: number) => ({
      id: item.id,
      headline: translatedHeadlines[index] || item.headline,
      originalHeadline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: item.datetime,
      category: item.marketCategory || 'FOREX',
    }));

    // Cache the result
    cachedNews = { data: formattedNews, timestamp: now };

    return new Response(JSON.stringify(formattedNews), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching market news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
