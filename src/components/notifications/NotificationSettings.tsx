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
