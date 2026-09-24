import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Captcha } from '@/components/auth/Captcha';
import { CAPTCHA_ENABLED } from '@/lib/captcha';
import { SEO } from '@/components/shared/SEO';
import { Logo } from '@/components/brand/Logo';
import '@/styles/super-admin.css';
import { ApiError, pull } from '@/super/core';
import { mountSuper } from '@/super/boot';

type Phase = 'login' | 'loading' | 'ready' | 'denied' | 'mfa' | 'error';

/** The super admin panel (/super). Always starts at a dedicated sign-in form — visiting the URL
 *  while already signed in elsewhere (e.g. the customer app) does not open the panel by itself;
 *  it opens only after credentials are submitted right here and the account checks out. The whole
 *  panel itself is drawn by src/super (ported from the design prototype). */
export default function SuperAdmin() {
  const { signIn } = useAuthStore();
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('login');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password, captchaToken ?? undefined);
    setBusy(false);
    if (error) {
      setCaptchaKey((k) => k + 1); // tokens are single-use
      toast.error(/invalid/i.test(error.message) ? 'Wrong email or password' : error.message);
      return;
    }
    setPhase('loading');
  };

  useEffect(() => {
    if (phase !== 'loading') return;
    let cancelled = false;
    let unmount: (() => void) | undefined;
    (async () => {
      try {
        await pull();
        if (cancelled || !host.current) return;
        setPhase('ready');
        unmount = mountSuper(host.current);
      } catch (e) {
        if (cancelled) return;
        const err = e as ApiError;
        setMessage(err.message);
        setPhase(err.code === 'mfa_required' ? 'mfa' : err.code === 'not_admin' || err.code === 'ip_blocked' ? 'denied' : 'error');
      }
    })();
    const onDenied = (ev: Event) => {
      const code = (ev as CustomEvent).detail;
      setPhase(code === 'mfa_required' ? 'mfa' : 'denied');
    };
    window.addEventListener('sa-denied', onDenied);
    return () => { cancelled = true; window.removeEventListener('sa-denied', onDenied); unmount?.(); };
  }, [phase, attempt]);

  if (phase === 'login') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
        <SEO title="Super admin | ThinkDecor" description="ThinkDecor super admin sign-in." noindex />
        <div className="absolute inset-0 bg-grid opacity-[0.025]" />
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-[130px]" />
        <div className="relative w-full max-w-[400px]">
          <Link to="/" className="group mb-8 flex items-center gap-2 text-[13px] text-foreground/50 transition-colors hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to site
          </Link>
          <div className="rounded-[24px] border border-foreground/[0.10] bg-card p-8 shadow-[0_30px_80px_-40px_hsl(168_30%_12%/0.35)] backdrop-blur-2xl">
            <Logo />
            <div className="mt-7 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.09]">
                <Lock className="h-4 w-4 text-primary" />
              </span>
              <h1 className="font-display text-[24px] font-normal tracking-[-0.01em] text-foreground">Super admin</h1>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-foreground/50">
              Sign in with your super admin credentials. This is a separate check — an existing sign-in elsewhere does not open this panel by itself.
            </p>
            <form onSubmit={submit} className="mt-7 space-y-3.5">
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-foreground/[0.12] bg-foreground/[0.03] px-4 py-3 text-[14px] text-foreground outline-none transition-all duration-300 placeholder:text-foreground/38 focus:border-primary/50 focus:ring-4 focus:ring-primary/[0.08]" />
              <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-foreground/[0.12] bg-foreground/[0.03] px-4 py-3 text-[14px] text-foreground outline-none transition-all duration-300 placeholder:text-foreground/38 focus:border-primary/50 focus:ring-4 focus:ring-primary/[0.08]" />
              <Captcha onToken={setCaptchaToken} resetKey={captchaKey} />
              <button type="submit" disabled={busy || (CAPTCHA_ENABLED && !captchaToken)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60">
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

  return (
    <>
      <SEO title="Super admin | ThinkDecor" description="ThinkDecor super admin." noindex />
      <div ref={host} style={{ display: phase === 'ready' ? 'block' : 'none' }} />
      {phase === 'loading' && <Shell><p>Loading live data…</p></Shell>}
      {phase === 'denied' && <Shell><h1 style={{ font: '500 28px Georgia,serif' }}>No access</h1><p>{message || 'This account does not have admin access.'}</p><button onClick={() => setPhase('login')} style={btn}>Back to sign in</button></Shell>}
      {phase === 'error' && <Shell><h1 style={{ font: '500 28px Georgia,serif' }}>Couldn’t load the panel</h1><p>{message}</p><button onClick={() => setAttempt((n) => n + 1)} style={btn}>Try again</button></Shell>}
      {phase === 'mfa' && <MfaGate onDone={() => setAttempt((n) => n + 1)} />}
    </>
  );
}

const btn: React.CSSProperties = { border: 0, borderRadius: 999, padding: '12px 22px', background: '#00594E', color: '#fff', font: '600 14px system-ui', cursor: 'pointer' };

function Shell({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F2F8F7', color: '#0F1F1D', font: '15px system-ui', padding: 24 }}><div style={{ maxWidth: 420, display: 'grid', gap: 12, textAlign: 'center' }}>{children}</div></div>;
}

/** Shown when "Require 2FA" is on and this session has not passed a code yet. */
function MfaGate({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const verify = async () => {
    setErr('');
    const { data: f } = await supabase.auth.mfa.listFactors();
    const factor = f?.totp?.find((x) => x.status === 'verified');
    if (!factor) { setErr('No authenticator app is set up on this account. Ask another super admin to turn 2FA off, or set it up first.'); return; }
    const ch = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (ch.error) { setErr(ch.error.message); return; }
    const v = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: ch.data.id, code });
    if (v.error) { setErr('That code was wrong. Check the time on your phone.'); return; }
    onDone();
  };
  return (
    <Shell>
      <h1 style={{ font: '500 28px Georgia,serif' }}>Two-factor code</h1>
      <p>Enter the 6-digit code from your authenticator app to open the panel.</p>
      <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && verify()} inputMode="numeric" maxLength={6} placeholder="000000" style={{ font: '600 24px system-ui', letterSpacing: '.4em', textAlign: 'center', padding: 12, borderRadius: 12, border: '1.5px solid #D3E6E2' }} />
      {err && <p style={{ color: '#B4322E' }}>{err}</p>}
      <button onClick={verify} style={btn}>Verify</button>
    </Shell>
  );
}
