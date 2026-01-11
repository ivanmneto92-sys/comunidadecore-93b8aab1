import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyReportForm } from '@/components/admin/DailyReportForm';
import { HealthScoreForm } from '@/components/admin/HealthScoreForm';
import { TutorialManager } from '@/components/admin/TutorialManager';
import { ChannelManager } from '@/components/admin/ChannelManager';
import { AffiliateManager } from '@/components/admin/AffiliateManager';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UserManager } from '@/components/admin/UserManager';
import { ModerationPanel } from '@/components/admin/ModerationPanel';
import { BroadcastManager } from '@/components/admin/BroadcastManager';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { SupportManager } from '@/components/admin/SupportManager';
import { Loader2, Shield, BarChart3, Heart, GraduationCap, MessageSquare, Users, LayoutDashboard, AlertTriangle, Megaphone, History, Headphones } from 'lucide-react';

export default function Admin() {
  const { isAdmin, loading } = useUserProfile();
  const navigate = useNavigate();

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
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Gerenciamento de conteúdo</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex w-full overflow-x-auto scrollbar-hidden bg-card gap-1 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <AlertTriangle className="h-4 w-4" />
              <span>Moderação</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <BarChart3 className="h-4 w-4" />
              <span>Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <Heart className="h-4 w-4" />
              <span>Health</span>
            </TabsTrigger>
            <TabsTrigger value="academy" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <GraduationCap className="h-4 w-4" />
              <span>Academy</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <MessageSquare className="h-4 w-4" />
              <span>Canais</span>
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <Megaphone className="h-4 w-4" />
              <span>Broadcast</span>
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <Users className="h-4 w-4" />
              <span>Afiliados</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <History className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1.5 text-xs px-3 shrink-0">
              <Headphones className="h-4 w-4" />
              <span>Suporte</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <UserManager />
          </TabsContent>

          <TabsContent value="moderation" className="mt-4">
            <ModerationPanel />
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <DailyReportForm />
          </TabsContent>

          <TabsContent value="health" className="mt-4">
            <HealthScoreForm />
          </TabsContent>

          <TabsContent value="academy" className="mt-4">
            <TutorialManager />
          </TabsContent>

          <TabsContent value="channels" className="mt-4">
            <ChannelManager />
          </TabsContent>

          <TabsContent value="broadcast" className="mt-4">
            <BroadcastManager />
          </TabsContent>

          <TabsContent value="affiliates" className="mt-4">
            <AffiliateManager />
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="support" className="mt-4">
            <SupportManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
