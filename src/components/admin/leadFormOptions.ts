export const GENDERS = ['Masculino', 'Feminino'] as const;
export const AGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;
export const WORK_AREAS = ['Saúde', 'Varejo / Comércio', 'Serviços', 'Tecnologia', 'Marketing / Agência', 'Finanças', 'Transporte / Logística', 'Educação', 'Jurídico', 'Indústria', 'Setor Público', 'Outro'] as const;
export const EXPERIENCES = ['Sou totalmente iniciante', 'Tenho experiência consistente (me considero intermediário)', 'Sou avançado/profissional no mercado'] as const;
export const TRADER = ['Sim', 'Não'] as const;
export const PROP_FIRM = ['Nunca ouvi falar', 'Sei o que é, mas não tenho interesse', 'Já tentei, mas não passei', 'Já passei em mesa', 'Opero mesa atualmente'] as const;
export const PROFILES = ['Conservador (1 a 3%/mês)', 'Moderado (5 a 15%/mês)', 'Arrojado (+20%/mês)'] as const;
export const INCOMES = ['Até R$2.000', 'R$2.001 – R$4.000', 'R$4.001 – R$7.000', 'R$7.001 – R$12.000', 'R$12.001 – R$20.000', 'Acima de R$20.000'] as const;
export const INVESTMENTS = ['US$100', 'US$200', 'US$500', 'US$1.000+'] as const;

export const QUESTION_FIELDS: Array<{ key: string; label: string; options: readonly string[] }> = [
  { key: 'gender', label: 'Sexo', options: GENDERS },
  { key: 'age_range', label: 'Idade', options: AGES },
  { key: 'work_area', label: 'Área de trabalho', options: WORK_AREAS },
  { key: 'investment_experience', label: 'Experiência com investimento', options: EXPERIENCES },
  { key: 'is_trader', label: 'Opera como trader', options: TRADER },
  { key: 'prop_firm_status', label: 'Mesa proprietária', options: PROP_FIRM },
  { key: 'investor_profile', label: 'Perfil investidor', options: PROFILES },
  { key: 'income_range', label: 'Renda mensal', options: INCOMES },
  { key: 'initial_investment', label: 'Investimento inicial no CORE', options: INVESTMENTS },
];
