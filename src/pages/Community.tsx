import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { DiscussionView } from '@/components/community/DiscussionView';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Building2 } from 'lucide-react';

interface Post {
  id: string;
  post_type: 'announcement' | 'daily_result' | 'risk_reading';
  title: string;
  content: string | null;
  metadata: Record<string, unknown>;
  is_pinned: boolean;
  published_at: string;
  discussion_count?: number;
}

export default function Community() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const initialize = async () => {
      // Check admin status
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'moderator'])
          .maybeSingle();
        setIsAdmin(!!data);
      }
      setLoading(false);
    };

    initialize();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Comunidade</h1>
            <p className="text-xs text-muted-foreground">Feed Institucional CORE</p>
          </div>
        </div>

        {/* Content */}
        {selectedPost ? (
          <DiscussionView
            post={selectedPost}
            onBack={() => setSelectedPost(null)}
            isAdmin={isAdmin}
          />
        ) : (
          <CommunityFeed onOpenDiscussion={(post) => setSelectedPost(post)} />
        )}
      </div>
    </AppLayout>
  );
}
