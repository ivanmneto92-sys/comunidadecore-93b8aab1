import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { getAffiliateLevel } from '@/lib/affiliateLevels';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_earnings: number;
  referral_count: number;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function AffiliateLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get affiliates with their referral counts
      const { data: affiliates } = await supabase
        .from('affiliates')
        .select(`
          id,
          user_id,
          total_earnings,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('total_earnings', { ascending: false })
        .limit(10);

      if (affiliates) {
        // Get referral counts for each affiliate
        const affiliateIds = affiliates.map((a) => a.id);
        const { data: referralCounts } = await supabase
          .from('referrals')
          .select('affiliate_id')
          .in('affiliate_id', affiliateIds)
          .eq('status', 'converted');

        const countMap = new Map<string, number>();
        referralCounts?.forEach((r) => {
          countMap.set(r.affiliate_id, (countMap.get(r.affiliate_id) || 0) + 1);
        });

        const leadersData: LeaderboardEntry[] = affiliates.map((a) => ({
          id: a.id,
          user_id: a.user_id,
          total_earnings: a.total_earnings,
          referral_count: countMap.get(a.id) || 0,
          profile: a.profiles as LeaderboardEntry['profile'],
        }));

        setLeaders(leadersData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20';
      case 2:
        return 'bg-gradient-to-r from-slate-400/10 to-transparent border-slate-400/20';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/20';
      default:
        return 'bg-card border-border/50';
    }
  };

  const anonymizeName = (name: string | null): string => {
    if (!name) return 'Afiliado';
    if (name.length <= 3) return name;
    return name.substring(0, 2) + '***' + name.substring(name.length - 1);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Top Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  if (leaders.length === 0) {
    return (
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Top Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum afiliado ainda
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Top Afiliados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-4">
        {leaders.map((leader, index) => {
          const rank = index + 1;
          const level = getAffiliateLevel(leader.referral_count);

          return (
            <div
              key={leader.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${getRankBg(rank)}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              <Avatar className="w-8 h-8">
                <AvatarImage src={leader.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {leader.profile?.display_name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>

              {/* Name & Level */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {anonymizeName(leader.profile?.display_name)}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{level.icon}</span>
                  <span className="text-xs text-muted-foreground">{level.name}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  R$ {leader.total_earnings.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {leader.referral_count} indicações
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
