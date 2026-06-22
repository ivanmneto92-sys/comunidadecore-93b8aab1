import { lazy, Suspense, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, BarChart3, Heart, GraduationCap, MessageSquare, Users, LayoutDashboard, AlertTriangle, Megaphone, History, Headphones, Bot, FolderOpen } from 'lucide-react';

// Lazy-load all admin sub-managers so each tab only ships its own JS
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManager = lazy(() => import('@/components/admin/UserManager').then(m => ({ default: m.UserManager })));
const ModerationPanel = lazy(() => import('@/components/admin/ModerationPanel').then(m => ({ default: m.ModerationPanel })));
const TradingConfigForm = lazy(() => import('@/components/admin/TradingConfigForm').then(m => ({ default: m.TradingConfigForm })));
const MonthlyReturnsManager = lazy(() => import('@/components/admin/MonthlyReturnsManager').then(m => ({ default: m.MonthlyReturnsManager })));
const DailyReportForm = lazy(() => import('@/components/admin/DailyReportForm').then(m => ({ default: m.DailyReportForm })));
const HealthScoreForm = lazy(() => import('@/components/admin/HealthScoreForm').then(m => ({ default: m.HealthScoreForm })));
const TutorialManager = lazy(() => import('@/components/admin/TutorialManager').then(m => ({ default: m.TutorialManager })));
const TutorialCategoryManager = lazy(() => import('@/components/admin/TutorialCategoryManager').then(m => ({ default: m.TutorialCategoryManager })));
const CategoryManager = lazy(() => import('@/components/admin/CategoryManager').then(m => ({ default: m.CategoryManager })));
const ChannelManager = lazy(() => import('@/components/admin/ChannelManager').then(m => ({ default: m.ChannelManager })));
const BroadcastManager = lazy(() => import('@/components/admin/BroadcastManager').then(m => ({ default: m.BroadcastManager })));
const CoreBotManager = lazy(() => import('@/components/admin/CoreBotManager').then(m => ({ default: m.CoreBotManager })));
const AffiliateManager = lazy(() => import('@/components/admin/AffiliateManager').then(m => ({ default: m.AffiliateManager })));
const ActivityLogs = lazy(() => import('@/components/admin/ActivityLogs').then(m => ({ default: m.ActivityLogs })));
const SupportManager = lazy(() => import('@/components/admin/SupportManager').then(m => ({ default: m.SupportManager })));

const TabFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export default function Admin() {
  const { isAdmin, loading } = useUserProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Gerenciamento de conteúdo</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex w-full overflow-x-auto scrollbar-hidden bg-card gap-1 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><LayoutDashboard className="h-4 w-4" /><span>Dashboard</span></TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><Users className="h-4 w-4" /><span>Usuários</span></TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><AlertTriangle className="h-4 w-4" /><span>Moderação</span></TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><BarChart3 className="h-4 w-4" /><span>Resultados</span></TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><Heart className="h-4 w-4" /><span>Health</span></TabsTrigger>
            <TabsTrigger value="academy" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><GraduationCap className="h-4 w-4" /><span>Academy</span></TabsTrigger>
            <TabsTrigger value="tutorial-categories" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><FolderOpen className="h-4 w-4" /><span>Módulos</span></TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><FolderOpen className="h-4 w-4" /><span>Categorias</span></TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><MessageSquare className="h-4 w-4" /><span>Canais</span></TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><Megaphone className="h-4 w-4" /><span>Broadcast</span></TabsTrigger>
            <TabsTrigger value="corebot" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><Bot className="h-4 w-4" /><span>CORE Bot</span></TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><Users className="h-4 w-4" /><span>Afiliados</span></TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><History className="h-4 w-4" /><span>Logs</span></TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1.5 text-xs px-3 shrink-0"><Headphones className="h-4 w-4" /><span>Suporte</span></TabsTrigger>
          </TabsList>

          <Suspense fallback={<TabFallback />}>
            <TabsContent value="dashboard" className="mt-4"><AdminDashboard /></TabsContent>
            <TabsContent value="users" className="mt-4"><UserManager /></TabsContent>
            <TabsContent value="moderation" className="mt-4"><ModerationPanel /></TabsContent>
            <TabsContent value="results" className="mt-4 space-y-6">
              <TradingConfigForm />
              <MonthlyReturnsManager />
              <DailyReportForm />
            </TabsContent>
            <TabsContent value="health" className="mt-4"><HealthScoreForm /></TabsContent>
            <TabsContent value="academy" className="mt-4"><TutorialManager /></TabsContent>
            <TabsContent value="tutorial-categories" className="mt-4"><TutorialCategoryManager /></TabsContent>
            <TabsContent value="categories" className="mt-4"><CategoryManager /></TabsContent>
            <TabsContent value="channels" className="mt-4"><ChannelManager /></TabsContent>
            <TabsContent value="broadcast" className="mt-4"><BroadcastManager /></TabsContent>
            <TabsContent value="corebot" className="mt-4"><CoreBotManager /></TabsContent>
            <TabsContent value="affiliates" className="mt-4"><AffiliateManager /></TabsContent>
            <TabsContent value="logs" className="mt-4"><ActivityLogs /></TabsContent>
            <TabsContent value="support" className="mt-4"><SupportManager /></TabsContent>
          </Suspense>
        </Tabs>
      </div>
    </AppLayout>
  );
}
