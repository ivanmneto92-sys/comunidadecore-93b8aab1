import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Loader2 } from 'lucide-react';
import type { Affiliate } from '@/hooks/useAffiliate';

interface PayoutRequestFormProps {
  affiliate: Affiliate;
  onRequest: (amount: number, method: string, details: Record<string, unknown>) => Promise<boolean>;
}

export function PayoutRequestForm({ affiliate, onRequest }: PayoutRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(affiliate.payment_method || 'pix');
  const [pixKey, setPixKey] = useState(affiliate.pix_key || '');
  const [paypalEmail, setPaypalEmail] = useState(affiliate.payment_email || '');
  const [loading, setLoading] = useState(false);

  const availableBalance = Number(affiliate.available_balance);
  const minPayout = 50;
  const canRequest = availableBalance >= minPayout;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minPayout) return;

    setLoading(true);
    const details: Record<string, unknown> = method === 'pix' 
      ? { pix_key: pixKey }
      : { email: paypalEmail };

    const success = await onRequest(numAmount, method, details);
    if (success) {
      setAmount('');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Solicitar Saque
        </CardTitle>
        <CardDescription>
          Saldo disponível: <span className="text-primary font-bold">R$ {availableBalance.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!canRequest ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Saldo mínimo para saque: <strong>R$ {minPayout.toFixed(2)}</strong></p>
            <p className="text-sm mt-2">Continue indicando para atingir o valor mínimo!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do saque</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minPayout}
                max={availableBalance}
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo: R$ {minPayout.toFixed(2)} | Máximo: R$ {availableBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método de pagamento</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'pix' && (
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  type="text"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  required
                />
              </div>
            )}

            {method === 'paypal' && (
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar Saque
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
