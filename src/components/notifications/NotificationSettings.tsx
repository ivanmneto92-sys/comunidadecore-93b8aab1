import { Settings2, Volume2, VolumeX, AtSign, Reply, Loader2, Bell, BellOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useToast } from '@/hooks/use-toast';
import { useWebPushRegistration } from '@/hooks/useWebPushRegistration';

export function NotificationSettings() {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const { status: pushStatus, permission, enable: enablePush, supported: pushSupported, iosRequiresInstall } = useWebPushRegistration();
  const { toast } = useToast();

  const handleToggle = async (key: 'notify_mentions' | 'notify_replies' | 'sound_enabled', value: boolean) => {
    const success = await updateSettings({ [key]: value });
    if (success) {
      toast({ title: 'Configurações atualizadas' });
    } else {
      toast({ variant: 'destructive', title: 'Erro ao atualizar configurações' });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="Ação" variant="ghost" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Notificação</DialogTitle>
          <DialogDescription>
            Configure como você deseja receber notificações
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Push (web) */}
            <div className="rounded-lg border border-border/60 bg-card/40 p-3 space-y-2">
              <div className="flex items-center gap-3">
                {pushStatus === 'registered' ? (
                  <Bell className="h-5 w-5 text-primary" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Notificações no celular</p>
                  <p className="text-xs text-muted-foreground">
                    {pushStatus === 'registered'
                      ? 'Ativadas neste dispositivo.'
                      : permission === 'denied'
                      ? 'Permissão bloqueada nas configurações do navegador.'
                      : 'Receba alertas mesmo com o app fechado.'}
                  </p>
                </div>
              </div>

              {iosRequiresInstall && (
                <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                  <Smartphone className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    No iPhone, abra no Safari → Compartilhar → <strong>Adicionar à Tela de Início</strong>.
                    Depois abra pelo ícone instalado para ativar as notificações.
                  </span>
                </div>
              )}

              {!pushSupported && !iosRequiresInstall && (
                <p className="text-xs text-muted-foreground">
                  Este navegador não suporta notificações push.
                </p>
              )}

              {pushSupported && !iosRequiresInstall && pushStatus !== 'registered' && (
                <Button
                  size="sm"
                  onClick={enablePush}
                  disabled={pushStatus === 'registering' || permission === 'denied'}
                  className="w-full"
                >
                  {pushStatus === 'registering' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ativando…</>
                  ) : (
                    'Ativar notificações'
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AtSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="mentions" className="text-sm font-medium">
                    Menções
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receber notificação quando mencionado
                  </p>
                </div>
              </div>
              <Switch
                id="mentions"
                checked={settings?.notify_mentions ?? true}
                onCheckedChange={(checked) => handleToggle('notify_mentions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Reply className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="replies" className="text-sm font-medium">
                    Respostas
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receber notificação de respostas às suas mensagens
                  </p>
                </div>
              </div>
              <Switch
                id="replies"
                checked={settings?.notify_replies ?? true}
                onCheckedChange={(checked) => handleToggle('notify_replies', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings?.sound_enabled ? (
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="sound" className="text-sm font-medium">
                    Som de Notificação
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Tocar som ao receber notificações
                  </p>
                </div>
              </div>
              <Switch
                id="sound"
                checked={settings?.sound_enabled ?? true}
                onCheckedChange={(checked) => handleToggle('sound_enabled', checked)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
