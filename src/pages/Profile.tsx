import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAffiliate } from '@/hooks/useAffiliate';
import { supabase } from '@/integrations/supabase/client';
import { AvatarSelector } from '@/components/profile/AvatarSelector';
import { ProfileStatusCard } from '@/components/profile/ProfileStatusCard';
import { AffiliateQuickCard } from '@/components/profile/AffiliateQuickCard';
import { User, LogOut, Loader2, Save, Edit3, Palette } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, membership, isAdmin, isModerator, loading: profileLoading } = useUserProfile();
  const { affiliate, referrals, commissions } = useAffiliate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setAvatarId(profile.avatar_id);
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          username: username,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar seu perfil.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAvatarChange = (newAvatarId: string) => {
    setAvatarId(newAvatarId);
  };

  if (authLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  const tier = membership || 'free';
  const pendingCommissions = commissions.filter((c) => c.status === 'pending').length;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div
          className="flex items-center gap-4 animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <User className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <ProfileStatusCard
            tier={tier}
            isAdmin={isAdmin}
            isModerator={isModerator}
            memberSince={profile?.created_at || new Date().toISOString()}
            displayName={displayName}
          />
        </div>

        {/* Affiliate Quick Card */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <AffiliateQuickCard
            hasAffiliate={!!affiliate}
            availableBalance={affiliate?.available_balance}
            totalReferrals={referrals.length}
            pendingCommissions={pendingCommissions}
          />
        </div>

        {/* Avatar Selection Card */}
        <Card
          className="overflow-hidden border-border/50 animate-fade-in"
          style={{ animationDelay: '150ms' }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Palette className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Escolher Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione seu avatar preferido
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <AvatarSelector
              currentAvatarId={avatarId}
              displayName={displayName}
              onAvatarChange={handleAvatarChange}
            />
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card
          className="overflow-hidden border-border/50 animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Editar Perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Atualize suas informações
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Form Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input
                  id="displayName"
                  placeholder="Como você quer ser chamado"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  placeholder="@seuusuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado.
              </p>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
