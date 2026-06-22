import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLeadProfile } from '@/hooks/useLeadProfile';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  skipLeadCheck?: boolean;
}

export function ProtectedRoute({ children, skipLeadCheck }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: leadProfile, isLoading: leadLoading } = useLeadProfile();

  if (loading || (user && !skipLeadCheck && leadLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!skipLeadCheck && !leadProfile && location.pathname !== '/welcome-form') {
    return <Navigate to="/welcome-form" replace />;
  }

  return <>{children}</>;
}
