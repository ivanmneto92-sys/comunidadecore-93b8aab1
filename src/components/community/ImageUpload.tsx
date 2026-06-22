import { useState, useRef } from 'react';
import { Image, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { buildErrorToast } from '@/lib/toastError';

interface ImageUploadProps {
  onImageSelected: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelected, disabled }: ImageUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Selecione uma imagem válida' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'A imagem deve ter no máximo 5MB' });
      return;
    }

    // Mostrar preview local
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      onImageSelected(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ variant: 'destructive', title: 'Erro ao enviar imagem' });
      setPreviewUrl(null);
      onImageSelected(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg border border-border"
          />
          <Button aria-label="Ação"
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
            onClick={clearImage}
            disabled={uploading}
          >
            <X className="h-3 w-3" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <Button aria-label="Ação"
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
