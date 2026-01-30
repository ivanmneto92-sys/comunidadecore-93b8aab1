import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { SkipLink } from '@/components/ui/skip-link';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background scrollbar-hidden">
      {/* Skip Link for accessibility */}
      <SkipLink />
      
      {/* Main content with safe area padding */}
      <main 
        id="main-content"
        tabIndex={-1}
        className="flex-1 overflow-y-auto scrollbar-hidden focus:outline-none"
        style={{ 
          paddingBottom: user ? 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 1rem)' : '0',
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      {user && <MobileNav />}
    </div>
  );
}
