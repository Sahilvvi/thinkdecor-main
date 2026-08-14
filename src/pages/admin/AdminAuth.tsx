import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SEO } from '@/components/shared/SEO';
import { Logo } from '@/components/brand/Logo';

/**
 * Admin sign-in. Sign-up is deliberately NOT available here.
 *
 * Accounts are created by an administrator in the Supabase dashboard
 * (Authentication → Users → Add user). Anyone who can sign in can read
 * every customer lead, so self-service registration must not exist.
 */
export default function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuthStore();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);

    if (error) {
      toast.error(
        /invalid/i.test(error.message)
          ? 'Wrong email or password'
          : error.message,
      );
      return;
    }
    nav('/admin/blog');
  };

  const field =
    'w-full rounded-xl border border-foreground/[0.12] bg-foreground/[0.03] px-4 py-3 text-[14px] ' +
    'text-foreground outline-none transition-all duration-300 placeholder:text-foreground/38 ' +
    'focus:border-primary/50 focus:ring-4 focus:ring-primary/[0.08]';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      <SEO title="Admin · ThinkDecor" description="ThinkDecor content administration." />
      <div className="absolute inset-0 bg-grid opacity-[0.025]" />
      <div className="absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-[130px]" />

      <div className="relative w-full max-w-[400px]">
        <Link
          to="/"
          className="group mb-8 flex items-center gap-2 text-[13px] text-foreground/50 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to site
        </Link>

        <div className="rounded-[24px] border border-foreground/[0.10] bg-card p-8 shadow-[0_30px_80px_-40px_hsl(168_30%_12%/0.35)] backdrop-blur-2xl">
          <Logo />

          <div className="mt-7 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.09]">
              <Lock className="h-4 w-4 text-primary" />
            </span>
            <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-foreground">
              Sign in
            </h1>
          </div>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-foreground/50">
            Manage journal articles and contact leads.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-3.5">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={field}
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-foreground/40">
            Accounts are created by an administrator.
            <br />
            Lost access? Email info@thinkdecor.app
          </p>
        </div>
      </div>
    </div>
  );
}
