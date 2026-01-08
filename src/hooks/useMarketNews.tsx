import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: number;
  headline: string;
  originalHeadline?: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  category: string;
}

const fetchMarketNews = async (): Promise<NewsItem[]> => {
  const { data, error } = await supabase.functions.invoke('market-news');
  
  if (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
  
  return data as NewsItem[];
};

export function useMarketNews() {
  return useQuery({
    queryKey: ['market-news'],
    queryFn: fetchMarketNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    retry: 2,
  });
}
