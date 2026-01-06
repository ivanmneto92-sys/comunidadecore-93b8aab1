import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, History, Shield, Crown, Megaphone, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  target_resource_id: string | null;
  details: any;
  created_at: string;
  admin?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  target_user?: {
    display_name: string | null;
  };
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('action_type', filter);
      }

      const { data: logsData, error } = await query;
      if (error) throw error;

      // Fetch admin and target user profiles
      const adminIds = [...new Set(logsData?.map(l => l.admin_id) || [])];
      const targetIds = [...new Set(logsData?.map(l => l.target_user_id).filter(Boolean) || [])];

      const [{ data: admins }, { data: targets }] = await Promise.all([
        supabase.from('profiles').select('id, display_name, avatar_url').in('id', adminIds),
        supabase.from('profiles').select('id, display_name').in('id', targetIds as string[])
      ]);

      const enrichedLogs = (logsData || []).map(log => ({
        ...log,
        admin: admins?.find(a => a.id === log.admin_id),
        target_user: targets?.find(t => t.id === log.target_user_id)
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'role_change':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'membership_change':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'broadcast':
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'moderation':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    const labels: Record<string, string> = {
      role_change: 'Role',
      membership_change: 'Membership',
      broadcast: 'Broadcast',
      moderation: 'Moderação'
    };
    return labels[actionType] || actionType;
  };

  const formatDetails = (log: ActivityLog) => {
    const details = log.details;
    if (!details) return '';

    switch (log.action_type) {
      case 'role_change':
        return `→ ${details.new_role}`;
      case 'membership_change':
        return `→ ${details.new_tier}`;
      case 'broadcast':
        return `"${details.title}" para ${details.channels === 'all' ? 'todos' : '1 canal'}`;
      case 'moderation':
        return `${details.action}${details.delete_message ? ' + deletou msg' : ''}`;
      default:
        return JSON.stringify(details);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filtrar por:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="role_change">Mudanças de Role</SelectItem>
                <SelectItem value="membership_change">Mudanças de Membership</SelectItem>
                <SelectItem value="broadcast">Broadcasts</SelectItem>
                <SelectItem value="moderation">Moderação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Logs de Atividade
            <Badge variant="outline">{logs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade registrada
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 py-3 border-b last:border-0"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={log.admin?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {log.admin?.display_name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {log.admin?.display_name || 'Admin'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getActionBadge(log.action_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.target_user && (
                        <span className="font-medium text-foreground">
                          @{log.target_user.display_name}{' '}
                        </span>
                      )}
                      {formatDetails(log)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), "dd MMM HH:mm", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
