import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { buildErrorToast } from '@/lib/toastError';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import logoCore from '@/assets/logo-instituto-trader.png';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/';
  
  // Capture referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    // Validate password confirmation only for signup
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast(buildErrorToast(error, { action: 'entrar', field: 'E-mail/Senha' }));
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast(buildErrorToast(error, { action: 'criar conta', field: 'E-mail' }));
        } else {
          // Handle referral after successful signup
          const referralCode = localStorage.getItem('referral_code');
          if (referralCode) {
            // Update the newly created user's profile with referred_by
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase
                .from('profiles')
                .update({ referred_by: referralCode })
                .eq('id', newUser.id);
              
              // Find the affiliate and create referral record
              const { data: affiliateData } = await supabase
                .from('affiliates')
                .select('id')
                .eq('affiliate_code', referralCode)
                .single();
              
              if (affiliateData) {
                await supabase.from('referrals').insert([{
                  affiliate_id: affiliateData.id,
                  referred_user_id: newUser.id,
                }]);
              }
              
              localStorage.removeItem('referral_code');
            }
          }
          
          toast({
            title: 'Verifique seu e-mail',
            description: 'Enviamos um link de confirmação para ' + email + '. Acesse sua caixa de entrada (e o spam) para ativar sua conta antes de entrar.',
            duration: 10000,
          });
          setIsLogin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-3">
          <img src={logoCore} alt="INSTITUTO TRADER" width={900} height={210} className="h-52 w-auto" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {isLogin ? 'Entrar' : 'Criar conta'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Entre com seu email e senha'
                : 'Preencha os dados para criar sua conta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome</Label>
                  <Input
                    id="displayName"
                    placeholder="Seu nome"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {isLogin ? (
                <p className="text-muted-foreground">
                  Não tem conta?{' '}
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setErrors({});
                    }}
                    className="text-primary hover:underline"
                  >
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Já tem conta?{' '}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setConfirmPassword('');
                      setErrors({});
                    }}
                    className="text-primary hover:underline"
                  >
                    Entrar
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legal links */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <a href="/termos" className="hover:text-primary hover:underline">
            Termos de Uso
          </a>
          <span>•</span>
          <a href="/privacidade" className="hover:text-primary hover:underline">
            Política de Privacidade
          </a>
        </div>

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground">
          Conteúdo educacional e informativo. Não é recomendação de investimento. 
          Resultados passados não garantem resultados futuros.
        </p>
      </div>

      <ForgotPasswordModal 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen} 
      />
    </div>
  );
}
