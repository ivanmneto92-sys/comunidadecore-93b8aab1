import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsersWeek: number;
  totalMessages: number;
  messagesThisWeek: number;
  totalChannels: number;
  activeAffiliates: number;
  pendingReports: number;
  pendingPayouts: number;
  membershipDistribution: {
    free: number;
    plus: number;
    elite: number;
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch all stats in parallel
      const [
        { count: totalUsers },
        { count: activeUsersWeek },
        { count: totalMessages },
        { count: messagesThisWeek },
        { count: totalChannels },
        { count: activeAffiliates },
        { count: pendingReports },
        { count: pendingPayouts },
        { data: memberships }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('user_id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('channels').select('*', { count: 'exact', head: true }),
        supabase.from('affiliates').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('moderation_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payout_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('memberships').select('tier')
      ]);

      const membershipDistribution = {
        free: memberships?.filter(m => m.tier === 'free').length || 0,
        plus: memberships?.filter(m => m.tier === 'plus').length || 0,
        elite: memberships?.filter(m => m.tier === 'elite').length || 0
      };

      setStats({
        totalUsers: totalUsers || 0,
        activeUsersWeek: activeUsersWeek || 0,
        totalMessages: totalMessages || 0,
        messagesThisWeek: messagesThisWeek || 0,
        totalChannels: totalChannels || 0,
        activeAffiliates: activeAffiliates || 0,
        pendingReports: pendingReports || 0,
        pendingPayouts: pendingPayouts || 0,
        membershipDistribution
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch admin stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = () => {
    fetchStats();
  };

  return { stats, loading, error, refetch };
}
