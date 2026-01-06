import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageSquare, Hash, UserCheck, AlertTriangle, CreditCard, Crown, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { label: 'Ativos (7 dias)', value: stats.activeUsersWeek, icon: UserCheck, color: 'text-green-500' },
    { label: 'Total Mensagens', value: stats.totalMessages, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Msgs Semana', value: stats.messagesThisWeek, icon: TrendingUp, color: 'text-cyan-500' },
    { label: 'Canais', value: stats.totalChannels, icon: Hash, color: 'text-orange-500' },
    { label: 'Afiliados Ativos', value: stats.activeAffiliates, icon: Crown, color: 'text-yellow-500' },
    { 
      label: 'Reports Pendentes', 
      value: stats.pendingReports, 
      icon: AlertTriangle, 
      color: 'text-red-500',
      urgent: stats.pendingReports > 0 
    },
    { 
      label: 'Saques Pendentes', 
      value: stats.pendingPayouts, 
      icon: CreditCard, 
      color: 'text-emerald-500',
      urgent: stats.pendingPayouts > 0 
    }
  ];

  const pieData = [
    { name: 'Free', value: stats.membershipDistribution.free, color: 'hsl(var(--muted-foreground))' },
    { name: 'Plus', value: stats.membershipDistribution.plus, color: 'hsl(var(--primary))' },
    { name: 'Elite', value: stats.membershipDistribution.elite, color: 'hsl(45, 100%, 50%)' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className={stat.urgent ? 'border-destructive' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              {stat.urgent && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Ação necessária
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Membership Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pieData.map((tier) => (
                <div key={tier.name} className="flex items-center gap-3">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-sm font-medium">{tier.name}</span>
                  <span className="text-sm text-muted-foreground">({tier.value})</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.pendingReports > 0 && (
              <Badge variant="destructive" className="cursor-pointer">
                {stats.pendingReports} reports para revisar
              </Badge>
            )}
            {stats.pendingPayouts > 0 && (
              <Badge variant="outline" className="cursor-pointer border-yellow-500 text-yellow-500">
                {stats.pendingPayouts} saques pendentes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
