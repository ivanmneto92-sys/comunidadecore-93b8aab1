import { AppLayout } from '@/components/layout/AppLayout';
import { DiscordLayout } from '@/components/community/DiscordLayout';

export default function Community() {
  return (
    <AppLayout>
      <div className="h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))]">
        <DiscordLayout />
      </div>
    </AppLayout>
  );
}
