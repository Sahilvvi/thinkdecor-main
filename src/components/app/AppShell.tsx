import { type ReactNode, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LayoutGrid, Wand2, Plus, LogOut,
  Settings as SettingsIcon, Eraser, Replace as ReplaceIcon, Search, FolderOpen, Zap,
} from 'lucide-react';
import '@/styles/app-theme.css';
import { useAuthStore } from '@/stores/authStore';
import { useDisplayName } from '@/hooks/useProfile';
import { useCreditBalance, useGenerationsRealtime, useGenerations } from '@/lib/generation';
import { PHASE1_PLAN, pence } from '@/lib/billing';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);

const CRUMB: Record<string, [string, string]> = {
  '/app': ['Studio', 'Overview'],
  '/app/templates': ['Studio', 'Templates'],
  '/app/library': ['Studio', 'Projects'],
  '/app/create': ['Tools', 'Create'],
  '/app/cleanup': ['Tools', 'Cleanup'],
  '/app/replace': ['Tools', 'Replace'],
  '/app/settings': ['Account', 'Settings'],
};

/** Shared layout for every signed-in page: sidebar with credits/nav, top bar with search + credits + upgrade. */
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { firstName, fullName, initial, email } = useDisplayName();
  const { data: credits } = useCreditBalance();
  const { data: designs } = useGenerations();

  // Mounted once here (not per-page) so a generation finishing — in this tab
  // or another — updates Overview/Projects live, for as long as the visitor
  // is anywhere under /app.
  useGenerationsRealtime();

  const crumb =
    CRUMB[pathname] ??
    Object.entries(CRUMB)
      .filter(([to]) => to !== '/app' && pathname.startsWith(`${to}/`))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    ['Studio', 'Overview'];
  const fraction = credits === undefined ? 0 : Math.max(0, Math.min(1, credits / PHASE1_PLAN.credits));

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-x">
      <div className="shell">
        <aside className="side">
          <div className="brand"><b>Think</b><i>Decor</i></div>

          <Link to="/app/create" className="newbtn">
            <Plus width={16} height={16} strokeWidth={2.2} />New design<kbd>N</kbd>
          </Link>

          <div className="navgroup">STUDIO</div>
          <nav className="nav">
            <NavLink to="/app" end className={({ isActive }) => (isActive ? 'on' : '')}>
              <LayoutDashboard width={18} height={18} />Overview
            </NavLink>
            <NavLink to="/app/templates" className={({ isActive }) => (isActive ? 'on' : '')}>
              <LayoutGrid width={18} height={18} />Templates<span className="n">7</span>
            </NavLink>
            <NavLink to="/app/library" className={({ isActive }) => (isActive ? 'on' : '')}>
              <FolderOpen width={18} height={18} />Projects<span className="n">{designs?.length ?? 0}</span>
            </NavLink>
          </nav>

          <div className="navgroup">TOOLS</div>
          <nav className="nav">
            <NavLink to="/app/create" className={({ isActive }) => (isActive ? 'on' : '')}>
              <Wand2 width={18} height={18} />Create
            </NavLink>
            <NavLink to="/app/cleanup" className={({ isActive }) => (isActive ? 'on' : '')}>
              <Eraser width={18} height={18} />Cleanup
            </NavLink>
            <NavLink to="/app/replace" className={({ isActive }) => (isActive ? 'on' : '')}>
              <ReplaceIcon width={18} height={18} />Replace
            </NavLink>
          </nav>

          <div className="navgroup">ACCOUNT</div>
          <nav className="nav">
            <NavLink to="/app/settings" className={({ isActive }) => (isActive ? 'on' : '')}>
              <SettingsIcon width={18} height={18} />Settings
            </NavLink>
          </nav>

          <div className="side-foot">
            <div className="cred">
              <div className="cred-top">
                <span className="kicker">Credits</span>
                <Link to="/pricing">Get more</Link>
              </div>
              <div className="cred-v">
                <b>{credits === undefined ? '—' : credits}</b>
                <span>left on Free</span>
              </div>
              <div className="cred-bar">
                <i className={fraction < 0.5 ? 'e' : ''} />
                <i className={fraction < 1 ? 'e' : ''} style={{ animationDelay: '.65s' }} />
              </div>
              <p>Each redesign uses 1 credit{credits !== undefined ? ` · ${credits} ${credits === 1 ? 'design' : 'designs'} to go` : ''}</p>
            </div>
            <div className="me">
              <div className="av l2">{initial}</div>
              <div className="who">
                <b>{fullName}</b>
                <span>{email}</span>
              </div>
              <button type="button" onClick={handleSignOut} aria-label="Sign out"><LogOut width={16} height={16} /></button>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="top">
            <div className="crumb">
              {crumb[0]}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              <b>{crumb[1]}</b>
            </div>
            <Link to="/app/library" className="search">
              <Search width={15} height={15} />
              Search styles, projects…
              <kbd>⌘K</kbd>
            </Link>
            {credits !== undefined && (
              <span className={`credpill${credits <= 0 ? ' warn' : ''}`}>
                <Zap width={14} height={14} />
                <b>{credits}</b> credits
              </span>
            )}
            <Link to="/pricing" className="btn btn-dark">Upgrade · {INTRO}</Link>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
