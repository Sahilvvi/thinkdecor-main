import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Camera, ExternalLink, Loader2, Lock, LogOut, Mail, Monitor, User, Zap, LifeBuoy,
} from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Reveal } from '@/components/premium/Motion';
import { useAuthStore } from '@/stores/authStore';
import {
  isActiveSubscription, useProfile, useSubscription, useUpdateProfile,
} from '@/hooks/useProfile';
import { formatDate, isSetupError, useCreditBalance } from '@/lib/generation';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';
import { CheckoutError, openBillingPortal } from '@/lib/checkout';
import { uploadAvatar, UploadError } from '@/lib/upload';
import { useMyTickets, useRaiseTicket, type TicketStatus } from '@/lib/support';

const TICKET_STATUS_STYLE: Record<TicketStatus, string> = {
  open: 'bg-primary/12 text-primary',
  answered: 'bg-amber-500/14 text-amber-700',
  resolved: 'bg-foreground/[0.06] text-foreground/45',
};

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);

export default function Settings() {
  const { user, updatePassword, updateEmail, signOut } = useAuthStore();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: credits } = useCreditBalance();
  const { data: subscription } = useSubscription();
  const { data: tickets } = useMyTickets();
  const raiseTicket = useRaiseTicket();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

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

  const pickAvatar = async (file: File | undefined) => {
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(user.id, file);
      await updateProfile.mutateAsync({ avatar_url: url });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err instanceof UploadError ? err.message : "Couldn't update your photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const sendEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (!trimmed || trimmed === user?.email) return;
    setSavingEmail(true);
    const { error } = await updateEmail(trimmed);
    setSavingEmail(false);
    if (error) {
      toast.error(error.message || "Couldn't start the email change. Please try again.");
      return;
    }
    setEmailSent(true);
    toast.success(`Check ${trimmed} for a confirmation link.`);
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

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    try {
      await raiseTicket.mutateAsync({ subject: ticketSubject.trim(), message: ticketMessage.trim() });
      setTicketSubject('');
      setTicketMessage('');
      toast.success("Query sent — we'll reply here.");
    } catch (err) {
      toast.error(
        isSetupError(err)
          ? 'Support queries can be raised once the latest database update is applied.'
          : "Couldn't send that. Please try again.",
      );
    }
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

      <Reveal>
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Settings
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-normal tracking-[-0.01em] text-foreground">Settings</h1>
        <p className="mt-1 text-[15px] text-foreground/55">Your profile, password and plan.</p>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <Reveal delay={0.06} className="space-y-6">
          {/* Profile */}
          <section className="rounded-[22px] border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_18px_44px_-30px_hsl(168_30%_15%/0.35)]">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </span>
              Profile
            </h2>

            {/* Avatar */}
            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Change profile photo"
                className="group relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary transition-opacity disabled:opacity-70"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[20px] font-semibold">{(name || user?.email || 'T').charAt(0).toUpperCase()}</span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Camera className="h-4 w-4 text-white" />}
                </span>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  hidden
                  onChange={(e) => { pickAvatar(e.target.files?.[0]); e.target.value = ''; }}
                />
              </button>
              <div>
                <p className="text-[13.5px] font-medium text-foreground">Profile photo</p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-[13px] text-primary hover:underline disabled:opacity-60"
                >
                  {uploadingAvatar ? 'Uploading…' : 'Change photo'}
                </button>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Full name</Label>
                <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" value={user?.email ?? ''} disabled />
                {!editingEmail ? (
                  <button
                    type="button"
                    onClick={() => { setNewEmail(''); setEmailSent(false); setEditingEmail(true); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Change email
                  </button>
                ) : emailSent ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 text-primary" /> Check {newEmail} for a confirmation link — it won't change until you click it.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@email.com"
                      className="h-9 max-w-[240px] text-[13.5px]"
                    />
                    <Button type="button" size="sm" disabled={savingEmail || !newEmail.trim()} onClick={sendEmailChange}>
                      {savingEmail && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Send confirmation
                    </Button>
                    <button type="button" onClick={() => setEditingEmail(false)} className="text-xs text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                )}
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
              <Button type="submit" variant="hero" disabled={updateProfile.isPending || !hydrated}>
                {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save profile
              </Button>
            </form>
          </section>

          {/* Password */}
          <section className="rounded-[22px] border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_18px_44px_-30px_hsl(168_30%_15%/0.35)]">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-4 w-4 text-primary" />
              </span>
              Password
            </h2>
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

          {/* Support */}
          <section className="rounded-[22px] border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_18px_44px_-30px_hsl(168_30%_15%/0.35)]">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <LifeBuoy className="h-4 w-4 text-primary" />
              </span>
              Raise a query
            </h2>
            <p className="mt-1.5 text-[13px] text-foreground/50">
              Something not working, or a question about your account? We'll reply right here.
            </p>
            <form onSubmit={submitTicket} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-subject">Subject</Label>
                <Input
                  id="ticket-subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. My last design didn't generate"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-message">Message</Label>
                <textarea
                  id="ticket-message"
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-[14px] text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/[0.08]"
                  placeholder="Tell us what happened…"
                />
              </div>
              <Button type="submit" variant="glow" disabled={raiseTicket.isPending}>
                {raiseTicket.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Send query
              </Button>
            </form>

            {!!tickets?.length && (
              <div className="mt-6 space-y-2.5 border-t border-border/60 pt-5">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[13.5px] font-medium text-foreground">{t.subject}</p>
                      <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${TICKET_STATUS_STYLE[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-foreground/55">{t.message}</p>
                    {t.admin_reply && (
                      <p className="mt-2 rounded-lg bg-primary/[0.06] px-3 py-2 text-[12.5px] text-foreground/75">
                        <span className="font-medium text-primary">Reply: </span>{t.admin_reply}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.12} className="space-y-6">
          {/* Plan & credits */}
          <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,hsl(168_100%_14%),hsl(168_85%_20%)_60%,hsl(166_70%_27%))] p-6 text-white shadow-[0_24px_60px_-32px_hsl(168_100%_17%/0.55)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_100%_at_100%_0%,#000,transparent)]"
            />
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(160_84%_45%)]/25 blur-3xl" />
            <div
              aria-hidden
              className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.2),transparent)] mix-blend-overlay"
              style={{ animationDelay: '1.5s' }}
            />

            <h2 className="relative flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
              <Zap className="h-3.5 w-3.5 text-mint" /> Plan & credits
            </h2>

            <p className="relative mt-3 text-[42px] font-bold leading-none tracking-[-0.03em]">
              {credits ?? '—'}
            </p>
            <p className="relative mt-1.5 text-[13px] text-white/55">credits remaining</p>

            <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-mint to-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: credits === undefined ? 0 : Math.max(0, Math.min(1, credits / PHASE1_PLAN.credits)) }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            <div className="relative mt-5 flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-[14px]">
              {active && (
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                </span>
              )}
              {active ? (
                <div>
                  <p className="font-semibold text-white">ThinkDecor plan · active</p>
                  {periodEnd && (
                    <p className="mt-0.5 text-white/55">
                      {subscription?.cancel_at_period_end ? `Ends ${periodEnd}` : `Renews ${periodEnd}`} ·{' '}
                      {PHASE1_PLAN.credits} credits each month
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-white">Free</p>
                  <p className="mt-0.5 text-white/55">No active plan.</p>
                </div>
              )}
            </div>

            {!active && (
              <Link
                to="/pricing"
                className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-primary transition-transform duration-300 hover:scale-[1.02]"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,hsl(168_100%_17%/0.1),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative">Upgrade — {INTRO} first month, then {MONTHLY}</span>
              </Link>
            )}

            {subscription && (
              <div className="relative mt-4">
                <button
                  type="button"
                  onClick={manageBilling}
                  disabled={openingPortal}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                >
                  {openingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage billing
                </button>
                <p className="mt-2 text-center text-[12.5px] text-white/45">
                  Cancel, change your card or download invoices.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[22px] border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_18px_44px_-30px_hsl(168_30%_15%/0.35)]">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Monitor className="h-4 w-4 text-primary" />
              </span>
              Session
            </h2>
            <p className="mt-2 text-[13.5px] text-foreground/55">Signed in as {user?.email}</p>
            <Button variant="outline" className="mt-4" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </section>
        </Reveal>
      </div>
    </>
  );
}
