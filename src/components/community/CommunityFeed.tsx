import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FeedFilters, PostFilter, SortOrder } from './FeedFilters';
import { AnnouncementCard } from './cards/AnnouncementCard';
import { DailyResultPostCard } from './cards/DailyResultPostCard';

interface Post {
  id: string;
  post_type: 'announcement' | 'daily_result';
  title: string;
  content: string | null;
  metadata: Record<string, unknown>;
  is_pinned: boolean;
  published_at: string;
  discussion_count: number;
}

interface CommunityFeedProps {
  onOpenDiscussion: (post: Post) => void;
}

export function CommunityFeed({ onOpenDiscussion }: CommunityFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('community_posts')
          .select('*');

        if (filter !== 'all') {
          query = query.eq('post_type', filter);
        }

        if (sortOrder === 'pinned') {
          query = query.order('is_pinned', { ascending: false }).order('published_at', { ascending: false });
        } else {
          query = query.order('published_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Fetch discussion counts
        const postsWithCounts = await Promise.all(
          (data || []).map(async (post) => {
            const { count } = await supabase
              .from('post_discussions')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            return {
              ...post,
              post_type: post.post_type as 'announcement' | 'daily_result',
              metadata: (post.metadata || {}) as Record<string, unknown>,
              discussion_count: count || 0,
            };
          })
        );

        setPosts(postsWithCounts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, sortOrder]);

  const renderPost = (post: Post) => {
    switch (post.post_type) {
      case 'announcement':
        return (
          <AnnouncementCard
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content || ''}
            publishedAt={post.published_at}
            isPinned={post.is_pinned}
            discussionCount={post.discussion_count}
            onOpenDiscussion={() => onOpenDiscussion(post)}
          />
        );
      case 'daily_result':
        return (
          <DailyResultPostCard
            key={post.id}
            id={post.id}
            title={post.title}
            publishedAt={post.published_at}
            isPinned={post.is_pinned}
            discussionCount={post.discussion_count}
            metadata={post.metadata as {
              pnl?: number;
              trades?: number;
              profile?: string;
              status?: 'stable' | 'attention' | 'risk';
              aiComment?: string;
            }}
            onOpenDiscussion={() => onOpenDiscussion(post)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <FeedFilters
          activeFilter={filter}
          onFilterChange={setFilter}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      </div>

      {/* Posts */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 max-w-3xl mx-auto">
          {loading ? (
            <FeedSkeleton count={3} />
          ) : posts.length === 0 ? (

            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Nenhuma publicação encontrada.</p>
              <p className="text-xs mt-1">O CORE publicará conteúdo em breve.</p>
            </div>
          ) : (
            posts.map(renderPost)
          )}

          {/* Compliance Footer */}
          <div className="text-center py-6 text-xs text-muted-foreground/60 border-t border-border/30 mt-8">
            <p>Conteúdo educacional e informativo.</p>
            <p>Não constitui recomendação de investimento.</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
