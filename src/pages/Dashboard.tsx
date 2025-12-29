import { AppLayout } from '@/components/layout/AppLayout';
import { RecentCommunityFeed } from '@/components/dashboard/RecentCommunityFeed';
import logoCore from '@/assets/logo-core.png';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCore} alt="CORE" className="h-8 w-auto" />
            <div>
              <p className="text-xs text-muted-foreground">Comunidade</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">Ao vivo</span>
          </div>
        </div>

        {/* Community Feed */}
        <RecentCommunityFeed />

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}
