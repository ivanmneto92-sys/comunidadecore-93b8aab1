import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Hash,
  MessageCircleHeart,
  Sparkles,
  ShieldCheck,
  AtSign,
  BookOpen,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CommunityWelcomeTourProps {
  channels: { name: string; slug: string; icon: string | null }[];
  currentChannelSlug?: string | null;
}

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}

const storageKey = (userId: string) => `community_tour_v1_${userId}`;
const WELCOME_SLUGS = ['bem-vindo', 'bem-vindos', 'boas-vindas', 'welcome'];

export function CommunityWelcomeTour({ channels, currentChannelSlug }: CommunityWelcomeTourProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Auto-open on first visit to /community
  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(storageKey(user.id));
    if (!done) {
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, [user]);

  // Auto-open when user lands on the official welcome channel (once per user)
  useEffect(() => {
    if (!user || !currentChannelSlug) return;
    if (!WELCOME_SLUGS.includes(currentChannelSlug.toLowerCase())) return;
    const done = localStorage.getItem(storageKey(user.id));
    if (done) return;
    setStep(0);
    setOpen(true);
  }, [user, currentChannelSlug]);

  // Expose a global trigger so a button elsewhere can replay it
  useEffect(() => {
    const handler = () => { setStep(0); setOpen(true); };
    window.addEventListener('open-community-tour', handler);
    return () => window.removeEventListener('open-community-tour', handler);
  }, []);

  const featured = channels.slice(0, 5);

  const steps: Step[] = [
    {
      icon: MessageCircleHeart,
      title: 'Bem-vindo ao INSTITUTO TRADER HUB 👋',
      body: (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aqui você acompanha o operacional, troca ideia com outros traders, tira dúvidas e
          evolui junto com a comunidade. Vamos te dar um tour rápido em <strong>30 segundos</strong>.
        </p>
      ),
    },
    {
      icon: ShieldCheck,
      title: 'Regras de convivência',
      body: (
        <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li>✅ Respeito acima de tudo — nada de ofensas ou discurso de ódio.</li>
          <li>🚫 Não compartilhe sinais ou recomendações de entrada/saída.</li>
          <li>📣 Use o canal certo para cada assunto (veja a próxima tela).</li>
          <li>🔒 Não divulgue dados pessoais ou de terceiros.</li>
          <li>🤝 Ajude quem está começando — todos passamos por isso.</li>
        </ul>
      ),
    },
    {
      icon: Hash,
      title: 'Canais principais',
      body: (
        <div className="space-y-2 text-sm">
          {featured.length === 0 ? (
            <p className="text-muted-foreground">
              Os canais aparecem na lateral esquerda. Cada um tem um propósito específico.
            </p>
          ) : (
            featured.map(c => (
              <div key={c.slug} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40">
                <span className="text-base">{c.icon || '#'}</span>
                <span className="font-medium text-foreground">{c.name}</span>
              </div>
            ))
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Use a barra lateral para alternar entre canais a qualquer momento.
          </p>
        </div>
      ),
    },
    {
      icon: AtSign,
      title: 'Como interagir',
      body: (
        <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li>
            <strong className="text-foreground">@menção</strong> — digite <code className="px-1.5 py-0.5 bg-muted rounded text-xs">@</code> para chamar alguém.
          </li>
          <li>
            <strong className="text-foreground">Reações</strong> — passe o mouse na mensagem e clique no 😀.
          </li>
          <li>
            <strong className="text-foreground">Threads</strong> — clique em "Responder" para abrir uma conversa aninhada sem poluir o canal.
          </li>
          <li>
            <strong className="text-foreground">Markdown</strong> — **negrito**, *itálico* e `código` funcionam.
          </li>
        </ul>
      ),
    },
    {
      icon: BookOpen,
      title: 'Recursos úteis',
      body: (
        <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li>📚 <strong className="text-foreground">Academy</strong> — tutoriais e quizzes para evoluir.</li>
          <li>📊 <strong className="text-foreground">Resultados</strong> — histórico de performance do sistema.</li>
          <li>📓 <strong className="text-foreground">Journal</strong> — registre seus próprios trades.</li>
          <li>🏆 <strong className="text-foreground">Conquistas</strong> — XP, badges e seasons.</li>
        </ul>
      ),
    },
    {
      icon: Sparkles,
      title: 'Última dica: apresente-se 🚀',
      body: (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vá no canal <strong>#geral</strong> ou <strong>#apresentações</strong> e conte rapidinho quem
          você é, há quanto tempo opera e o que busca aqui. A comunidade adora dar as boas-vindas!
        </p>
      ),
    },
  ];

  const total = steps.length;
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === total - 1;

  const handleClose = () => {
    if (user) localStorage.setItem(storageKey(user.id), new Date().toISOString());
    setOpen(false);
  };

  const handleNext = () => {
    if (isLast) handleClose();
    else setStep(s => s + 1);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="px-6 pt-6">
          <Progress value={((step + 1) / total) * 100} className="h-1" />
        </div>

        <div className="px-6 pt-5 pb-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 ring-1 ring-primary/30">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">{current.title}</DialogTitle>
            <DialogDescription className="sr-only">Tour da comunidade</DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-2 min-h-[180px]">{current.body}</div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Pular tour
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {step + 1} / {total}
            </span>
            <Button size="sm" onClick={handleNext} className="gap-1.5">
              {isLast ? (<>Concluir <Check className="w-4 h-4" /></>) : (<>Próximo <ArrowRight className="w-4 h-4" /></>)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Helper to re-open the tour from any component. */
export function openCommunityTour() {
  window.dispatchEvent(new Event('open-community-tour'));
}
