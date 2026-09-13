import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ExternalLink, FileText, Inbox } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useAuthStore } from '@/stores/authStore';

const TABS = [
  { to: '/admin/blog', label: 'Articles', icon: FileText },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuthStore();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const leave = async () => {
    await signOut();
    nav('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-foreground/[0.09] bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-[1180px] items-center gap-5 px-6">
          <Logo />

          {/* section tabs */}
          <nav className="flex items-center gap-1 rounded-full border border-foreground/[0.09] bg-foreground/[0.025] p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                    active ? 'text-primary-foreground' : 'text-foreground/55 hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-tab-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10 hidden sm:block">{t.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-[13px] text-foreground/55 transition-colors hover:text-primary lg:flex"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <span className="hidden max-w-[180px] truncate text-[12.5px] text-foreground/45 md:block">
              {user?.email}
            </span>
            <button
              onClick={leave}
              className="flex items-center gap-1.5 rounded-full border border-foreground/[0.12] px-3.5 py-2 text-[13px] text-foreground/65 transition-colors hover:border-destructive/40 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
