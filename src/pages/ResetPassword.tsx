import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
import { SEO } from '@/components/shared/SEO';
import { useAuthStore } from '@/stores/authStore';

/**
 * Landing page for the link in the password-reset email. Supabase reads the
 * recovery token from the URL and signs the visitor in; this page then lets
 * them choose a new password.
 */
export default function ResetPassword() {
  const { session, initialized, updatePassword } = useAuthStore();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Give the recovery token a moment to be exchanged before calling the link dead.
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error("Those passwords don't match.");
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || "Couldn't update your password.");
      return;
    }
    toast.success('Password updated');
    navigate('/app', { replace: true });
  };

  const checking = !initialized || (!session && !waited);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SEO title="Set a new password | Think Decor" description="Choose a new password for your Think Decor account." />

      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {checking ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Checking your reset link…
          </div>
        ) : !session ? (
          <div>
            <h1 className="font-display text-[32px] font-normal tracking-[-0.01em]">This link has expired</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Reset links only work once and for a limited time. Request a new one and use it straight away.
            </p>
            <Button asChild variant="hero" className="mt-8">
              <Link to="/forgot-password">Send a new link</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="mb-2 font-display text-[32px] font-normal tracking-[-0.01em]">Set a new password</h1>
              <p className="text-muted-foreground">Choose something you haven't used before.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save new password'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
