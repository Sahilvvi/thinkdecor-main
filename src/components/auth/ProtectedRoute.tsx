import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { safeReturnPath } from '@/lib/returnPath';
import { useIsAdmin } from '@/hooks/useProfile';
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

/**
 * CMS pages (journal + leads): signed in AND holding the admin role. Customers
 * can sign up now, so being signed in alone is no longer enough. The database
 * enforces the same rule (20260914100000_lock_admin_data.sql) — this just
 * stops a customer seeing an empty admin screen.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute redirectTo="/admin">
      <AdminGate>{children}</AdminGate>
    </ProtectedRoute>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { data: isAdmin, isPending } = useIsAdmin();
  const { signOut } = useAuthStore();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">No admin access</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            This account can't manage the journal or leads. If that's a mistake, email info@thinkdecor.app.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/app" className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground">
              Go to my designs
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full border border-border px-5 py-2.5 text-[14px] font-medium text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
