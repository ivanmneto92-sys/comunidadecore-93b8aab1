import { useState } from 'react';
import { Plus, Minus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CreatePollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  onCreated?: () => void;
}

export function CreatePollModal({ 
  open, 
  onOpenChange, 
  channelId,
  onCreated 
}: CreatePollModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [closesInDays, setClosesInDays] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !question.trim() || options.filter(o => o.trim()).length < 2) {
      toast({ variant: 'destructive', title: 'Preencha a pergunta e pelo menos 2 opções' });
      return;
    }

    setCreating(true);
    try {
      // Calculate closes_at if set
      let closesAt = null;
      if (closesInDays) {
        const date = new Date();
        date.setDate(date.getDate() + closesInDays);
        closesAt = date.toISOString();
      }

      // Create poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          question: question.trim(),
          is_multiple_choice: isMultipleChoice,
          closes_at: closesAt,
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create options
      const optionsData = options
        .filter(o => o.trim())
        .map((text, index) => ({
          poll_id: poll.id,
          option_text: text.trim(),
          sort_order: index,
        }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast({ title: 'Enquete criada!' });
      onOpenChange(false);
      onCreated?.();

      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setIsMultipleChoice(false);
      setClosesInDays(null);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({ variant: 'destructive', title: 'Erro ao criar enquete' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Criar Enquete
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question */}
          <div className="space-y-2">
            <Label>Pergunta</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Qual sua opinião sobre...?"
              maxLength={200}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Opções</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Opção ${index + 1}`}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar opção
              </Button>
            )}
          </div>

          {/* Multiple choice toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="multiple-choice" className="text-sm">
              Permitir múltiplas escolhas
            </Label>
            <Switch
              id="multiple-choice"
              checked={isMultipleChoice}
              onCheckedChange={setIsMultipleChoice}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duração (opcional)</Label>
            <div className="flex gap-2">
              {[1, 3, 7].map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant={closesInDays === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setClosesInDays(closesInDays === days ? null : days)}
                >
                  {days} {days === 1 ? 'dia' : 'dias'}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={creating}>
              {creating ? 'Criando...' : 'Criar Enquete'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
