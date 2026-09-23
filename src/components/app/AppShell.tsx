import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, LayoutGrid, Images, Wand2, Plus, Menu, LogOut, CreditCard,
  Settings as SettingsIcon, Eraser, Replace as ReplaceIcon, Search, Bell, FolderOpen,
} from 'lucide-react';

import { Logo } from '@/components/brand/Logo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Magnetic } from '@/components/premium/Motion';
import { useAuthStore } from '@/stores/authStore';
import { useDisplayName } from '@/hooks/useProfile';
import { useCreditBalance, useGenerationsRealtime } from '@/lib/generation';
import { PHASE1_PLAN, pence } from '@/lib/billing';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);

const NAV = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/templates', label: 'Templates', icon: LayoutGrid },
  { to: '/app/library', label: 'Projects', icon: FolderOpen },
  { to: '/app/create', label: 'Create', icon: Wand2 },
  { to: '/app/cleanup', label: 'Cleanup', icon: Eraser },
  { to: '/app/replace', label: 'Replace', icon: ReplaceIcon },
];

/** Shared layout for every signed-in page: logo left, credits + profile right, section nav. */
export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  // Mounted once here (not per-page) so a generation finishing — in this tab
  // or another — updates Overview/Projects live, for as long as the visitor
  // is anywhere under /app.
  useGenerationsRealtime();

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000,transparent)]" />
        <div className="absolute -top-24 left-1/2 h-[26rem] w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(168_100%_17%/0.05),transparent_65%)] blur-3xl" />
      </div>

      {/* Desktop sidebar: its own logo row at top, spanning full height. */}
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm lg:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Logo to="/app" />
        </div>
        <SidebarContent scope="desktop" />
      </aside>

      {/* Top bar: only spans the content column on desktop (offset past the sidebar), full width on mobile. */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:left-64">
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
              className="-ml-1 rounded-lg p-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo to="/app" />
            </div>
            <HeaderSearch />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CreditsPill />
            <NotificationsBell />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-border/60 px-5">
            <Logo to="/app" />
          </div>
          <SidebarContent scope="mobile" onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="relative z-10 pt-16 lg:pl-64">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ scope, onNavigate }: { scope: 'desktop' | 'mobile'; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const layoutId = `app-nav-active-${scope}`;
  const allLinks = [...NAV, { to: '/app/settings', label: 'Settings', icon: SettingsIcon, end: undefined }];
  const activeTo = allLinks.find((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)))?.to;

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Magnetic strength={0.2}>
        <Link
          to="/app/create"
          onClick={onNavigate}
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground shadow-[0_12px_28px_-12px_hsl(168_100%_17%/0.55)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.2),transparent)] transition-transform duration-700 group-hover:translate-x-full"
          />
          <Plus className="relative h-4 w-4" />
          <span className="relative">New design</span>
        </Link>
      </Magnetic>

      <nav className="flex flex-col gap-1" aria-label="App">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-foreground/65 transition-colors hover:text-foreground"
          >
            {activeTo === to && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-primary/10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <Icon className={`relative h-[18px] w-[18px] ${activeTo === to ? 'text-primary' : ''}`} />
            <span className={`relative ${activeTo === to ? 'text-primary' : ''}`}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/app/settings"
        onClick={onNavigate}
        className="relative -mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-foreground/65 transition-colors hover:text-foreground"
      >
        {activeTo === '/app/settings' && (
          <motion.span
            layoutId={layoutId}
            className="absolute inset-0 rounded-xl bg-primary/10"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        )}
        <SettingsIcon className={`relative h-[18px] w-[18px] ${activeTo === '/app/settings' ? 'text-primary' : ''}`} />
        <span className={`relative ${activeTo === '/app/settings' ? 'text-primary' : ''}`}>Settings</span>
      </NavLink>

      <div className="mt-auto">
        <CreditsCard onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/** Searches saved projects by title — submits to the Projects page, which reads `?q=`. */
function HeaderSearch() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/app/library?q=${encodeURIComponent(q)}` : '/app/library');
  };

  return (
    <form onSubmit={submit} className="relative hidden w-full max-w-[280px] sm:block">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search your projects"
        className="w-full rounded-full border border-border/70 bg-card py-2 pl-10 pr-4 text-[13.5px] outline-none transition-colors placeholder:text-foreground/40 focus:border-primary"
      />
    </form>
  );
}

function NotificationsBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative rounded-full p-2 text-foreground/60 outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Bell className="h-[18px] w-[18px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="text-[13.5px] font-semibold text-foreground">Notifications</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <p className="px-2 py-3 text-center text-[13px] text-muted-foreground">You're all caught up.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreditsPill() {
  const { data: credits, isLoading, error } = useCreditBalance();
  if (isLoading || error || credits === undefined) return null;

  const empty = credits <= 0;
  return (
    <Link
      to={empty ? '/pricing' : '/app/create'}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        empty
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15'
          : 'border-primary/20 bg-primary/[0.07] text-primary hover:bg-primary/[0.12]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${empty ? 'bg-amber-500' : 'bg-primary'}`} />
      <span>
        {credits}
        <span className="hidden sm:inline"> {credits === 1 ? 'credit' : 'credits'}</span>
      </span>
    </Link>
  );
}

function CreditsCard({ onNavigate }: { onNavigate?: () => void }) {
  const { data: credits, error } = useCreditBalance();
  const unavailable = !!error;
  const empty = !unavailable && credits !== undefined && credits <= 0;
  const fraction = credits === undefined ? 0 : Math.max(0, Math.min(1, credits / PHASE1_PLAN.credits));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background p-4">
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/[0.06] blur-2xl" />
      <p className="relative text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/45">Credits</p>
      <p className="relative mt-1 text-[26px] font-bold leading-none tracking-[-0.02em] text-foreground">
        {unavailable || credits === undefined ? '—' : credits}
      </p>
      {!unavailable && credits !== undefined && (
        <div className="relative mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className={`h-full rounded-full ${empty ? 'bg-amber-500' : 'bg-gradient-to-r from-primary to-mint'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: fraction }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      )}
      <p className="relative mt-2.5 text-[12.5px] leading-snug text-foreground/55">
        {unavailable
          ? 'Credits are being set up.'
          : empty
            ? "You've used your free redesigns."
            : 'Each redesign uses 1 credit.'}
      </p>
      <Link
        to="/pricing"
        onClick={onNavigate}
        className="relative mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
      >
        {empty ? `Upgrade — ${INTRO} first month` : 'Get more credits'}
      </Link>
    </div>
  );
}

function ProfileMenu() {
  const { firstName, fullName, initial, email } = useDisplayName();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 sm:pr-3"
        aria-label="Account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden text-[13.5px] font-medium text-foreground sm:inline">Hello, {firstName}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-[14px] font-semibold text-foreground">{fullName}</p>
          <p className="truncate text-[12px] text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/app')}>
          <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/app/library')}>
          <Images className="mr-2 h-4 w-4" /> Projects
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/app/settings')}>
          <SettingsIcon className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/pricing')}>
          <CreditCard className="mr-2 h-4 w-4" /> Plans & credits
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
