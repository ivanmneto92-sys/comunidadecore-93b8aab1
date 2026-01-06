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
import { toast } from 'sonner';
import { Megaphone, Send, Loader2, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Channel {
  id: string;
  name: string;
  slug: string;
}

interface Broadcast {
  id: string;
  title: string;
  content: string;
  channel_id: string | null;
  is_pinned: boolean;
  sent_at: string;
  channel?: { name: string };
}

export function BroadcastManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isPinned, setIsPinned] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: channelsData }, { data: broadcastsData }] = await Promise.all([
        supabase.from('channels').select('id, name, slug').order('sort_order'),
        supabase.from('broadcasts').select('*, channel:channels(name)').order('sent_at', { ascending: false }).limit(20)
      ]);

      setChannels(channelsData || []);
      setBroadcasts(broadcastsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendBroadcast = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    setSending(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Não autenticado');

      const targetChannels = selectedChannel === 'all' 
        ? channels 
        : channels.filter(c => c.id === selectedChannel);

      for (const channel of targetChannels) {
        // Create message in channel
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            channel_id: channel.id,
            user_id: user.id,
            content: `**📢 ${title}**\n\n${content}`,
            is_pinned: isPinned,
            is_bot_message: false
          })
          .select()
          .single();

        if (messageError) throw messageError;

        // Record broadcast
        await supabase.from('broadcasts').insert({
          title,
          content,
          channel_id: channel.id,
          is_pinned: isPinned,
          sent_by: user.id,
          message_id: message.id
        });
      }

      // Log the action
      await supabase.from('admin_activity_logs').insert({
        admin_id: user.id,
        action_type: 'broadcast',
        details: { 
          title, 
          channels: selectedChannel === 'all' ? 'all' : selectedChannel,
          pinned: isPinned 
        }
      });

      toast.success(`Anúncio enviado para ${targetChannels.length} canal(is)`);
      setTitle('');
      setContent('');
      setIsPinned(false);
      setSelectedChannel('all');
      fetchData();
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Erro ao enviar anúncio');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Broadcast */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Novo Anúncio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Título do anúncio..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <Textarea
              placeholder="Escreva o conteúdo do anúncio..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Canal Destino</Label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📢 Todos os canais</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    #{channel.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="pin"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
            <Label htmlFor="pin" className="flex items-center gap-1">
              <Pin className="h-4 w-4" />
              Fixar mensagem
            </Label>
          </div>

          {/* Preview */}
          {(title || content) && (
            <Card className="bg-muted">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="font-bold">📢 {title || 'Título...'}</p>
                <p className="text-sm mt-2 whitespace-pre-wrap">{content || 'Conteúdo...'}</p>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={sendBroadcast} 
            disabled={sending || !title.trim() || !content.trim()}
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
                Enviar Anúncio
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Broadcast History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Anúncios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : broadcasts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum anúncio enviado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="flex items-start justify-between py-3 border-b last:border-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{broadcast.title}</p>
                      {broadcast.is_pinned && (
                        <Badge variant="secondary" className="text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          Fixado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {broadcast.content}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      #{broadcast.channel?.name || 'Todos'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(broadcast.sent_at), "dd MMM HH:mm", { locale: ptBR })}
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
