import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { safeReturnPath } from '@/lib/returnPath';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where a signed-out visitor is sent. Customer app → /login, CMS → /admin. */
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, initialized, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** For /login, /signup and /forgot-password: someone already signed in skips ahead. */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (initialized && user) {
    return <Navigate to={safeReturnPath(location.state)} replace />;
  }

  return <>{children}</>;
}
