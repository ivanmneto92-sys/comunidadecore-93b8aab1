import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, MessageSquare, Lock, Bot } from 'lucide-react';

const channelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  slug: z.string().min(1, 'Slug é obrigatório').max(50),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  is_admin_only: z.boolean(),
  is_bot_only: z.boolean(),
  sort_order: z.coerce.number(),
});

type ChannelFormData = z.infer<typeof channelSchema>;

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string;
  is_admin_only: boolean;
  is_bot_only: boolean;
  sort_order: number;
}

export function ChannelManager() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      category: 'general',
      is_admin_only: false,
      is_bot_only: false,
      sort_order: 0,
    },
  });

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', error);
    } else {
      setChannels(data as Channel[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const onSubmit = async (data: ChannelFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('channels').insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
        category: data.category,
        is_admin_only: data.is_admin_only,
        is_bot_only: data.is_bot_only,
        sort_order: data.sort_order,
      });

      if (error) throw error;

      toast({ title: 'Canal criado!' });
      form.reset();
      fetchChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({ title: 'Erro ao criar canal', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteChannel = async (id: string) => {
    try {
      const { error } = await supabase.from('channels').delete().eq('id', id);

      if (error) throw error;

      toast({ title: 'Canal excluído!' });
      fetchChannels();
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Novo Canal
          </CardTitle>
          <CardDescription>Crie canais de comunidade</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Geral" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="geral" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do canal..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícone (emoji)</FormLabel>
                      <FormControl>
                        <Input placeholder="💬" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="general" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_admin_only"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <FormLabel className="!mt-0">Somente Admin</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_bot_only"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <FormLabel className="!mt-0">Somente Bot</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Canal
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Channels List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Canais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : channels.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum canal</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {channel.icon && <span>{channel.icon}</span>}
                        <span className="font-medium">{channel.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{channel.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {channel.is_admin_only && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Admin
                          </Badge>
                        )}
                        {channel.is_bot_only && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Bot className="h-3 w-3" /> Bot
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteChannel(channel.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
