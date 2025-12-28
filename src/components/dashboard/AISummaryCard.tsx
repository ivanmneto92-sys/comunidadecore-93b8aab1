import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
}

export function AISummaryCard({ summary }: AISummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumo IA do Dia</CardTitle>
        <Sparkles className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
