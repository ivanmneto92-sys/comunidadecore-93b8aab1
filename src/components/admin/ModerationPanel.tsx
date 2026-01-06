import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Check, X, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ModerationReport {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
  action_taken: string | null;
  action_note: string | null;
  reviewed_at: string | null;
  message?: {
    content: string;
    user_id: string;
    channel_id: string;
    created_at: string;
  };
  reporter?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  message_author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function ModerationPanel() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data: reportsData, error } = await supabase
        .from('moderation_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data
      const reportIds = reportsData?.map(r => r.message_id) || [];
      const reporterIds = reportsData?.map(r => r.reporter_id) || [];

      const [{ data: messages }, { data: reporters }] = await Promise.all([
        supabase.from('messages').select('id, content, user_id, channel_id, created_at').in('id', reportIds),
        supabase.from('profiles').select('id, display_name, avatar_url').in('id', reporterIds)
      ]);

      // Get message authors
      const authorIds = messages?.map(m => m.user_id).filter(Boolean) || [];
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', authorIds);

      const enrichedReports = (reportsData || []).map(report => ({
        ...report,
        message: messages?.find(m => m.id === report.message_id),
        reporter: reporters?.find(r => r.id === report.reporter_id),
        message_author: authors?.find(a => a.id === messages?.find(m => m.id === report.message_id)?.user_id)
      }));

      setReports(enrichedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erro ao carregar reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: 'approved' | 'rejected', deleteMessage: boolean = false) => {
    setProcessing(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Update report
      const { error: updateError } = await supabase
        .from('moderation_reports')
        .update({
          status: action,
          action_taken: deleteMessage ? 'message_deleted' : action,
          action_note: actionNotes[reportId] || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Delete message if action approved and requested
      if (action === 'approved' && deleteMessage && report.message_id) {
        await supabase.from('messages').delete().eq('id', report.message_id);
      }

      // Log the action
      await supabase.from('admin_activity_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'moderation',
        target_resource_id: reportId,
        details: { action, delete_message: deleteMessage, note: actionNotes[reportId] }
      });

      toast.success(action === 'approved' ? 'Report aprovado' : 'Report rejeitado');
      fetchReports();
    } catch (error) {
      console.error('Error processing report:', error);
      toast.error('Erro ao processar report');
    } finally {
      setProcessing(null);
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Reports Pendentes
            {pendingReports.length > 0 && (
              <Badge variant="destructive">{pendingReports.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum report pendente 🎉
            </p>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <Card key={report.id} className="border-yellow-500/50">
                  <CardContent className="p-4 space-y-4">
                    {/* Reporter Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.reporter?.avatar_url || undefined} />
                          <AvatarFallback>{report.reporter?.display_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.reporter?.display_name} reportou</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(report.created_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="bg-destructive/10 rounded-lg p-3">
                      <p className="text-sm font-medium text-destructive">Motivo:</p>
                      <p className="text-sm">{report.reason}</p>
                    </div>

                    {/* Reported Message */}
                    {report.message && (
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Mensagem reportada:</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.message_author?.avatar_url || undefined} />
                            <AvatarFallback>{report.message_author?.display_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{report.message_author?.display_name}</p>
                            <p className="text-sm">{report.message.content}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Note */}
                    <Textarea
                      placeholder="Nota sobre a ação (opcional)..."
                      value={actionNotes[report.id] || ''}
                      onChange={(e) => setActionNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                      className="h-20"
                    />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(report.id, 'approved', true)}
                        disabled={processing === report.id}
                      >
                        {processing === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar e Deletar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(report.id, 'approved', false)}
                        disabled={processing === report.id}
                      >
                        Aprovar (manter msg)
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction(report.id, 'rejected')}
                        disabled={processing === report.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Reports History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Moderação</CardTitle>
        </CardHeader>
        <CardContent>
          {resolvedReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma ação de moderação registrada
            </p>
          ) : (
            <div className="space-y-2">
              {resolvedReports.slice(0, 10).map((report) => (
                <div key={report.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                      {report.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {report.reason.slice(0, 50)}...
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {report.reviewed_at && format(new Date(report.reviewed_at), "dd/MM HH:mm")}
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
