import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { GraduationCap, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  beginner: { label: 'Iniciante', icon: '🌱' },
  intermediate: { label: 'Intermediário', icon: '📈' },
  advanced: { label: 'Avançado', icon: '🎯' },
};

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Grátis', color: 'bg-muted text-muted-foreground' },
  plus: { label: 'Plus', color: 'bg-status-warning/20 text-status-warning' },
  elite: { label: 'Elite', color: 'bg-primary/20 text-primary' },
};

export default function Academy() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const { membership } = useUserProfile();

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const { data, error } = await supabase
          .from('tutorials')
          .select('id, title, slug, description, category, tier_required')
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setTutorials((data || []) as Tutorial[]);
      } catch (error) {
        console.error('Error fetching tutorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const canAccess = (tierRequired: string) => {
    if (tierRequired === 'free') return true;
    if (membership === 'elite') return true;
    if (membership === 'plus' && (tierRequired === 'free' || tierRequired === 'plus')) return true;
    return false;
  };

  // Group tutorials by category
  const groupedTutorials = tutorials.reduce((acc, tutorial) => {
    const category = tutorial.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  const categoryOrder = ['beginner', 'intermediate', 'advanced'];
  const sortedCategories = Object.keys(groupedTutorials).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Academia CORE</h1>
            <p className="text-sm text-muted-foreground">Aprenda sobre copy trading</p>
          </div>
        </div>

        {/* Membership badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Seu plano:</span>
          <Badge className={tierLabels[membership]?.color}>
            {tierLabels[membership]?.label}
          </Badge>
        </div>

        {/* Tutorials by category */}
        {sortedCategories.map((category) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{categoryLabels[category]?.icon}</span>
              <h2 className="text-lg font-semibold">
                {categoryLabels[category]?.label || category}
              </h2>
            </div>

            <div className="grid gap-3">
              {groupedTutorials[category].map((tutorial) => {
                const hasAccess = canAccess(tutorial.tier_required);
                
                return (
                  <Card 
                    key={tutorial.id}
                    className={cn(
                      'transition-colors',
                      hasAccess 
                        ? 'cursor-pointer hover:bg-card/80' 
                        : 'opacity-60'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{tutorial.title}</h3>
                            {tutorial.tier_required !== 'free' && (
                              <Badge 
                                variant="secondary" 
                                className={cn('text-xs', tierLabels[tutorial.tier_required]?.color)}
                              >
                                {tierLabels[tutorial.tier_required]?.label}
                              </Badge>
                            )}
                          </div>
                          {tutorial.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tutorial.description}
                            </p>
                          )}
                        </div>
                        {hasAccess ? (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {tutorials.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhum tutorial disponível ainda.
          </p>
        )}
      </div>
    </AppLayout>
  );
}
