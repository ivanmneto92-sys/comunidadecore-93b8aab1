import { useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, Upload, Trash2, ImageIcon } from 'lucide-react';
import { maleAvatars, femaleAvatars, Avatar } from '@/lib/avatarLibrary';
import { useAvatar, renderAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarId: string | null;
  currentAvatarUrl?: string | null;
  userId: string;
  onAvatarUpdated: () => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 4096;

function validateImage(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return reject(new Error('Formato não suportado. Use JPEG ou PNG.'));
    }
    if (file.size > MAX_SIZE_BYTES) {
      return reject(new Error('A imagem excede o tamanho máximo de 5MB.'));
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        return reject(new Error(`Imagem muito pequena (mínimo ${MIN_DIMENSION}x${MIN_DIMENSION}px).`));
      }
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        return reject(new Error(`Imagem muito grande (máximo ${MAX_DIMENSION}x${MAX_DIMENSION}px).`));
      }
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

export function AvatarSelectorModal({
  open,
  onOpenChange,
  currentAvatarId,
  currentAvatarUrl,
  userId,
  onAvatarUpdated,
}: AvatarSelectorModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentAvatarId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewResult = useAvatar(selectedId, 'U', localPreview ?? currentAvatarUrl ?? null);

  const handleSaveLibrary = async () => {
    if (!selectedId || selectedId === currentAvatarId) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_id: selectedId, avatar_url: null })
        .eq('id', userId);
      if (error) throw error;
      toast.success('Avatar atualizado!');
      onAvatarUpdated();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      await validateImage(file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Arquivo inválido');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);
    setUploading(true);
    setUploadProgress(10);

    try {
      const ext = file.type === 'image/png' ? 'png' : 'jpg';
      const path = `${userId}/profile-${Date.now()}.${ext}`;

      setUploadProgress(40);
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { contentType: file.type, upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;

      setUploadProgress(75);
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, avatar_id: null })
        .eq('id', userId);
      if (dbErr) throw dbErr;

      setUploadProgress(100);
      toast.success('Foto de perfil atualizada!');
      onAvatarUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Falha no upload. Verifique sua conexão e tente novamente.');
      setLocalPreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (localUrl) URL.revokeObjectURL(localUrl);
    }
  };

  const handleRemovePhoto = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);
      if (error) throw error;
      toast.success('Foto removida');
      setLocalPreview(null);
      onAvatarUpdated();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover foto');
    } finally {
      setSaving(false);
    }
  };

  const renderAvatarGrid = (avatars: Avatar[]) => (
    <div className="grid grid-cols-4 gap-3 p-1">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => { setSelectedId(avatar.id); setLocalPreview(null); }}
          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
            selectedId === avatar.id && !localPreview
              ? 'border-primary ring-2 ring-primary/30 scale-105'
              : 'border-transparent hover:border-muted-foreground/30'
          }`}
        >
          {renderAvatarSvg(avatar.svg, 'w-full h-full')}
          {selectedId === avatar.id && !localPreview && (
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

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!uploading) onOpenChange(o); }}>
      <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl flex flex-col">
        <SheetHeader className="pb-2">
          <SheetTitle>Foto de Perfil</SheetTitle>
        </SheetHeader>

        {/* Preview */}
        <div className="flex justify-center py-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30">
            {renderAvatar(previewResult, 'w-full h-full object-cover')}
          </div>
        </div>

        <Tabs defaultValue="upload" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upload">Foto</TabsTrigger>
            <TabsTrigger value="male">Masculino</TabsTrigger>
            <TabsTrigger value="female">Feminino</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0 space-y-4 px-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Escolher imagem</>
              )}
            </Button>

            {uploading && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
              </div>
            )}

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2">
              <ImageIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Formatos: JPEG ou PNG. Tamanho máximo 5MB.<br />
                Dimensões mínimas {MIN_DIMENSION}×{MIN_DIMENSION}px.
              </div>
            </div>

            {currentAvatarUrl && (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                disabled={saving || uploading}
                onClick={handleRemovePhoto}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Remover foto atual
              </Button>
            )}
          </TabsContent>

          <ScrollArea className="flex-1 min-h-0">
            <TabsContent value="male" className="mt-0">{renderAvatarGrid(maleAvatars)}</TabsContent>
            <TabsContent value="female" className="mt-0">{renderAvatarGrid(femaleAvatars)}</TabsContent>
          </ScrollArea>

          <div className="pt-4 pb-2">
            <TabsContent value="male" className="mt-0">
              <Button onClick={handleSaveLibrary} disabled={saving || selectedId === currentAvatarId} className="w-full" size="lg">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Confirmar Avatar'}
              </Button>
            </TabsContent>
            <TabsContent value="female" className="mt-0">
              <Button onClick={handleSaveLibrary} disabled={saving || selectedId === currentAvatarId} className="w-full" size="lg">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Confirmar Avatar'}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
