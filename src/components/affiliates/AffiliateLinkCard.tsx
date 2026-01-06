import { useState } from 'react';
import { Link2, Copy, Share2, Check, Gift, Star, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AffiliateLinkCardProps {
  affiliateCode: string;
}

export function AffiliateLinkCard({ affiliateCode }: AffiliateLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const affiliateLink = `${window.location.origin}?ref=${affiliateCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'Seu link de indicação foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
          title: 'CORE HUB - Indicação',
          text: 'Venha fazer parte do CORE HUB! Use meu link de indicação:',
          url: affiliateLink,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const commissions = [
    { icon: Star, tier: 'Plus', amount: 'R$ 20', color: 'text-primary' },
    { icon: Crown, tier: 'Elite', amount: 'R$ 50', color: 'text-amber-500' },
  ];

  return (
    <Card className="overflow-hidden border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Link2 className="w-6 h-6 text-background" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Seu Link de Indicação</h3>
            <p className="text-sm text-muted-foreground">
              Código: <span className="font-mono font-medium text-primary">{affiliateCode}</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Link Input */}
        <div className="flex gap-2">
          <Input
            value={affiliateLink}
            readOnly
            className="font-mono text-sm bg-muted/50"
          />
          <Button
            variant={copied ? 'default' : 'outline'}
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleCopy} variant="outline" className="gap-2">
            <Copy className="w-4 h-4" />
            Copiar Link
          </Button>
          <Button onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>

        {/* Commission Info */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Suas Comissões</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {commissions.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <p className={`font-bold ${item.color}`}>{item.amount}</p>
                    <p className="text-xs text-muted-foreground">por {item.tier}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
