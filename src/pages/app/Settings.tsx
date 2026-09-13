import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLink, Loader2, LogOut, Sparkles } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import {
  isActiveSubscription, useProfile, useSubscription, useUpdateProfile,
} from '@/hooks/useProfile';
import { formatDate, isSetupError, useCreditBalance } from '@/lib/generation';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';
import { CheckoutError, openBillingPortal } from '@/lib/checkout';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);

export default function Settings() {
  const { user, updatePassword, signOut } = useAuthStore();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: credits } = useCreditBalance();
  const { data: subscription } = useSubscription();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  // Fill the form once, when the profile first arrives — never overwrite typing.
  useEffect(() => {
    if (hydrated || profileLoading) return;
    const meta = (user?.user_metadata ?? {}) as { name?: string; phone?: string };
    setName(profile?.name ?? meta.name ?? '');
    setPhone((profile as { phone?: string | null } | null)?.phone ?? meta.phone ?? '');
    setHydrated(true);
  }, [hydrated, profileLoading, profile, user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim() || null });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(
        isSetupError(err)
          ? 'Phone numbers can be saved once the latest database update is applied.'
          : "Couldn't save your profile. Please try again.",
      );
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error("Those passwords don't match.");
      return;
    }
    setSavingPassword(true);
    const { error } = await updatePassword(password);
    setSavingPassword(false);
    if (error) {
      toast.error(error.message || "Couldn't update your password.");
      return;
    }
    setPassword('');
    setConfirm('');
    toast.success('Password updated');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const manageBilling = async () => {
    setOpeningPortal(true);
    try {
      await openBillingPortal();
      // On success the browser navigates to Stripe, so nothing runs after this.
    } catch (err) {
      toast.error(err instanceof CheckoutError ? err.message : "Couldn't open billing. Please try again.");
      setOpeningPortal(false);
    }
  };

  const active = isActiveSubscription(subscription);
  const periodEnd = subscription?.current_period_end ? formatDate(subscription.current_period_end) : null;

  return (
    <>
      <SEO title="Settings | ThinkDecor" description="Manage your ThinkDecor account." />

      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">Settings</h1>
        <p className="mt-1 text-[15px] text-foreground/55">Your profile, password and plan.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          {/* Profile */}
          <section className="rounded-[22px] border border-border/70 bg-card p-6">
            <h2 className="text-[16px] font-semibold text-foreground">Profile</h2>
            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Full name</Label>
                <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" value={user?.email ?? ''} disabled />
                <p className="text-xs text-muted-foreground">
                  To change your email, <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone">Phone number</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={updateProfile.isPending || !hydrated}>
                {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save profile
              </Button>
            </form>
          </section>

          {/* Password */}
          <section className="rounded-[22px] border border-border/70 bg-card p-6">
            <h2 className="text-[16px] font-semibold text-foreground">Password</h2>
            <form onSubmit={savePassword} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-password">New password</Label>
                <Input
                  id="settings-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-confirm">Confirm new password</Label>
                <Input
                  id="settings-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" variant="outline" disabled={savingPassword}>
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          {/* Plan & credits */}
          <section className="rounded-[22px] border border-border/70 bg-card p-6">
            <h2 className="text-[16px] font-semibold text-foreground">Plan & credits</h2>

            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-[26px] font-bold leading-none tracking-[-0.02em] text-foreground">
                  {credits ?? '—'}
                </p>
                <p className="mt-1 text-[13px] text-foreground/55">credits remaining</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-secondary/70 px-4 py-3 text-[14px]">
              {active ? (
                <>
                  <p className="font-semibold text-foreground">ThinkDecor plan · active</p>
                  {periodEnd && (
                    <p className="mt-0.5 text-foreground/60">
                      {subscription?.cancel_at_period_end ? `Ends ${periodEnd}` : `Renews ${periodEnd}`} ·{' '}
                      {PHASE1_PLAN.credits} credits each month
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold text-foreground">Free</p>
                  <p className="mt-0.5 text-foreground/60">No active plan.</p>
                </>
              )}
            </div>

            {!active && (
              <Button asChild variant="hero" className="mt-4 w-full">
                <Link to="/pricing">Upgrade — {INTRO} first month, then {MONTHLY}</Link>
              </Button>
            )}

            {subscription && (
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={manageBilling} disabled={openingPortal}>
                  {openingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage billing
                </Button>
                <p className="mt-2 text-center text-[12.5px] text-foreground/50">
                  Cancel, change your card or download invoices.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[22px] border border-border/70 bg-card p-6">
            <h2 className="text-[16px] font-semibold text-foreground">Session</h2>
            <p className="mt-1 text-[13.5px] text-foreground/55">Signed in as {user?.email}</p>
            <Button variant="outline" className="mt-4" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
