import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { maleAvatars, femaleAvatars, Avatar, getAvatarById } from '@/lib/avatarLibrary';
import { useAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
  currentAvatarId: string | null;
  displayName?: string;
  onAvatarChange?: (avatarId: string) => void;
}

export function AvatarSelector({ currentAvatarId, displayName, onAvatarChange }: AvatarSelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { svg: currentSvg } = useAvatar(currentAvatarId, displayName);
  
  const [selectedId, setSelectedId] = useState<string | null>(currentAvatarId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'male' | 'female'>('male');

  const hasChanges = selectedId !== currentAvatarId;

  const handleSelect = (avatar: Avatar) => {
    setSelectedId(avatar.id);
  };

  const handleSave = async () => {
    if (!user || !selectedId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_id: selectedId,
          avatar_url: null // Limpa URL antiga se existir
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: 'Avatar atualizado!' });
      onAvatarChange?.(selectedId);
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o avatar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedAvatar = getAvatarById(selectedId);
  const previewSvg = selectedAvatar?.svg || currentSvg;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview Grande */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
          {renderAvatarSvg(previewSvg, 'w-full h-full')}
        </div>
        {hasChanges && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Tabs de Gênero */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'male' | 'female')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="male" className="gap-2">
            <User2 className="w-4 h-4" />
            Masculino
          </TabsTrigger>
          <TabsTrigger value="female" className="gap-2">
            <User2 className="w-4 h-4" />
            Feminino
          </TabsTrigger>
        </TabsList>

        <TabsContent value="male" className="mt-4">
          <AvatarGrid 
            avatars={maleAvatars} 
            selectedId={selectedId} 
            onSelect={handleSelect} 
          />
        </TabsContent>

        <TabsContent value="female" className="mt-4">
          <AvatarGrid 
            avatars={femaleAvatars} 
            selectedId={selectedId} 
            onSelect={handleSelect} 
          />
        </TabsContent>
      </Tabs>

      {/* Botão Salvar */}
      {hasChanges && (
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full gap-2 animate-fade-in"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Confirmar Avatar
            </>
          )}
        </Button>
      )}
    </div>
  );
}

interface AvatarGridProps {
  avatars: Avatar[];
  selectedId: string | null;
  onSelect: (avatar: Avatar) => void;
}

function AvatarGrid({ avatars, selectedId, onSelect }: AvatarGridProps) {
  return (
    <ScrollArea className="h-[240px] pr-2">
      <div className="grid grid-cols-5 gap-2">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar)}
            className={cn(
              'relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              selectedId === avatar.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-border/50 hover:border-primary/50'
            )}
          >
            {renderAvatarSvg(avatar.svg, 'w-full h-full')}
            {selectedId === avatar.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
