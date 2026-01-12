import { useState, useEffect } from 'react';
import { Wallet, CreditCard, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { decryptPaymentInfo, updatePaymentInfoSecure } from '@/lib/affiliateCrypto';
import type { Affiliate } from '@/hooks/useAffiliate';

interface PayoutRequestFormProps {
  affiliate: Affiliate;
  onRequest: (amount: number, method: string, details: Record<string, unknown>) => Promise<boolean>;
}

const MIN_PAYOUT = 50;

export function PayoutRequestForm({ affiliate, onRequest }: PayoutRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'pix' | 'paypal'>('pix');
  const [pixKey, setPixKey] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [showPixKey, setShowPixKey] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDecrypt, setLoadingDecrypt] = useState(true);
  const [savingPaymentInfo, setSavingPaymentInfo] = useState(false);
  const { toast } = useToast();

  const canPayout = affiliate.available_balance >= MIN_PAYOUT;
  const progressPercent = Math.min((affiliate.available_balance / MIN_PAYOUT) * 100, 100);

  // Load decrypted payment info on mount
  useEffect(() => {
    const loadPaymentInfo = async () => {
      setLoadingDecrypt(true);
      try {
        const decrypted = await decryptPaymentInfo();
        if (decrypted?.success) {
          setPixKey(decrypted.pix_key || '');
          setPaypalEmail(decrypted.payment_email || '');
        }
      } catch (error) {
        console.error('Error loading payment info:', error);
      } finally {
        setLoadingDecrypt(false);
      }
    };
    loadPaymentInfo();
  }, []);

  const handleSavePaymentInfo = async () => {
    setSavingPaymentInfo(true);
    try {
      const success = await updatePaymentInfoSecure(
        method === 'paypal' ? paypalEmail : null,
        method === 'pix' ? pixKey : null,
        method
      );
      if (success) {
        toast({ title: 'Dados de pagamento salvos com segurança!' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar dados',
          description: 'Tente novamente.',
        });
      }
    } finally {
      setSavingPaymentInfo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPayout) return;

    setLoading(true);
    try {
      // First save/encrypt the payment info
      const saveSuccess = await updatePaymentInfoSecure(
        method === 'paypal' ? paypalEmail : null,
        method === 'pix' ? pixKey : null,
        method
      );

      if (!saveSuccess) {
        toast({
          variant: 'destructive',
          title: 'Erro ao processar dados de pagamento',
          description: 'Verifique seus dados e tente novamente.',
        });
        return;
      }

      // Then request the payout (payment details are now encrypted in DB)
      const details = method === 'pix' 
        ? { pix_key: '***encrypted***' } 
        : { email: '***encrypted***' };
      
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
          <div className="flex-1">
            <h3 className="font-semibold">Solicitar Saque</h3>
            <p className="text-sm text-muted-foreground">
              Saldo disponível: <span className={canPayout ? 'text-primary font-medium' : ''}>
                R$ {affiliate.available_balance.toFixed(2)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>Dados criptografados</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loadingDecrypt ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !canPayout ? (
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

            {/* Allow saving payment info even without min balance */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Configure seus dados de pagamento antecipadamente:
              </p>
              
              <div className="space-y-3">
                <RadioGroup
                  value={method}
                  onValueChange={(value) => setMethod(value as 'pix' | 'paypal')}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem value="pix" id="pix-pre" className="peer sr-only" />
                    <Label
                      htmlFor="pix-pre"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      <CreditCard className="mb-1 h-4 w-4" />
                      <span className="text-xs font-medium">Pix</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="paypal" id="paypal-pre" className="peer sr-only" />
                    <Label
                      htmlFor="paypal-pre"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      <Wallet className="mb-1 h-4 w-4" />
                      <span className="text-xs font-medium">PayPal</span>
                    </Label>
                  </div>
                </RadioGroup>

                {method === 'pix' ? (
                  <div className="space-y-2">
                    <Label htmlFor="pixKey-pre">Chave Pix</Label>
                    <div className="relative">
                      <Input
                        id="pixKey-pre"
                        type={showPixKey ? 'text' : 'password'}
                        placeholder="CPF, e-mail, telefone ou chave aleatória"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPixKey(!showPixKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPixKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail-pre">E-mail do PayPal</Label>
                    <div className="relative">
                      <Input
                        id="paypalEmail-pre"
                        type={showEmail ? 'email' : 'password'}
                        placeholder="seu@email.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmail(!showEmail)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSavePaymentInfo}
                  disabled={savingPaymentInfo || (!pixKey && !paypalEmail)}
                >
                  {savingPaymentInfo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Salvar Dados de Pagamento
                    </>
                  )}
                </Button>
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

            {/* Payment Details with visibility toggle */}
            {method === 'pix' ? (
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <div className="relative">
                  <Input
                    id="pixKey"
                    type={showPixKey ? 'text' : 'password'}
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPixKey(!showPixKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPixKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="paypalEmail">E-mail do PayPal</Label>
                <div className="relative">
                  <Input
                    id="paypalEmail"
                    type={showEmail ? 'email' : 'password'}
                    placeholder="seu@email.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmail(!showEmail)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Security indicator */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield className="w-4 h-4 text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">
                Seus dados de pagamento são criptografados com AES-256-GCM
              </p>
            </div>

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
