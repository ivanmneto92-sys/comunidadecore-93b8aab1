import { useState } from 'react';
import { Wallet, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Affiliate } from '@/hooks/useAffiliate';

interface PayoutRequestFormProps {
  affiliate: Affiliate;
  onRequest: (amount: number, method: string, details: Record<string, unknown>) => Promise<boolean>;
}

const MIN_PAYOUT = 50;

export function PayoutRequestForm({ affiliate, onRequest }: PayoutRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'pix' | 'paypal'>('pix');
  const [pixKey, setPixKey] = useState(affiliate.pix_key || '');
  const [paypalEmail, setPaypalEmail] = useState(affiliate.payment_email || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canPayout = affiliate.available_balance >= MIN_PAYOUT;
  const progressPercent = Math.min((affiliate.available_balance / MIN_PAYOUT) * 100, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPayout) return;

    setLoading(true);
    try {
      const details = method === 'pix' ? { pix_key: pixKey } : { email: paypalEmail };
      const success = await onRequest(parseFloat(amount) || affiliate.available_balance, method, details);
      if (success) {
        setAmount('');
        toast({ title: 'Solicitação enviada com sucesso!' });
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao solicitar saque',
        description: 'Verifique seus dados e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            canPayout ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <Wallet className={`w-5 h-5 ${canPayout ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold">Solicitar Saque</h3>
            <p className="text-sm text-muted-foreground">
              Saldo disponível: <span className={canPayout ? 'text-primary font-medium' : ''}>
                R$ {affiliate.available_balance.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!canPayout ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm">
                  Você precisa de no mínimo <strong>R$ {MIN_PAYOUT}</strong> para solicitar um saque.
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>R$ {affiliate.available_balance.toFixed(2)} / R$ {MIN_PAYOUT}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do saque</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Máximo: R$ ${affiliate.available_balance.toFixed(2)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={affiliate.available_balance}
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para sacar o valor total disponível.
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Método de pagamento</Label>
              <RadioGroup
                value={method}
                onValueChange={(value) => setMethod(value as 'pix' | 'paypal')}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="pix"
                    id="pix"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="pix"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <CreditCard className="mb-2 h-5 w-5" />
                    <span className="text-sm font-medium">Pix</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="paypal"
                    id="paypal"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="paypal"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Wallet className="mb-2 h-5 w-5" />
                    <span className="text-sm font-medium">PayPal</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Details */}
            {method === 'pix' ? (
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="paypalEmail">E-mail do PayPal</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Solicitar Saque'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
