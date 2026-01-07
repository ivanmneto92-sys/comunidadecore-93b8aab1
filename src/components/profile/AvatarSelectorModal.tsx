import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Check } from 'lucide-react';
import { maleAvatars, femaleAvatars, Avatar } from '@/lib/avatarLibrary';
import { useAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarId: string | null;
  userId: string;
  onAvatarUpdated: () => void;
}

export function AvatarSelectorModal({ 
  open, 
  onOpenChange, 
  currentAvatarId,
  userId,
  onAvatarUpdated 
}: AvatarSelectorModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentAvatarId);
  const [saving, setSaving] = useState(false);
  const { svg: previewSvg } = useAvatar(selectedId, 'U');

  const handleSave = async () => {
    if (!selectedId || selectedId === currentAvatarId) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_id: selectedId })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Avatar atualizado!');
      onAvatarUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Erro ao atualizar avatar');
    } finally {
      setSaving(false);
    }
  };

  const renderAvatarGrid = (avatars: Avatar[]) => {
    return (
      <div className="grid grid-cols-4 gap-3 p-1">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => setSelectedId(avatar.id)}
            className={`
              relative aspect-square rounded-xl overflow-hidden border-2 transition-all
              ${selectedId === avatar.id 
                ? 'border-primary ring-2 ring-primary/30 scale-105' 
                : 'border-transparent hover:border-muted-foreground/30'
              }
            `}
          >
            {renderAvatarSvg(avatar.svg, 'w-full h-full')}
            {selectedId === avatar.id && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-primary rounded-full p-1">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-2">
          <SheetTitle>Escolha seu Avatar</SheetTitle>
        </SheetHeader>

        {/* Preview */}
        <div className="flex justify-center py-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30">
            {renderAvatarSvg(previewSvg, 'w-full h-full')}
          </div>
        </div>

        <Tabs defaultValue="male" className="flex-1">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="male">Masculino</TabsTrigger>
            <TabsTrigger value="female">Feminino</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(85vh-280px)]">
            <TabsContent value="male" className="mt-0">
              {renderAvatarGrid(maleAvatars)}
            </TabsContent>
            <TabsContent value="female" className="mt-0">
              {renderAvatarGrid(femaleAvatars)}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="pt-4 pb-2">
          <Button 
            onClick={handleSave} 
            disabled={saving || selectedId === currentAvatarId}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar Avatar'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
