import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Mail, CheckCircle, KeyRound, Lock, ArrowLeft } from 'lucide-react';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

type Step = 'email' | 'otp' | 'password' | 'success';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { toast } = useToast();

  const resetState = () => {
    setStep('email');
    setEmail('');
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetState, 200);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ email: err.errors[0].message });
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.message,
        });
      } else {
        setStep('otp');
        toast({
          title: 'Código enviado!',
          description: 'Verifique sua caixa de entrada.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'Digite o código de 6 dígitos.',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'recovery',
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Código inválido',
          description: 'Verifique o código e tente novamente.',
        });
      } else {
        setStep('password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.message,
        });
      } else {
        setOtpCode('');
        toast({
          title: 'Código reenviado!',
          description: 'Verifique sua caixa de entrada.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirmPassword?: string } = {};

    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        newErrors.password = err.errors[0].message;
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: error.message,
        });
      } else {
        setStep('success');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* Step: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="mb-2">Senha redefinida!</DialogTitle>
            <DialogDescription className="mb-6">
              Sua senha foi atualizada com sucesso. Você já pode fazer login.
            </DialogDescription>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}

        {/* Step: Email */}
        {step === 'email' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 rounded-full bg-muted p-3">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <DialogTitle className="text-center">Esqueceu sua senha?</DialogTitle>
              <DialogDescription className="text-center">
                Digite seu email e enviaremos um código de 6 dígitos para redefinir sua senha.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar código
              </Button>
            </form>
          </>
        )}

        {/* Step: OTP Code */}
        {step === 'otp' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 rounded-full bg-muted p-3">
                <KeyRound className="h-6 w-6 text-muted-foreground" />
              </div>
              <DialogTitle className="text-center">Digite o código</DialogTitle>
              <DialogDescription className="text-center">
                Enviamos um código de 6 dígitos para <strong>{email}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline disabled:opacity-50"
                >
                  Não recebeu? Reenviar código
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar código
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setOtpCode('');
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </form>
          </>
        )}

        {/* Step: New Password */}
        {step === 'password' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 rounded-full bg-muted p-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <DialogTitle className="text-center">Criar nova senha</DialogTitle>
              <DialogDescription className="text-center">
                Digite sua nova senha abaixo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar senha</Label>
                <Input
                  id="confirm-new-password"
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Redefinir senha
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
