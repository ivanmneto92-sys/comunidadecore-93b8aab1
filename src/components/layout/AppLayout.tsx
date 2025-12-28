import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      {user && <MobileNav />}
    </div>
  );
}
