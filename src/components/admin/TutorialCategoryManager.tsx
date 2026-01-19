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
import { Loader2, Plus, Trash2, FolderOpen, Pencil, X, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  slug: z.string().min(1, 'Slug é obrigatório').max(50),
  description: z.string().optional(),
  icon: z.string().max(10).optional(),
  sort_order: z.coerce.number(),
  is_visible: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface TutorialCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
  tutorial_count?: number;
}

export function TutorialCategoryManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<TutorialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '📚',
      sort_order: 0,
      is_visible: true,
    },
  });

  const fetchCategories = async () => {
    // Fetch categories with tutorial count
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('tutorial_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      setLoading(false);
      return;
    }

    // Fetch tutorial counts per category
    const { data: tutorialsData } = await supabase
      .from('tutorials')
      .select('category_id');

    const countMap: Record<string, number> = {};
    tutorialsData?.forEach((t) => {
      if (t.category_id) {
        countMap[t.category_id] = (countMap[t.category_id] || 0) + 1;
      }
    });

    const categoriesWithCount = (categoriesData || []).map((cat) => ({
      ...cat,
      tutorial_count: countMap[cat.id] || 0,
    }));

    setCategories(categoriesWithCount);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('tutorial_categories')
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description || null,
            icon: data.icon || '📚',
            sort_order: data.sort_order,
            is_visible: data.is_visible,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Categoria atualizada!' });
        setEditingId(null);
      } else {
        const { error } = await supabase.from('tutorial_categories').insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || '📚',
          sort_order: data.sort_order,
          is_visible: data.is_visible,
        });

        if (error) throw error;
        toast({ title: 'Categoria criada!' });
      }

      form.reset({
        name: '',
        slug: '',
        description: '',
        icon: '📚',
        sort_order: categories.length,
        is_visible: true,
      });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({ title: 'Erro ao salvar categoria', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (category: TutorialCategory) => {
    setEditingId(category.id);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '📚',
      sort_order: category.sort_order,
      is_visible: category.is_visible,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    form.reset({
      name: '',
      slug: '',
      description: '',
      icon: '📚',
      sort_order: categories.length,
      is_visible: true,
    });
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tutorial_categories')
        .update({ is_visible: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast({ title: currentStatus ? 'Categoria ocultada' : 'Categoria visível!' });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('tutorial_categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Categoria excluída!' });
      if (editingId === id) cancelEditing();
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const moveCategory = async (id: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const currentCategory = categories[idx];
    const swapCategory = categories[newIdx];

    try {
      await Promise.all([
        supabase
          .from('tutorial_categories')
          .update({ sort_order: swapCategory.sort_order })
          .eq('id', currentCategory.id),
        supabase
          .from('tutorial_categories')
          .update({ sort_order: currentCategory.sort_order })
          .eq('id', swapCategory.id),
      ]);

      toast({ title: 'Ordem atualizada!' });
      fetchCategories();
    } catch (error) {
      console.error('Error moving category:', error);
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Atualize os dados da categoria' : 'Crie grupos para organizar tutoriais'}
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícone</FormLabel>
                      <FormControl>
                        <Input placeholder="📚" className="text-center text-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Primeiros Passos"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editingId) {
                              form.setValue('slug', generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="primeiros-passos" {...field} />
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição opcional da categoria..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_visible"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Visível para usuários</FormLabel>
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
                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Categorias ({categories.length})</CardTitle>
          <CardDescription>
            A ordem define como as categorias aparecem na Academia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhuma categoria criada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tutoriais</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, idx) => (
                  <TableRow key={category.id} className={editingId === category.id ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => moveCategory(category.id, 'up')}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => moveCategory(category.id, 'down')}
                          disabled={idx === categories.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.tutorial_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      {category.is_visible ? (
                        <Badge variant="default">Visível</Badge>
                      ) : (
                        <Badge variant="secondary">Oculta</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(category)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleVisibility(category.id, category.is_visible)}
                          title={category.is_visible ? 'Ocultar' : 'Mostrar'}
                        >
                          {category.is_visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteCategory(category.id)}
                          title="Excluir"
                          disabled={(category.tutorial_count || 0) > 0}
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
