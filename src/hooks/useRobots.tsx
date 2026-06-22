import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Robot {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  cover_url: string | null;
  screenshots: string[];
  platform: string;
  pairs: string[];
  timeframe: string | null;
  min_deposit: number | null;
  risk_level: string;
  external_url: string | null;
  external_cta_label: string;
  tier_required: 'free' | 'plus' | 'elite';
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// supabase types may not include robots yet — use loose typed client
const sb = supabase as unknown as {
  from: (t: string) => any;
};

export function useRobots() {
  return useQuery({
    queryKey: ['robots', 'published'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('robots')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Robot[];
    },
  });
}

export function useRobot(slug: string | undefined) {
  return useQuery({
    queryKey: ['robots', 'slug', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await sb
        .from('robots')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as Robot | null;
    },
  });
}

export function useAllRobotsAdmin() {
  return useQuery({
    queryKey: ['robots', 'admin', 'all'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('robots')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Robot[];
    },
  });
}
