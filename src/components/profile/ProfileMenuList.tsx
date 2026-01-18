import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Palette, 
  Users, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  DollarSign,
  Trophy,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { ProfileMenuItem } from './ProfileMenuItem';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ProfileMenuListProps {
  affiliateBalance?: number;
  onEditProfile: () => void;
  onChangeAvatar: () => void;
  onSignOut: () => void;
}

export function ProfileMenuList({ 
  affiliateBalance = 0, 
  onEditProfile, 
  onChangeAvatar, 
  onSignOut 
}: ProfileMenuListProps) {
  const navigate = useNavigate();

  return (
    <div className="px-4 space-y-3 pb-6">
      {/* Conta */}
      <Card className="overflow-hidden divide-y divide-border/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <ProfileMenuItem
          icon={User}
          label="Editar Perfil"
          subtitle="Nome, username e bio"
          onClick={onEditProfile}
        />
        <ProfileMenuItem
          icon={Palette}
          label="Trocar Avatar"
          subtitle="Escolha um novo avatar"
          onClick={onChangeAvatar}
        />
        <ProfileMenuItem
          icon={Trophy}
          iconColor="text-amber-500"
          label="Conquistas"
          subtitle="Badges e recompensas"
          onClick={() => navigate('/achievements')}
        />
        <ProfileMenuItem
          icon={BookOpen}
          iconColor="text-blue-500"
          label="Diário de Trading"
          subtitle="Registre suas operações"
          onClick={() => navigate('/journal')}
        />
        <ProfileMenuItem
          icon={GraduationCap}
          iconColor="text-purple-500"
          label="Tutoriais"
          subtitle="Aprenda com a Academia"
          onClick={() => navigate('/academy')}
        />
        <ProfileMenuItem
          icon={Users}
          iconColor="text-emerald-500"
          label="Programa de Afiliados"
          subtitle={affiliateBalance > 0 ? `R$ ${affiliateBalance.toFixed(2)} disponível` : 'Indique e ganhe'}
          badge={affiliateBalance > 0 ? (
            <Badge className="bg-emerald-500/20 text-emerald-500 border-0">
              <DollarSign className="w-3 h-3 mr-0.5" />
              {affiliateBalance.toFixed(0)}
            </Badge>
          ) : undefined}
          onClick={() => navigate('/affiliates')}
        />
      </Card>

      {/* Preferências */}
      <Card className="overflow-hidden divide-y divide-border/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <ProfileMenuItem
          icon={Bell}
          label="Notificações"
          subtitle="Configurar alertas"
          onClick={() => {}}
        />
        <ProfileMenuItem
          icon={Shield}
          label="Segurança"
          subtitle="Senha e autenticação"
          onClick={() => {}}
        />
      </Card>

      {/* Suporte */}
      <Card className="overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
        <ProfileMenuItem
          icon={HelpCircle}
          label="Ajuda e Suporte"
          subtitle="FAQ e contato"
          onClick={() => {}}
        />
      </Card>

      {/* Sair */}
      <Card className="overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
        <ProfileMenuItem
          icon={LogOut}
          label="Sair da Conta"
          onClick={onSignOut}
          destructive
        />
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pt-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
        CORE HUB • v1.0.0
      </p>
    </div>
  );
}
