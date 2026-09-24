import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, FileText, Inbox, Users, MessageSquare, Search, Bell, ExternalLink, LogOut, Menu, X,
  CornerDownLeft,
} from 'lucide-react';
import '@/styles/admin-theme.css';
import { useAuthStore } from '@/stores/authStore';
import { useAdminUsers } from '@/lib/admin';
import { listLeads, useLeadsSummary } from '@/lib/leads';
import { listAll, useBlogSummary } from '@/lib/blog';
import { useAllTickets } from '@/lib/support';

const CRUMB: Record<string, string> = {
  '/admin/overview': 'Overview',
  '/admin/blog': 'Articles',
  '/admin/leads': 'Leads',
  '/admin/accounts': 'Accounts',
  '/admin/support': 'Support',
};

const PAGES = [
  { label: 'Overview', sub: 'Numbers at a glance', to: '/admin/overview' },
  { label: 'Articles', sub: 'The journal', to: '/admin/blog' },
  { label: 'New article', sub: 'Write and publish', to: '/admin/blog/new' },
  { label: 'Leads', sub: 'Contact form and newsletter sign-ups', to: '/admin/leads' },
  { label: 'Accounts', sub: 'People and plans', to: '/admin/accounts' },
  { label: 'Support', sub: 'Customer queries', to: '/admin/support' },
];

interface Hit { group: string; label: string; sub: string; to: string }

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase();
const has = (term: string, ...fields: (string | null | undefined)[]) => fields.some((f) => norm(f).includes(term));

/** Shared shell for every /admin/* page — sidebar, top bar. New article/edit routes use it too, via the parent layout. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const leadsQ = useLeadsSummary();
  const blogQ = useBlogSummary();
  const accountsQ = useAdminUsers();
  const ticketsQ = useAllTickets();
  const leadsSummary = leadsQ.data;
  const blogSummary = blogQ.data;
  const accounts = accountsQ.data;
  const tickets = ticketsQ.data;

  const crumb = Object.entries(CRUMB).find(([to]) => pathname === to || pathname.startsWith(`${to}/`))?.[1] ?? 'Admin';
  const initial = (user?.email ?? 'A').charAt(0).toUpperCase();

  const leave = async () => {
    await signOut();
    navigate('/admin');
  };

  // ---- mobile drawer ---------------------------------------------------------
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // ---- global search ---------------------------------------------------------
  const [term, setTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // Leads and articles are only fetched once someone actually starts searching.
  const leadsIndex = useQuery({ queryKey: ['admin-search', 'leads'], queryFn: listLeads, enabled: searchOpen, staleTime: 60_000 });
  const postsIndex = useQuery({ queryKey: ['admin-search', 'posts'], queryFn: listAll, enabled: searchOpen, staleTime: 60_000 });

  const hits: Hit[] = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return PAGES.map((p) => ({ group: 'Go to', ...p }));
    const out: Hit[] = [];
    PAGES.filter((p) => has(t, p.label, p.sub)).slice(0, 3).forEach((p) => out.push({ group: 'Go to', ...p }));
    (accounts ?? []).filter((a) => has(t, a.email, a.name, a.phone)).slice(0, 5).forEach((a) =>
      out.push({ group: 'Accounts', label: a.name || a.email || 'Account', sub: `${a.email ?? ''} · ${a.plan}`, to: `/admin/accounts?q=${encodeURIComponent(a.email ?? a.name ?? '')}` }));
    (postsIndex.data ?? []).filter((p) => has(t, p.title, p.slug, p.tag)).slice(0, 5).forEach((p) =>
      out.push({ group: 'Articles', label: p.title || 'Untitled', sub: `/blog/${p.slug} · ${p.published ? 'live' : 'draft'}`, to: `/admin/blog/${p.id}` }));
    (leadsIndex.data ?? []).filter((l) => has(t, l.name, l.email, l.company, l.message)).slice(0, 5).forEach((l) =>
      out.push({ group: 'Leads', label: l.name || l.email, sub: `${l.email} · ${l.status}`, to: `/admin/leads?q=${encodeURIComponent(l.email)}` }));
    (tickets ?? []).filter((k) => has(t, k.subject, k.message)).slice(0, 5).forEach((k) =>
      out.push({ group: 'Support', label: k.subject, sub: `${k.status} · ${new Date(k.created_at).toLocaleDateString('en-GB')}`, to: `/admin/support?q=${encodeURIComponent(k.subject)}` }));
    return out;
  }, [term, accounts, postsIndex.data, leadsIndex.data, tickets]);

  useEffect(() => { setActive(0); }, [term]);

  // Cmd/Ctrl+K focuses the search from anywhere; a click outside closes the list.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onDown); };
  }, []);

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    setSearchOpen(false);
    setTerm('');
    searchRef.current?.blur();
    navigate(hit.to);
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(hits.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(hits[active]); }
    else if (e.key === 'Escape') { setSearchOpen(false); searchRef.current?.blur(); }
  };

  // ---- notifications ---------------------------------------------------------
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const newLeads = leadsSummary?.unread ?? 0;
  const openTickets = (tickets ?? []).filter((t) => t.status === 'open').length;
  const alerts = newLeads + openTickets;

  // ---- honest status ---------------------------------------------------------
  const failing = leadsQ.isError || blogQ.isError || accountsQ.isError || ticketsQ.isError;

  let lastGroup = '';

  return (
    <div className="admin-x">
      <div className={`shell${menuOpen ? ' menu-open' : ''}`}>
        <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden />
        <aside className="side" id="admin-drawer" aria-label="Admin navigation">
          <button type="button" className="side-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X width={18} height={18} />
          </button>
          <div className="brand">
            <b>Think</b> <i>Decor</i><small>ADMIN</small>
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
              {openTickets > 0 && <span className="n hot">{openTickets}</span>}
            </NavLink>
          </nav>

          <div className="side-foot">
            <div className="sitecard">
              <span className={`pulse${failing ? ' bad' : ''}`} />
              <div><b>thinkdecor.app</b>{failing ? "Some data couldn't load" : 'Connected · showing live data'}</div>
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
            <button
              type="button"
              className="menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="admin-drawer"
            >
              <Menu width={20} height={20} />
            </button>
            <div className="crumb">
              Admin <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              <b>{crumb}</b>
            </div>

            <div className="search-wrap" ref={searchWrapRef}>
              <label className="search">
                <Search width={15} height={15} />
                <input
                  ref={searchRef}
                  value={term}
                  onChange={(e) => { setTerm(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={onSearchKey}
                  placeholder="Search accounts, leads, articles…"
                  aria-label="Search accounts, leads, articles"
                  role="combobox"
                  aria-expanded={searchOpen}
                  aria-controls="admin-search-list"
                  autoComplete="off"
                />
                <kbd>⌘K</kbd>
              </label>
              {searchOpen && (
                <div className="sresults" id="admin-search-list" role="listbox">
                  {hits.length === 0 ? (
                    <div className="sempty">
                      {leadsIndex.isFetching || postsIndex.isFetching ? 'Searching…' : `Nothing found for “${term.trim()}”.`}
                    </div>
                  ) : (
                    hits.map((h, i) => {
                      const head = h.group !== lastGroup ? h.group : null;
                      lastGroup = h.group;
                      return (
                        <div key={`${h.group}-${h.to}-${i}`}>
                          {head && <div className="sgroup">{head}</div>}
                          <button
                            type="button"
                            role="option"
                            aria-selected={i === active}
                            className={`sitem${i === active ? ' on' : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => go(h)}
                          >
                            <span className="st"><b>{h.label}</b><small>{h.sub}</small></span>
                            {i === active && <CornerDownLeft width={14} height={14} />}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="bell-wrap" ref={bellRef}>
              <button
                type="button"
                className="ib"
                aria-label={alerts ? `Notifications, ${alerts} need attention` : 'Notifications'}
                aria-expanded={bellOpen}
                onClick={() => setBellOpen((o) => !o)}
              >
                <Bell width={17} height={17} />
                {alerts > 0 && <span className="dot" />}
              </button>
              {bellOpen && (
                <div className="bell-pop" role="menu">
                  <div className="sgroup">Needs attention</div>
                  {alerts === 0 ? (
                    <div className="sempty">You're all caught up.</div>
                  ) : (
                    <>
                      {newLeads > 0 && (
                        <Link to="/admin/leads" role="menuitem" className="sitem" onClick={() => setBellOpen(false)}>
                          <span className="st"><b>{newLeads} new {newLeads === 1 ? 'lead' : 'leads'}</b><small>Waiting for a first reply</small></span>
                        </Link>
                      )}
                      {openTickets > 0 && (
                        <Link to="/admin/support" role="menuitem" className="sitem" onClick={() => setBellOpen(false)}>
                          <span className="st"><b>{openTickets} open support {openTickets === 1 ? 'query' : 'queries'}</b><small>Customers are waiting</small></span>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <a className="btn btn-line view-site" href="/" target="_blank" rel="noreferrer">
              <span>View site</span> <ExternalLink width={14} height={14} />
            </a>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
