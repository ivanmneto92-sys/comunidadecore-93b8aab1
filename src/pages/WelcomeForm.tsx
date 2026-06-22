import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

const schema = z.object({
  full_name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  whatsapp: z.string().trim().regex(phoneRegex, 'Formato: (XX) XXXXX-XXXX'),
  gender: z.enum(['Masculino', 'Feminino']),
  age_range: z.enum(['18-24', '25-34', '35-44', '45-54', '55+']),
  work_area: z.string().min(1, 'Selecione uma opção'),
  work_area_other: z.string().optional(),
  investment_experience: z.string().min(1, 'Selecione uma opção'),
  is_trader: z.enum(['Sim', 'Não']),
  prop_firm_status: z.string().min(1, 'Selecione uma opção'),
  investor_profile: z.string().min(1, 'Selecione uma opção'),
  income_range: z.string().min(1, 'Selecione uma opção'),
  initial_investment: z.string().min(1, 'Selecione uma opção'),
}).refine(d => d.work_area !== 'Outro' || (d.work_area_other && d.work_area_other.trim().length >= 2), {
  path: ['work_area_other'],
  message: 'Informe sua área',
});

const workAreas = ['Saúde', 'Varejo / Comércio', 'Serviços', 'Tecnologia', 'Marketing / Agência', 'Finanças', 'Transporte / Logística', 'Educação', 'Jurídico', 'Indústria', 'Setor Público', 'Outro'];
const experiences = ['Sou totalmente iniciante', 'Tenho experiência consistente (me considero intermediário)', 'Sou avançado/profissional no mercado'];
const propFirm = ['Nunca ouvi falar', 'Sei o que é, mas não tenho interesse', 'Já tentei, mas não passei', 'Já passei em mesa', 'Opero mesa atualmente'];
const profiles = ['Conservador (1 a 3%/mês)', 'Moderado (5 a 15%/mês)', 'Arrojado (+20%/mês)'];
const incomes = ['Até R$2.000', 'R$2.001 – R$4.000', 'R$4.001 – R$7.000', 'R$7.001 – R$12.000', 'R$12.001 – R$20.000', 'Acima de R$20.000'];
const investments = ['US$100', 'US$200', 'US$500', 'US$1.000+'];
const ages = ['18-24', '25-34', '35-44', '45-54', '55+'];

type FormState = Record<string, string>;

function RadioField({ label, name, options, value, onChange, error }: {
  label: string; name: string; options: readonly string[]; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-1.5">
        {options.map(opt => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`${name}-${opt}`} />
            <Label htmlFor={`${name}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default function WelcomeForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: user?.email ?? '',
    whatsapp: '',
    gender: '',
    age_range: '',
    work_area: '',
    work_area_other: '',
    investment_experience: '',
    is_trader: '',
    prop_firm_status: '',
    investor_profile: '',
    income_range: '',
    initial_investment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const d = result.data;
    const { error } = await supabase.from('lead_profiles').insert({
      user_id: user.id,
      full_name: d.full_name,
      email: d.email,
      whatsapp: d.whatsapp,
      gender: d.gender,
      age_range: d.age_range,
      work_area: d.work_area,
      work_area_other: d.work_area === 'Outro' ? (d.work_area_other ?? null) : null,
      investment_experience: d.investment_experience,
      is_trader: d.is_trader,
      prop_firm_status: d.prop_firm_status,
      investor_profile: d.investor_profile,
      income_range: d.income_range,
      initial_investment: d.initial_investment,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    await qc.invalidateQueries({ queryKey: ['lead_profile', user.id] });
    toast({ title: 'Tudo certo!', description: 'Bem-vindo ao INSTITUTO TRADER.' });
    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Formulário de Primeiro Acesso</h1>
          <p className="text-sm text-muted-foreground mt-1">Para personalizar sua experiência, precisamos te conhecer melhor. Todos os campos são obrigatórios.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome</Label>
            <Input id="full_name" value={form.full_name} onChange={e => set('full_name')(e.target.value)} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={form.email} onChange={e => set('email')(e.target.value)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" placeholder="(11) 99999-9999" value={form.whatsapp}
              onChange={e => set('whatsapp')(formatPhone(e.target.value))} />
            {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
          </div>

          <RadioField label="Sexo" name="gender" options={['Masculino', 'Feminino']} value={form.gender} onChange={set('gender')} error={errors.gender} />
          <RadioField label="Idade" name="age_range" options={ages} value={form.age_range} onChange={set('age_range')} error={errors.age_range} />

          <RadioField label="Qual sua área de trabalho?" name="work_area" options={workAreas} value={form.work_area} onChange={set('work_area')} error={errors.work_area} />
          {form.work_area === 'Outro' && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="work_area_other">Especifique sua área</Label>
              <Input id="work_area_other" value={form.work_area_other} onChange={e => set('work_area_other')(e.target.value)} />
              {errors.work_area_other && <p className="text-sm text-destructive">{errors.work_area_other}</p>}
            </div>
          )}

          <RadioField label="Qual sua experiência com investimento?" name="investment_experience" options={experiences} value={form.investment_experience} onChange={set('investment_experience')} error={errors.investment_experience} />
          <RadioField label="Você opera como trade?" name="is_trader" options={['Sim', 'Não']} value={form.is_trader} onChange={set('is_trader')} error={errors.is_trader} />
          <RadioField label="Você opera ou investe em Mesas Proprietárias?" name="prop_firm_status" options={propFirm} value={form.prop_firm_status} onChange={set('prop_firm_status')} error={errors.prop_firm_status} />
          <RadioField label="Qual seu perfil investidor?" name="investor_profile" options={profiles} value={form.investor_profile} onChange={set('investor_profile')} error={errors.investor_profile} />
          <RadioField label="Qual sua faixa de renda mensal?" name="income_range" options={incomes} value={form.income_range} onChange={set('income_range')} error={errors.income_range} />
          <RadioField label="Quanto você pretende investir inicialmente no INSTITUTO TRADER?" name="initial_investment" options={investments} value={form.initial_investment} onChange={set('initial_investment')} error={errors.initial_investment} />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar e continuar
          </Button>
        </form>
      </div>
    </div>
  );
}
