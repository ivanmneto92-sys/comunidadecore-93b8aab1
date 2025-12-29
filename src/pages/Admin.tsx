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
import { Loader2, Shield, BarChart3, Heart, GraduationCap, MessageSquare, Users } from 'lucide-react';

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
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card">
            <TabsTrigger value="results" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1 text-xs">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="academy" className="flex items-center gap-1 text-xs">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Academy</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Canais</span>
            </TabsTrigger>
            <TabsTrigger value="affiliates" className="flex items-center gap-1 text-xs">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Afiliados</span>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="affiliates" className="mt-4">
            <AffiliateManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
