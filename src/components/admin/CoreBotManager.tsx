import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bot, Send, Loader2, Pin, Clock, FileText, Plus, Trash2, Edit, Calendar, Play, Pause, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Channel {
  id: string;
  name: string;
  slug: string;
}

interface BotTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: unknown[];
  is_active: boolean;
  created_at: string;
}

interface ScheduledPost {
  id: string;
  template_id: string | null;
  channel_id: string;
  content: string;
  scheduled_for: string;
  status: string;
  repeat_type: string | null;
  is_pinned: boolean;
  executed_at: string | null;
  created_at: string;
  channel?: { name: string; slug: string };
}

export function CoreBotManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Quick message form
  const [quickContent, setQuickContent] = useState('');
  const [quickChannel, setQuickChannel] = useState<string>('');
  const [quickPinned, setQuickPinned] = useState(false);

  // Template form
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BotTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateCategory, setTemplateCategory] = useState('geral');

  // Schedule form
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleChannel, setScheduleChannel] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedulePinned, setSchedulePinned] = useState(false);
  const [scheduleRepeat, setScheduleRepeat] = useState<string>('none');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: channelsData }, { data: templatesData }, { data: scheduledData }] = await Promise.all([
        supabase.from('channels').select('id, name, slug').order('sort_order'),
        supabase.from('bot_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('scheduled_posts').select('*, channel:channels(name, slug)').order('scheduled_for', { ascending: true })
      ]);

      setChannels(channelsData || []);
      setTemplates((templatesData || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : []
      })));
      setScheduledPosts(scheduledData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick send bot message
  const sendQuickMessage = async () => {
    if (!quickContent.trim() || !quickChannel) {
      toast.error('Selecione um canal e escreva a mensagem');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: quickChannel,
          user_id: null,
          content: quickContent,
          is_pinned: quickPinned,
          is_bot_message: true
        });

      if (error) throw error;

      toast.success('Mensagem do INSTITUTO TRADER Bot enviada!');
      setQuickContent('');
      setQuickPinned(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  // Template CRUD
  const saveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toast.error('Preencha nome e conteúdo do template');
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (editingTemplate) {
        const { error } = await supabase
          .from('bot_templates')
          .update({
            name: templateName,
            content: templateContent,
            category: templateCategory
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template atualizado!');
      } else {
        const { error } = await supabase
          .from('bot_templates')
          .insert({
            name: templateName,
            content: templateContent,
            category: templateCategory,
            created_by: user?.id
          });

        if (error) throw error;
        toast.success('Template criado!');
      }

      setTemplateDialogOpen(false);
      resetTemplateForm();
      fetchData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from('bot_templates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Template removido');
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erro ao remover template');
    }
  };

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
    setTemplateCategory('geral');
  };

  const editTemplate = (template: BotTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setTemplateCategory(template.category);
    setTemplateDialogOpen(true);
  };

  // Schedule CRUD
  const saveScheduledPost = async () => {
    if (!scheduleContent.trim() || !scheduleChannel || !scheduleDate || !scheduleTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
    if (!isFuture(scheduledFor)) {
      toast.error('A data/hora deve ser no futuro');
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          content: scheduleContent,
          channel_id: scheduleChannel,
          scheduled_for: scheduledFor.toISOString(),
          is_pinned: schedulePinned,
          repeat_type: scheduleRepeat === 'none' ? null : scheduleRepeat,
          template_id: selectedTemplateId || null,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Postagem agendada!');
      setScheduleDialogOpen(false);
      resetScheduleForm();
      fetchData();
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Erro ao agendar postagem');
    }
  };

  const resetScheduleForm = () => {
    setScheduleContent('');
    setScheduleChannel('');
    setScheduleDate('');
    setScheduleTime('');
    setSchedulePinned(false);
    setScheduleRepeat('none');
    setSelectedTemplateId('');
  };

  const cancelScheduledPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Agendamento cancelado');
      fetchData();
    } catch (error) {
      console.error('Error cancelling post:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const executeScheduledPost = async (post: ScheduledPost) => {
    try {
      // Send the message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          channel_id: post.channel_id,
          user_id: null,
          content: post.content,
          is_pinned: post.is_pinned,
          is_bot_message: true
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Update scheduled post status
      await supabase
        .from('scheduled_posts')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          message_id: message.id
        })
        .eq('id', post.id);

      toast.success('Postagem executada manualmente!');
      fetchData();
    } catch (error) {
      console.error('Error executing post:', error);
      toast.error('Erro ao executar postagem');
    }
  };

  const useTemplateForSchedule = (template: BotTemplate) => {
    setSelectedTemplateId(template.id);
    setScheduleContent(template.content);
    setScheduleDialogOpen(true);
  };

  const getStatusBadge = (status: string, scheduledFor: string) => {
    if (status === 'executed') {
      return <Badge variant="default" className="bg-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Executado</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Cancelado</Badge>;
    }
    if (isPast(parseISO(scheduledFor))) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    return <Badge variant="outline" className="border-primary/50 text-primary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4 text-center">
            <Bot className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{templates.length}</p>
            <p className="text-xs text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{scheduledPosts.filter(p => p.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Agendados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">{scheduledPosts.filter(p => p.status === 'executed').length}</p>
            <p className="text-xs text-muted-foreground">Executados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick" className="flex items-center gap-1.5">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Mensagem Rápida</span>
            <span className="sm:hidden">Rápida</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Agendamentos</span>
            <span className="sm:hidden">Agenda</span>
          </TabsTrigger>
        </TabsList>

        {/* Quick Message Tab */}
        <TabsContent value="quick" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Enviar Mensagem do INSTITUTO TRADER Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Canal Destino</Label>
                <Select value={quickChannel} onValueChange={setQuickChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um canal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        #{channel.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  placeholder="Digite a mensagem do bot..."
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  className="min-h-32"
                />
                <p className="text-xs text-muted-foreground">
                  Suporta Markdown: **negrito**, *itálico*, `código`
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="quick-pin"
                  checked={quickPinned}
                  onCheckedChange={setQuickPinned}
                />
                <Label htmlFor="quick-pin" className="flex items-center gap-1">
                  <Pin className="h-4 w-4" />
                  Fixar mensagem
                </Label>
              </div>

              <Button 
                onClick={sendQuickMessage} 
                disabled={sending || !quickContent.trim() || !quickChannel}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar como INSTITUTO TRADER Bot
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Templates de Mensagem</h3>
            <Dialog open={templateDialogOpen} onOpenChange={(open) => {
              setTemplateDialogOpen(open);
              if (!open) resetTemplateForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      placeholder="Ex: Bom dia traders"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">📌 Geral</SelectItem>
                        <SelectItem value="boas-vindas">👋 Boas-vindas</SelectItem>
                        <SelectItem value="resultados">📊 Resultados</SelectItem>
                        <SelectItem value="avisos">⚠️ Avisos</SelectItem>
                        <SelectItem value="motivacional">🔥 Motivacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea
                      placeholder="Digite o conteúdo do template..."
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      className="min-h-32"
                    />
                  </div>
                  <Button onClick={saveTemplate} className="w-full">
                    {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum template criado ainda</p>
                <p className="text-sm">Crie templates para agilizar suas postagens</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{template.name}</h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button aria-label="Horário"
                          size="icon"
                          variant="ghost"
                          onClick={() => useTemplateForSchedule(template)}
                          title="Agendar com este template"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button aria-label="Editar"
                          size="icon"
                          variant="ghost"
                          onClick={() => editTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button aria-label="Excluir"
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Postagens Agendadas</h3>
            <Dialog open={scheduleDialogOpen} onOpenChange={(open) => {
              setScheduleDialogOpen(open);
              if (!open) resetScheduleForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agendar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agendar Postagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Canal</Label>
                    <Select value={scheduleChannel} onValueChange={setScheduleChannel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um canal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            #{channel.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Usar Template (opcional)</Label>
                      <Select value={selectedTemplateId} onValueChange={(id) => {
                        setSelectedTemplateId(id);
                        const t = templates.find(t => t.id === id);
                        if (t) setScheduleContent(t.content);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea
                      placeholder="Digite a mensagem..."
                      value={scheduleContent}
                      onChange={(e) => setScheduleContent(e.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora</Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Repetir</Label>
                    <Select value={scheduleRepeat} onValueChange={setScheduleRepeat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Não repetir</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="schedule-pin"
                      checked={schedulePinned}
                      onCheckedChange={setSchedulePinned}
                    />
                    <Label htmlFor="schedule-pin" className="flex items-center gap-1">
                      <Pin className="h-4 w-4" />
                      Fixar mensagem
                    </Label>
                  </div>

                  <Button onClick={saveScheduledPost} className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Postagem
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {scheduledPosts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento</p>
                <p className="text-sm">Agende postagens automáticas do INSTITUTO TRADER Bot</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <Card key={post.id} className={post.status === 'cancelled' ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getStatusBadge(post.status, post.scheduled_for)}
                          <Badge variant="outline" className="text-xs">
                            #{post.channel?.slug}
                          </Badge>
                          {post.is_pinned && (
                            <Badge variant="secondary" className="text-xs">
                              <Pin className="h-3 w-3 mr-1" />
                              Fixado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 my-2">
                          {post.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          📅 {format(parseISO(post.scheduled_for), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                          {post.repeat_type && (
                            <span className="ml-2">🔁 {post.repeat_type}</span>
                          )}
                        </p>
                      </div>
                      {post.status === 'pending' && (
                        <div className="flex gap-1 shrink-0">
                          <Button aria-label="Reproduzir"
                            size="icon"
                            variant="ghost"
                            onClick={() => executeScheduledPost(post)}
                            title="Executar agora"
                          >
                            <Play className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button aria-label="Pausar"
                            size="icon"
                            variant="ghost"
                            onClick={() => cancelScheduledPost(post.id)}
                            title="Cancelar"
                          >
                            <Pause className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}