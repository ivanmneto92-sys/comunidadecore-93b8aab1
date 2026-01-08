import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache
let cachedNews: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

    // Fetch general market news
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const news = await response.json();
    
    // Transform and limit to 5 most recent news
    const formattedNews = news.slice(0, 5).map((item: {
      id: number;
      headline: string;
      summary: string;
      source: string;
      url: string;
      image: string;
      datetime: number;
      category: string;
    }) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: item.datetime,
      category: item.category,
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
