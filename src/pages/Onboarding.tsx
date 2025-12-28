import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Users, BarChart3, ChevronRight, Check } from 'lucide-react';

const steps = [
  {
    icon: TrendingUp,
    title: 'Bem-vindo ao CORE HUB',
    description: 'Sua comunidade de copy trading inteligente. Acompanhe resultados, aprenda sobre gestão de risco e conecte-se com outros membros.',
  },
  {
    icon: BarChart3,
    title: 'Resultados Transparentes',
    description: 'Visualize métricas agregadas diárias: trades, win rate, PnL e drawdown. Sem exposição de dados sensíveis, apenas informações que importam.',
  },
  {
    icon: Users,
    title: 'Comunidade Engajada',
    description: 'Participe de discussões, tire dúvidas com outros membros e aprenda com tutoriais exclusivos organizados por nível.',
  },
];

const terms = [
  'Conteúdo educacional e informativo',
  'Não é recomendação de investimento',
  'Resultados passados não garantem resultados futuros',
  'Opere com responsabilidade e gestão de risco',
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1 && !termsAccepted) {
      setCurrentStep(steps.length); // Go to terms
    } else {
      navigate('/');
    }
  };

  const handleSkip = () => {
    setCurrentStep(steps.length);
  };

  const isTermsStep = currentStep === steps.length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">CORE HUB</h1>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[...steps, { title: 'terms' }].map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {!isTermsStep ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {(() => {
                    const Icon = steps[currentStep].icon;
                    return <Icon className="h-8 w-8 text-primary" />;
                  })()}
                </div>
                <h2 className="text-xl font-semibold">
                  {steps[currentStep].title}
                </h2>
                <p className="text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <h2 className="text-xl font-semibold">Termos e Avisos</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Antes de continuar, confirme que você entende:
                </p>
                <ul className="space-y-3">
                  {terms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
                <label className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm">Li e aceito os termos acima</span>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {!isTermsStep && currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Voltar
            </Button>
          )}
          
          {!isTermsStep && currentStep === 0 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
            >
              Pular
            </Button>
          )}

          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={isTermsStep && !termsAccepted}
          >
            {isTermsStep ? 'Começar' : 'Próximo'}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
