import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface CoreInsightCardProps {
  insightText: string;
}

export function CoreInsightCard({ insightText }: CoreInsightCardProps) {
  return (
    <Card className="bg-card/50">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Insight do INSTITUTO TRADER</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insightText}
        </p>
      </CardContent>
    </Card>
  );
}
