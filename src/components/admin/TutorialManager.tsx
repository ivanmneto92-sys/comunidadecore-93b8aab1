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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, GraduationCap, Eye, EyeOff } from 'lucide-react';

const tutorialSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  slug: z.string().min(1, 'Slug é obrigatório').max(100),
  description: z.string().optional(),
  content: z.string().optional(),
  video_url: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  tier_required: z.enum(['free', 'plus', 'elite']),
  is_published: z.boolean(),
  sort_order: z.coerce.number(),
});

type TutorialFormData = z.infer<typeof tutorialSchema>;

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
  is_published: boolean;
  sort_order: number;
}

export function TutorialManager() {
  const { toast } = useToast();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TutorialFormData>({
    resolver: zodResolver(tutorialSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      content: '',
      video_url: '',
      category: 'beginner',
      tier_required: 'free',
      is_published: false,
      sort_order: 0,
    },
  });

  const fetchTutorials = async () => {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching tutorials:', error);
    } else {
      setTutorials(data as Tutorial[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const onSubmit = async (data: TutorialFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('tutorials').insert({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        content: data.content || null,
        video_url: data.video_url || null,
        category: data.category,
        tier_required: data.tier_required,
        is_published: data.is_published,
        sort_order: data.sort_order,
      });

      if (error) throw error;

      toast({ title: 'Tutorial criado!' });
      form.reset();
      fetchTutorials();
    } catch (error) {
      console.error('Error creating tutorial:', error);
      toast({ title: 'Erro ao criar tutorial', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tutorials')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({ title: currentStatus ? 'Tutorial despublicado' : 'Tutorial publicado!' });
      fetchTutorials();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const deleteTutorial = async (id: string) => {
    try {
      const { error } = await supabase.from('tutorials').delete().eq('id', id);

      if (error) throw error;

      toast({ title: 'Tutorial excluído!' });
      fetchTutorials();
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Badge className="bg-primary/20 text-primary">Elite</Badge>;
      case 'plus':
        return <Badge className="bg-blue-500/20 text-blue-500">Plus</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Novo Tutorial
          </CardTitle>
          <CardDescription>Adicione conteúdo educacional</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Introdução ao Trading" {...field} />
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
                        <Input placeholder="intro-trading" {...field} />
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
                      <Textarea placeholder="Breve descrição do tutorial..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Vídeo (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Iniciante</SelectItem>
                          <SelectItem value="intermediate">Intermediário</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tier_required"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="plus">Plus</SelectItem>
                          <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                      </Select>
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

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Publicar imediatamente</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Tutorial
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Tutorials List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Tutoriais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tutorials.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum tutorial</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorials.map((tutorial) => (
                  <TableRow key={tutorial.id}>
                    <TableCell className="font-medium">{tutorial.title}</TableCell>
                    <TableCell>{getTierBadge(tutorial.tier_required)}</TableCell>
                    <TableCell>
                      {tutorial.is_published ? (
                        <Badge variant="default">Publicado</Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => togglePublish(tutorial.id, tutorial.is_published)}
                        >
                          {tutorial.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteTutorial(tutorial.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
