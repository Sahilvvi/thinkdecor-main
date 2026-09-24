import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { SEO } from '@/components/shared/SEO';
import '@/styles/super-admin.css';
import { ApiError, pull } from '@/super/core';
import { mountSuper } from '@/super/boot';

type Phase = 'loading' | 'ready' | 'denied' | 'mfa' | 'error';

/** The super admin panel (/super). The whole panel is drawn by src/super (ported from the design prototype);
 *  this component only checks who is asking, loads the first batch of real data, and mounts it. */
export default function SuperAdmin() {
  const { user, initialized } = useAuthStore();
  const host = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!initialized || !user) return;
    let cancelled = false;
    let unmount: (() => void) | undefined;
    (async () => {
      setPhase('loading');
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
  }, [initialized, user, attempt]);

  if (!initialized) return <Shell><p>Loading…</p></Shell>;
  if (!user) return <Navigate to="/admin" replace />;

  return (
    <>
      <SEO title="Super admin | ThinkDecor" description="ThinkDecor super admin." noindex />
      <div ref={host} style={{ display: phase === 'ready' ? 'block' : 'none' }} />
      {phase === 'loading' && <Shell><p>Loading live data…</p></Shell>}
      {phase === 'denied' && <Shell><h1 style={{ font: '500 28px Georgia,serif' }}>No access</h1><p>{message || 'This account does not have admin access.'}</p><a href="/">Back to the site</a></Shell>}
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
