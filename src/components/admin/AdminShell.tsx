import { type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Inbox, Users, MessageSquare, Search, Bell, ExternalLink, LogOut,
} from 'lucide-react';
import '@/styles/admin-theme.css';
import { useAuthStore } from '@/stores/authStore';
import { useAdminUsers } from '@/lib/admin';
import { useLeadsSummary } from '@/lib/leads';
import { useBlogSummary } from '@/lib/blog';

const CRUMB: Record<string, string> = {
  '/admin/overview': 'Overview',
  '/admin/blog': 'Articles',
  '/admin/leads': 'Leads',
  '/admin/accounts': 'Accounts',
  '/admin/support': 'Support',
};

/** Shared shell for every /admin/* page — sidebar, top bar. New article/edit routes use it too, via the parent layout. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { data: leadsSummary } = useLeadsSummary();
  const { data: blogSummary } = useBlogSummary();
  const { data: accounts } = useAdminUsers();

  const crumb = Object.entries(CRUMB).find(([to]) => pathname === to || pathname.startsWith(`${to}/`))?.[1] ?? 'Admin';
  const initial = (user?.email ?? 'A').charAt(0).toUpperCase();

  const leave = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="admin-x">
      <div className="shell">
        <aside className="side">
          <div className="brand">
            <b>Think</b><i>Decor</i><small>ADMIN</small>
          </div>

          <div className="navgroup">WORKSPACE</div>
          <nav className="nav">
            <NavLink to="/admin/overview" end className={({ isActive }) => (isActive ? 'on' : '')}>
              <LayoutDashboard /> Overview
            </NavLink>
          </nav>

          <div className="navgroup">CONTENT</div>
          <nav className="nav">
            <NavLink to="/admin/blog" className={({ isActive }) => (isActive ? 'on' : '')}>
              <FileText /> Articles <span className="n">{blogSummary?.total ?? '—'}</span>
            </NavLink>
            <NavLink to="/admin/leads" className={({ isActive }) => (isActive ? 'on' : '')}>
              <Inbox /> Leads
              {!!leadsSummary?.unread && <span className="n hot">{leadsSummary.unread}</span>}
              {!leadsSummary?.unread && <span className="n">{leadsSummary?.total ?? '—'}</span>}
            </NavLink>
          </nav>

          <div className="navgroup">PEOPLE</div>
          <nav className="nav">
            <NavLink to="/admin/accounts" className={({ isActive }) => (isActive ? 'on' : '')}>
              <Users /> Accounts <span className="n">{accounts?.length ?? '—'}</span>
            </NavLink>
            <NavLink to="/admin/support" className={({ isActive }) => (isActive ? 'on' : '')}>
              <MessageSquare /> Support
            </NavLink>
          </nav>

          <div className="side-foot">
            <div className="sitecard">
              <span className="pulse" />
              <div><b>thinkdecor.app</b>Site live · all systems normal</div>
            </div>
            <div className="me">
              <div className="av">{initial}</div>
              <div className="who">
                <b>Admin</b>
                <span>{user?.email}</span>
              </div>
              <button type="button" onClick={leave} aria-label="Sign out"><LogOut /></button>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="top">
            <div className="crumb">
              Admin <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              <b>{crumb}</b>
            </div>
            <Link to="/app/library" className="search" aria-label="Search accounts, leads, articles">
              <Search width={15} height={15} />
              Search accounts, leads, articles…
              <kbd>⌘K</kbd>
            </Link>
            <button type="button" className="ib" aria-label="Notifications">
              <Bell width={17} height={17} />
              <span className="dot" />
            </button>
            <a className="btn btn-line" href="/" target="_blank" rel="noreferrer">
              View site <ExternalLink width={14} height={14} />
            </a>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
