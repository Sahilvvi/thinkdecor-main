import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LayoutGrid, Images, Wand2, Plus, Menu, Sparkles, LogOut, CreditCard,
  Settings as SettingsIcon,
} from 'lucide-react';

import { Logo } from '@/components/brand/Logo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useDisplayName } from '@/hooks/useProfile';
import { useCreditBalance } from '@/lib/generation';
import { PHASE1_PLAN, pence } from '@/lib/billing';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);

const NAV = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/templates', label: 'Templates', icon: LayoutGrid },
  { to: '/app/library', label: 'Library', icon: Images },
  { to: '/app/create', label: 'Create', icon: Wand2 },
];

/** Shared layout for every signed-in page: logo left, credits + profile right, section nav. */
export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
              className="-ml-1 rounded-lg p-2 text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo to="/app" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CreditsPill />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 flex-col border-r border-border/60 bg-card/40 lg:flex">
        <SidebarContent />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-border/60 px-5">
            <Logo to="/app" />
          </div>
          <SidebarContent onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="pt-16 lg:pl-64">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        to="/app/create"
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground shadow-[0_12px_28px_-12px_hsl(168_100%_17%/0.55)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        New design
      </Link>

      <nav className="flex flex-col gap-1" aria-label="App">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/65 hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/app/settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          `-mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
            isActive ? 'bg-primary/10 text-primary' : 'text-foreground/65 hover:bg-secondary hover:text-foreground'
          }`
        }
      >
        <SettingsIcon className="h-[18px] w-[18px]" />
        Settings
      </NavLink>

      <div className="mt-auto">
        <CreditsCard onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function CreditsPill() {
  const { data: credits, isLoading, error } = useCreditBalance();
  if (isLoading || error || credits === undefined) return null;

  const empty = credits <= 0;
  return (
    <Link
      to={empty ? '/pricing' : '/app/create'}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        empty
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15'
          : 'border-primary/20 bg-primary/[0.07] text-primary hover:bg-primary/[0.12]'
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
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

  return (
    <div className="rounded-2xl border border-border/70 bg-background p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/45">Credits</p>
      <p className="mt-1 text-[26px] font-bold leading-none tracking-[-0.02em] text-foreground">
        {unavailable || credits === undefined ? '—' : credits}
      </p>
      <p className="mt-2 text-[12.5px] leading-snug text-foreground/55">
        {unavailable
          ? 'Credits are being set up.'
          : empty
            ? "You've used your free redesigns."
            : 'Each redesign uses 1 credit.'}
      </p>
      <Link
        to="/pricing"
        onClick={onNavigate}
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
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
          <Images className="mr-2 h-4 w-4" /> Library
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
