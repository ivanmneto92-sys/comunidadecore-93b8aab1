import { NavLink, useLocation } from 'react-router-dom';
import { Home, Bot, GraduationCap, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Prefetch map for lazy-loaded components — cobre tab bar + rotas internas
const routePrefetchMap: Record<string, () => Promise<unknown>> = {
  '/app': () => import('@/pages/Dashboard'),
  '/results': () => import('@/pages/Results'),
  '/academy': () => import('@/pages/Academy'),
  '/community': () => import('@/pages/Community'),
  '/profile': () => import('@/pages/Profile'),
  '/journal': () => import('@/pages/Journal'),
  '/achievements': () => import('@/pages/Achievements'),
  '/affiliates': () => import('@/pages/Affiliates'),
  '/seasons': () => import('@/pages/Seasons'),
  '/mt5': () => import('@/pages/MT5'),
  '/robots': () => import('@/pages/Robots'),
};

const navItems = [
  { to: '/app', icon: Home, label: 'Hub', prefetchKey: null },
  { to: '/robots', icon: Bot, label: 'Robôs', prefetchKey: null },
  { to: '/academy', icon: GraduationCap, label: 'Academy', prefetchKey: 'tutorials-prefetch' },
  { to: '/community', icon: MessageCircle, label: 'Club', prefetchKey: 'channels-prefetch' },
  { to: '/profile', icon: User, label: 'Perfil', prefetchKey: null },
];

export function MobileNav() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const handlePrefetch = useCallback((route: string) => {
    const prefetchComponent = routePrefetchMap[route];
    if (prefetchComponent) prefetchComponent();
    if (route === '/results') {
      queryClient.prefetchQuery({
        queryKey: ['account-metrics', '30d'],
        staleTime: 60 * 1000,
      });
    }
  }, [queryClient]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2 h-14">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === '/app' && location.pathname === '/') ||
            (item.to !== '/app' && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => handlePrefetch(item.to)}
              onTouchStart={() => handlePrefetch(item.to)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[56px]',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
