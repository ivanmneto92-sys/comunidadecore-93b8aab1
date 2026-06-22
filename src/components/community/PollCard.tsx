import { useState, useEffect } from 'react';
import { format, parseISO, isPast, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, Clock, Check, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { buildErrorToast } from '@/lib/toastError';

interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
}

interface Poll {
  id: string;
  question: string;
  is_multiple_choice: boolean;
  closes_at: string | null;
  created_at: string;
  user_id: string;
  options: PollOption[];
  total_votes: number;
  user_votes: string[];
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PollCardProps {
  poll: Poll;
  onVoteUpdate?: () => void;
}

export function PollCard({ poll, onVoteUpdate }: PollCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(poll.user_votes);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(poll.user_votes.length > 0);

  const isClosed = poll.closes_at ? isPast(parseISO(poll.closes_at)) : false;
  const canVote = user && !isClosed && !hasVoted;

  const handleOptionClick = (optionId: string) => {
    if (!canVote) return;

    if (poll.is_multiple_choice) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (!user || selectedOptions.length === 0) return;

    setVoting(true);
    try {
      const votes = selectedOptions.map(optionId => ({
        poll_id: poll.id,
        option_id: optionId,
        user_id: user.id,
      }));

      const { error } = await supabase.from('poll_votes').insert(votes);

      if (error) throw error;

      setHasVoted(true);
      toast({ title: 'Voto registrado!' });
      onVoteUpdate?.();
    } catch (error) {
      toast(buildErrorToast(error, { action: 'registrar seu voto' }));
    } finally {
      setVoting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border-b border-border">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase">Enquete</span>
        {isClosed && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            Encerrada
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Question */}
        <div>
          <p className="font-semibold text-sm">{poll.question}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            por {poll.profiles?.display_name || 'Usuário'} • {formatTime(poll.created_at)}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage = poll.total_votes > 0 
              ? Math.round((option.vote_count / poll.total_votes) * 100) 
              : 0;
            const isSelected = selectedOptions.includes(option.id);
            const isUserVote = poll.user_votes.includes(option.id);

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={!canVote}
                className={cn(
                  'w-full relative rounded-lg border transition-all text-left',
                  canVote && 'hover:border-primary cursor-pointer',
                  isSelected && !hasVoted && 'border-primary bg-primary/5',
                  hasVoted || isClosed ? 'cursor-default' : '',
                  !isSelected && !hasVoted && 'border-border'
                )}
              >
                {/* Progress background */}
                {(hasVoted || isClosed) && (
                  <div 
                    className="absolute inset-0 bg-primary/10 rounded-lg transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative px-3 py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {canVote && (
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                    )}
                    <span className="text-sm">{option.option_text}</span>
                    {isUserVote && (
                      <span className="text-[10px] text-primary">(seu voto)</span>
                    )}
                  </div>
                  
                  {(hasVoted || isClosed) && (
                    <span className="text-xs font-medium text-muted-foreground shrink-0">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote button */}
        {canVote && selectedOptions.length > 0 && (
          <Button 
            onClick={handleVote} 
            disabled={voting}
            className="w-full"
            size="sm"
          >
            {voting ? 'Votando...' : 'Votar'}
          </Button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{poll.total_votes} {poll.total_votes === 1 ? 'voto' : 'votos'}</span>
          </div>
          
          {poll.closes_at && !isClosed && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Encerra {formatTime(poll.closes_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
