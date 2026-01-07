-- Adicionar coluna avatar_id para avatares pré-definidos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_id TEXT;

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.avatar_id IS 'ID do avatar pré-definido selecionado pelo usuário';