import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DiscussionThread } from './DiscussionThread';
import { DiscussionComposer } from './DiscussionComposer';
import { AnnouncementCard } from './cards/AnnouncementCard';
import { DailyResultPostCard } from './cards/DailyResultPostCard';
import { RiskReadingCard } from './cards/RiskReadingCard';

interface Post {
  id: string;
  post_type: 'announcement' | 'daily_result' | 'risk_reading';
  title: string;
  content: string | null;
  metadata: Record<string, unknown>;
  is_pinned: boolean;
  published_at: string;
}

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  is_highlighted: boolean;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions?: {
    like: number;
    useful: number;
    user_reacted_like: boolean;
    user_reacted_useful: boolean;
  };
  replies?: Discussion[];
}

interface DiscussionViewProps {
  post: Post;
  onBack: () => void;
  isAdmin: boolean;
}

export function DiscussionView({ post, onBack, isAdmin }: DiscussionViewProps) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async () => {
    try {
      // Fetch all discussions for this post
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('post_discussions')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (discussionsError) throw discussionsError;

      if (!discussionsData || discussionsData.length === 0) {
        setDiscussions([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(discussionsData.map(d => d.user_id))];
      
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Fetch reactions
      const { data: reactionsData } = await supabase
        .from('post_reactions')
        .select('*')
        .in('discussion_id', discussionsData.map(d => d.id));

      // Process reactions
      const reactionsMap = new Map<string, { like: number; useful: number; user_reacted_like: boolean; user_reacted_useful: boolean }>();
      
      discussionsData.forEach(d => {
        const discussionReactions = reactionsData?.filter(r => r.discussion_id === d.id) || [];
        reactionsMap.set(d.id, {
          like: discussionReactions.filter(r => r.reaction_type === 'like').length,
          useful: discussionReactions.filter(r => r.reaction_type === 'useful').length,
          user_reacted_like: discussionReactions.some(r => r.reaction_type === 'like' && r.user_id === user?.id),
          user_reacted_useful: discussionReactions.some(r => r.reaction_type === 'useful' && r.user_id === user?.id),
        });
      });

      // Build discussion tree
      const discussionsWithData = discussionsData.map(d => ({
        ...d,
        profiles: profilesMap.get(d.user_id) || null,
        reactions: reactionsMap.get(d.id),
        replies: [] as Discussion[],
      }));

      // Organize into tree structure
      const rootDiscussions: Discussion[] = [];
      const repliesMap = new Map<string, Discussion[]>();

      discussionsWithData.forEach(d => {
        if (d.parent_id) {
          const existing = repliesMap.get(d.parent_id) || [];
          repliesMap.set(d.parent_id, [...existing, d]);
        } else {
          rootDiscussions.push(d);
        }
      });

      // Attach replies to parent discussions
      rootDiscussions.forEach(d => {
        d.replies = repliesMap.get(d.id) || [];
      });

      setDiscussions(rootDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  }, [post.id, user?.id]);

  useEffect(() => {
    fetchDiscussions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`discussions-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_discussions',
          filter: `post_id=eq.${post.id}`,
        },
        () => fetchDiscussions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, fetchDiscussions]);

  const renderPostCard = () => {
    const discussionCount = discussions.reduce((acc, d) => acc + 1 + (d.replies?.length || 0), 0);

    switch (post.post_type) {
      case 'announcement':
        return (
          <AnnouncementCard
            id={post.id}
            title={post.title}
            content={post.content || ''}
            publishedAt={post.published_at}
            isPinned={post.is_pinned}
            discussionCount={discussionCount}
            onOpenDiscussion={() => {}}
          />
        );
      case 'daily_result':
        return (
          <DailyResultPostCard
            id={post.id}
            title={post.title}
            publishedAt={post.published_at}
            isPinned={post.is_pinned}
            discussionCount={discussionCount}
            metadata={post.metadata as {
              pnl?: number;
              trades?: number;
              profile?: string;
              status?: 'stable' | 'attention' | 'risk';
              aiComment?: string;
            }}
            onOpenDiscussion={() => {}}
          />
        );
      case 'risk_reading':
        return (
          <RiskReadingCard
            id={post.id}
            title={post.title}
            content={post.content || ''}
            publishedAt={post.published_at}
            isPinned={post.is_pinned}
            discussionCount={discussionCount}
            metadata={post.metadata as {
              summary?: string;
              keyPoints?: string[];
              impact?: string;
            }}
            onOpenDiscussion={() => {}}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Feed
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 max-w-3xl mx-auto">
          {/* Original Post Card (without button) */}
          <div className="pointer-events-none [&_button]:hidden">
            {renderPostCard()}
          </div>

          {/* Discussion Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>
                Discussão ({discussions.reduce((acc, d) => acc + 1 + (d.replies?.length || 0), 0)} comentários)
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DiscussionThread
                discussions={discussions}
                onReply={(parentId) => setReplyingTo(parentId)}
                onRefresh={fetchDiscussions}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <DiscussionComposer
            postId={post.id}
            parentId={replyingTo}
            onSuccess={fetchDiscussions}
            onCancelReply={() => setReplyingTo(null)}
          />
        </div>
      </div>
    </div>
  );
}
