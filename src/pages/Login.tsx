import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
import { SEO } from '@/components/shared/SEO';
import { useAuthStore } from '@/stores/authStore';
import { safeReturnPath } from '@/lib/returnPath';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute (and the pricing page) pass where the visitor was headed —
  // send them back there instead of always dumping them on the overview.
  const destination = safeReturnPath(location.state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
      setIsLoading(false);
    } else {
      toast.success('Welcome back!');
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SEO title="Sign in | ThinkDecor" description="Sign in to your ThinkDecor account." />

      {/* Left panel — the form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-[-0.02em]">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to pick up where you left off.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" state={location.state} className="font-medium text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — the product */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/[0.09] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[hsl(160_84%_45%)]/20 blur-3xl" />

        <div className="relative z-10 max-w-md p-12">
          <div className="overflow-hidden rounded-[22px] border border-white/15 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.45)]">
            <img
              src="/assets/samples/styled_room.png"
              alt="A living room redesigned with ThinkDecor"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <h2 className="mt-9 text-[clamp(1.8rem,3vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.03em] text-primary-foreground">
            Your rooms, redesigned.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-primary-foreground/70">
            Upload a photo, pick a style, and Mantha AI does the rest. Every design lands in your library.
          </p>
        </div>
      </div>
    </div>
  );
}
