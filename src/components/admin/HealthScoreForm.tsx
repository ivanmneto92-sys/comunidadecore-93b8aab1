import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Heart } from 'lucide-react';
import { format } from 'date-fns';

const healthSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  score: z.coerce.number().min(0).max(100, 'Entre 0 e 100'),
  status: z.enum(['success', 'warning', 'danger']),
});

type HealthFormData = z.infer<typeof healthSchema>;

interface HealthScore {
  id: string;
  date: string;
  score: number;
  status: 'success' | 'warning' | 'danger';
}

export function HealthScoreForm() {
  const { toast } = useToast();
  const [scores, setScores] = useState<HealthScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<HealthFormData>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      score: 85,
      status: 'success',
    },
  });

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from('health_scores')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching health scores:', error);
    } else {
      setScores(data as HealthScore[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const onSubmit = async (data: HealthFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('health_scores').insert({
        date: data.date,
        score: data.score,
        status: data.status,
      });

      if (error) throw error;

      toast({ title: 'Health Score adicionado!' });
      form.reset();
      fetchScores();
    } catch (error) {
      console.error('Error creating health score:', error);
      toast({ title: 'Erro ao adicionar', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteScore = async (id: string) => {
    try {
      const { error } = await supabase.from('health_scores').delete().eq('id', id);

      if (error) throw error;

      toast({ title: 'Score excluído!' });
      fetchScores();
    } catch (error) {
      console.error('Error deleting score:', error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-500';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'danger':
        return 'bg-red-500/20 text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Novo Health Score
          </CardTitle>
          <CardDescription>Atualize o indicador de saúde do bot</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="success">Sucesso (Verde)</SelectItem>
                          <SelectItem value="warning">Alerta (Amarelo)</SelectItem>
                          <SelectItem value="danger">Perigo (Vermelho)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                Adicionar Score
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Scores List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Histórico de Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : scores.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum score registrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score) => (
                  <TableRow key={score.id}>
                    <TableCell>{format(new Date(score.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-semibold">{score.score}%</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(score.status)}>
                        {score.status === 'success' ? 'Sucesso' : score.status === 'warning' ? 'Alerta' : 'Perigo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteScore(score.id)}
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
