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
import { Loader2, Plus, Trash2, GraduationCap, Eye, EyeOff, Pencil, X, Video, VideoOff, Link, Brain } from 'lucide-react';
import { QuizEditor } from './QuizEditor';

const tutorialSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100),
  slug: z.string().min(1, 'Slug é obrigatório').max(100),
  description: z.string().optional(),
  content: z.string().optional(),
  video_url: z.string().optional(),
  category_id: z.string().optional(),
  tier_required: z.enum(['free', 'plus', 'elite']),
  is_published: z.boolean(),
  sort_order: z.coerce.number(),
  cta_url: z.string().optional(),
  cta_label: z.string().optional(),
});

type TutorialFormData = z.infer<typeof tutorialSchema>;

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  category_id: string | null;
  tier_required: 'free' | 'plus' | 'elite';
  is_published: boolean;
  sort_order: number;
  cta_url: string | null;
  cta_label: string | null;
  category_name?: string;
}

interface TutorialCategory {
  id: string;
  name: string;
  icon: string | null;
}

export function TutorialManager() {
  const { toast } = useToast();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<TutorialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizEditor, setQuizEditor] = useState<{ id: string; title: string } | null>(null);

  const form = useForm<TutorialFormData>({
    resolver: zodResolver(tutorialSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      content: '',
      video_url: '',
      category_id: '',
      tier_required: 'free',
      is_published: false,
      sort_order: 0,
      cta_url: '',
      cta_label: '',
    },
  });

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('tutorial_categories')
      .select('id, name, icon')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchTutorials = async () => {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        id, title, slug, description, content, video_url, 
        category_id, tier_required, is_published, sort_order,
        cta_url, cta_label,
        tutorial_categories(name)
      `)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching tutorials:', error);
    } else {
      const tutorialsWithCategoryName = (data || []).map((t: any) => ({
        ...t,
        category_name: t.tutorial_categories?.name || null,
      }));
      setTutorials(tutorialsWithCategoryName);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchTutorials();
  }, []);

  const onSubmit = async (data: TutorialFormData) => {
    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing tutorial
        const { error } = await supabase
          .from('tutorials')
          .update({
            title: data.title,
            slug: data.slug,
            description: data.description || null,
            content: data.content || null,
            video_url: data.video_url || null,
            category_id: data.category_id || null,
            tier_required: data.tier_required,
            is_published: data.is_published,
            sort_order: data.sort_order,
            cta_url: data.cta_url || null,
            cta_label: data.cta_label || null,
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({ title: 'Tutorial atualizado!' });
        setEditingId(null);
      } else {
        // Create new tutorial
        const { error } = await supabase.from('tutorials').insert({
          title: data.title,
          slug: data.slug,
          description: data.description || null,
          content: data.content || null,
          video_url: data.video_url || null,
          category_id: data.category_id || null,
          tier_required: data.tier_required,
          is_published: data.is_published,
          sort_order: data.sort_order,
          cta_url: data.cta_url || null,
          cta_label: data.cta_label || null,
        });

        if (error) throw error;

        toast({ title: 'Tutorial criado!' });
      }

      form.reset();
      fetchTutorials();
    } catch (error) {
      console.error('Error saving tutorial:', error);
      toast({ title: 'Erro ao salvar tutorial', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (tutorial: Tutorial) => {
    setEditingId(tutorial.id);
    form.reset({
      title: tutorial.title,
      slug: tutorial.slug,
      description: tutorial.description || '',
      content: tutorial.content || '',
      video_url: tutorial.video_url || '',
      category_id: tutorial.category_id || '',
      tier_required: tutorial.tier_required,
      is_published: tutorial.is_published,
      sort_order: tutorial.sort_order,
      cta_url: tutorial.cta_url || '',
      cta_label: tutorial.cta_label || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    form.reset({
      title: '',
      slug: '',
      description: '',
      content: '',
      video_url: '',
      category_id: '',
      tier_required: 'free',
      is_published: false,
      sort_order: 0,
      cta_url: '',
      cta_label: '',
    });
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
      if (editingId === id) {
        cancelEditing();
      }
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

  const getYouTubeId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {editingId ? 'Editar Tutorial' : 'Novo Tutorial'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize o conteúdo do tutorial' : 'Adicione conteúdo educacional'}
              </CardDescription>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
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
                    <FormLabel className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      URL do Vídeo (YouTube)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    {field.value && getYouTubeId(field.value) && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-border">
                        <img 
                          src={`https://img.youtube.com/vi/${getYouTubeId(field.value)}/mqdefault.jpg`}
                          alt="Thumbnail do vídeo"
                          className="w-full max-w-xs"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo (suporta quebras de linha)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conteúdo do tutorial..."
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={(val) => field.onChange(val === '__none__' ? '' : val)} value={field.value || '__none__'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Sem categoria</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

              {/* CTA Link Section */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link className="h-4 w-4" />
                  Link Externo (CTA) - Opcional
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cta_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cta_label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="Abrir conta na corretora" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                ) : editingId ? (
                  <Pencil className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {editingId ? 'Salvar Alterações' : 'Criar Tutorial'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Tutorials List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Tutoriais ({tutorials.length})</CardTitle>
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
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorials.map((tutorial) => (
                  <TableRow key={tutorial.id} className={editingId === tutorial.id ? 'bg-muted/50' : ''}>
                    <TableCell className="font-medium">
                      <div>
                        {tutorial.title}
                        <p className="text-xs text-muted-foreground">{tutorial.category_name || 'Sem categoria'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tutorial.video_url ? (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-status-positive" />
                          {getYouTubeId(tutorial.video_url) && (
                            <img 
                              src={`https://img.youtube.com/vi/${getYouTubeId(tutorial.video_url)}/default.jpg`}
                              alt=""
                              className="h-8 w-14 object-cover rounded"
                            />
                          )}
                        </div>
                      ) : (
                        <VideoOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
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
                          onClick={() => startEditing(tutorial)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setQuizEditor({ id: tutorial.id, title: tutorial.title })}
                          title="Quiz"
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => togglePublish(tutorial.id, tutorial.is_published)}
                          title={tutorial.is_published ? 'Despublicar' : 'Publicar'}
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
                          title="Excluir"
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

      {quizEditor && (
        <QuizEditor
          tutorialId={quizEditor.id}
          tutorialTitle={quizEditor.title}
          open={!!quizEditor}
          onClose={() => setQuizEditor(null)}
        />
      )}
    </div>
  );
}
