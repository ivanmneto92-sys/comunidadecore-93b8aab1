import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAffiliate } from '@/hooks/useAffiliate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Loader2, Save, Crown, Shield, Calendar, Users, ChevronRight, Wallet } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

const tierConfig = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground', icon: User },
  plus: { label: 'Plus', color: 'bg-status-warning/20 text-status-warning', icon: Crown },
  elite: { label: 'Elite', color: 'bg-primary/20 text-primary', icon: Crown },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, membership, isAdmin, isModerator, loading: profileLoading } = useUserProfile();
  const { affiliate } = useAffiliate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          username: username.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const memberSince = profile?.created_at 
    ? format(parseISO(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : '';

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const TierIcon = tierConfig[membership]?.icon || User;

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Perfil</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Membership & Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tierConfig[membership]?.color}`}>
                <TierIcon className="h-6 w-6" />
              </div>
              <div>
                <Badge className={tierConfig[membership]?.color}>
                  {tierConfig[membership]?.label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Seu plano atual</p>
              </div>
            </div>

            {(isAdmin || isModerator) && (
              <div className="flex gap-2">
                {isAdmin && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
                {isModerator && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Moderador
                  </Badge>
                )}
              </div>
            )}

            {memberSince && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Membro desde {memberSince}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Affiliate Program Card */}
        <Card className="border-primary/20 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/affiliates')}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Programa de Afiliados
              </CardTitle>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Indique amigos e ganhe comissões</CardDescription>
          </CardHeader>
          <CardContent>
            {affiliate ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm">Saldo disponível:</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  R$ {Number(affiliate.available_balance).toFixed(2)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Torne-se um afiliado e comece a ganhar hoje!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Editar Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                displayName={displayName}
                onUploadComplete={(url) => setAvatarUrl(url)}
              />
              <p className="text-xs text-muted-foreground">
                Clique para alterar sua foto
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button 
          variant="destructive" 
          onClick={handleSignOut} 
          disabled={signingOut}
          className="w-full"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Sair
        </Button>
      </div>
    </AppLayout>
  );
}
