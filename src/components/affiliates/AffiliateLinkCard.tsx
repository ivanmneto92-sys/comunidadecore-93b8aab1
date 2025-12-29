import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AffiliateLinkCardProps {
  affiliateCode: string;
}

export function AffiliateLinkCard({ affiliateCode }: AffiliateLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const affiliateLink = `${window.location.origin}/?ref=${affiliateCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CORE HUB - Programa de Afiliados',
          text: 'Junte-se ao CORE HUB! Use meu link de indicação:',
          url: affiliateLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Seu Link de Indicação
        </CardTitle>
        <CardDescription>
          Compartilhe este link para ganhar comissões em cada indicação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <code className="text-sm font-mono text-primary flex-1 truncate">
            {affiliateCode}
          </code>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={affiliateLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleShare}
            className="shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Ganhe <strong className="text-primary">R$ 20</strong> por cada indicação que assinar o plano Plus</p>
          <p>• Ganhe <strong className="text-primary">R$ 50</strong> por cada indicação que assinar o plano Elite</p>
        </div>
      </CardContent>
    </Card>
  );
}
