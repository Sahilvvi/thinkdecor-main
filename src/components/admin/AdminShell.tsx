import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut, ExternalLink, FileText, Inbox, LayoutDashboard, Users, MessageSquare, Menu, ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/blog', label: 'Articles', icon: FileText },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
  { to: '/admin/accounts', label: 'Accounts', icon: Users },
  { to: '/admin/support', label: 'Support', icon: MessageSquare },
];

/** Shared layout for every admin page: same fixed-header + left-sidebar shape as the customer AppShell, so the two feel like one product. */
export function AdminShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000,transparent)]" />
        <div className="absolute -top-24 left-1/2 h-[26rem] w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(168_100%_17%/0.05),transparent_65%)] blur-3xl" />
      </div>

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
            <Logo to="/admin/overview" />
            <span className="hidden items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-primary sm:flex">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-[13px] text-foreground/55 transition-colors hover:text-primary lg:flex"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <ProfileChip />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/40 backdrop-blur-sm lg:flex">
        <SidebarContent scope="desktop" />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-border/60 px-5">
            <Logo to="/admin/overview" />
          </div>
          <SidebarContent scope="mobile" onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="relative z-10 pt-16 lg:pl-64">{children}</main>
    </div>
  );
}

function SidebarContent({ scope, onNavigate }: { scope: 'desktop' | 'mobile'; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const layoutId = `admin-nav-active-${scope}`;
  const activeTo = NAV.find((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)))?.to;

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <nav className="flex flex-col gap-1" aria-label="Admin">
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

      <div className="mt-auto rounded-2xl border border-border/70 bg-background p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/45">ThinkDecor</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/55">
          Manage the journal, contact leads, customer accounts and support queries from one place.
        </p>
      </div>
    </div>
  );
}

function ProfileChip() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const initial = (user?.email ?? 'A').charAt(0).toUpperCase();

  const leave = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="flex items-center gap-2.5">
      <span className="hidden max-w-[180px] truncate text-[12.5px] text-foreground/45 md:block">{user?.email}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
        {initial}
      </span>
      <button
        onClick={leave}
        aria-label="Sign out"
        className="rounded-full border border-foreground/[0.12] p-2 text-foreground/65 transition-colors hover:border-destructive/40 hover:text-destructive"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
