import { DiscordLayout } from '@/components/community/DiscordLayout';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/hooks/useAuth';

export default function Community() {
  const { user } = useAuth();

  return (
    <div 
      className="flex flex-col bg-background"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Main content area */}
      <div 
        className="flex-1 overflow-hidden"
        style={{
          paddingBottom: user ? 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' : '0',
        }}
      >
        <DiscordLayout />
      </div>

      {/* Mobile Nav - fixed at bottom */}
      {user && <MobileNav />}
    </div>
  );
}
