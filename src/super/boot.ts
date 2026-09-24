// @ts-nocheck
/* Boots the super admin panel inside a container: layout, routing, live refresh, idle lock, drawers. */
import { supabase } from '@/integrations/supabase/client';
import {
  $, $$, esc, ic, int, pct, fDT, ago, initials, setRoot, CH, D, S, hooks, isSA, pull, toast, fail, openModal, closeModal, userById, ApiError,
} from './core';
import { P, AFTER, tab } from './pages1';
import './pages2';
import './pages3';
import { auditTable, auditRows } from './pages3';
import { userTable } from './pages2';
import { A } from './actions';

const ROUTES = [
  { grp: 'Overview' },
  { id: 'dashboard', n: 'Business dashboard', ic: 'dash' },
  { id: 'costs', n: 'Cost & margin', ic: 'coin', cnt: () => (D.settings.ai.kill_switch ? 'OFF' : null), hot: true },
  { grp: 'Operations' },
  { id: 'billing', n: 'Billing', ic: 'card', cnt: () => D.stripe.events.filter((e: any) => !e.ok).length || null, hot: true },
  { id: 'users', n: 'Users', ic: 'users', cnt: () => D.users.filter((u: any) => u.flags.length && !u.suspended).length || null },
  { id: 'ai', n: 'AI & generations', ic: 'spark', cnt: () => D.moderation.length || null },
  { grp: 'Configuration' },
  { id: 'flags', n: 'Flags & settings', ic: 'toggle', cnt: () => { const o = Object.entries(D.settings.flags).filter(([k, v]) => k !== 'maintenance' && !v).length; return o ? o + ' off' : null; }, hot: true },
  { id: 'access', n: 'Access & roles', ic: 'key' },
  { grp: 'Growth' },
  { id: 'growth', n: 'Growth & marketing', ic: 'growth' },
  { grp: 'Safety' },
  { id: 'system', n: 'System & data', ic: 'server' },
  { id: 'audit', n: 'Audit log', ic: 'log', cnt: () => D.audit.length || null },
];

const SHELL = (me: any) => `
<div class="app">
  <div class="sidebackdrop" id="sidebackdrop"></div>
  <aside class="side" id="side" aria-label="Super admin navigation">
    <div class="brand"><a class="brand__logo" href="#dashboard">Think<i>Decor</i></a><span class="brand__tag">Super admin</span><button class="iconbtn navclose" id="navclose" aria-label="Close menu"><span data-ic="x"></span></button></div>
    <nav class="nav" id="nav"></nav>
    <div class="me">
      <div class="me__row"><span class="av">${esc(initials(me.name))}</span><div style="min-width:0"><b>${esc(me.name.split('@')[0])}</b><small id="me-role"></small></div></div>
      <div class="me__sec"><span id="mfa-state"><i class="dot"></i>${me.mfa ? '2FA on' : 'No 2FA'}</span><span id="idle">Session</span></div>
      <div class="rolesw" role="group" aria-label="Preview the panel as"><button id="rs-sa" aria-pressed="true">Super admin</button><button id="rs-ad" aria-pressed="false">Admin view</button></div>
      <a class="btn btn-l btn-s" href="/" style="justify-content:center">Back to site</a>
    </div>
  </aside>
  <div class="main">
    <header class="top">
      <button class="iconbtn menubtn" id="menubtn" aria-label="Open menu"><span data-ic="menu"></span></button>
      <span class="crumb" id="crumb">Overview</span>
      <label class="search"><span data-ic="search"></span><input id="gsearch" placeholder="Search users, emails, phone or user ID" autocomplete="off"><span class="kbd">/</span></label>
      <span class="envtag" id="live" title="Refreshes automatically every few seconds">Live</span>
      <button class="iconbtn" id="bell" aria-label="Alerts"><span data-ic="bell"></span><span class="pip" id="bellpip"></span></button>
    </header>
    <div id="imp"></div>
    <main class="page" id="page"></main>
  </div>
</div>
<div class="scrim" id="modal" hidden></div>
<div id="drawer"></div>
<div class="toasts" id="toasts" aria-live="polite"></div>`;

function route() {
  const h = (location.hash || '#dashboard').slice(1);
  if (h.startsWith('user-')) return { id: 'users', user: h.slice(5) };
  return { id: ROUTES.find((r: any) => r.id === h) ? h : 'dashboard' };
}
function renderNav() {
  const cur = route().id;
  $('#nav').innerHTML = ROUTES.map((r: any) => r.grp ? `<div class="nav__grp">${r.grp}</div>` : `<a href="#${r.id}" class="${r.id === cur ? 'on' : ''}">${ic(r.ic)}<span>${r.n}</span>${(() => { const c = r.cnt && r.cnt(); return c != null ? `<span class="cnt ${r.hot ? 'hot' : ''}">${c}</span>` : ''; })()}</a>`).join('');
}
function alerts() {
  const out: any[] = [];
  const failed = D.stripe.events.filter((e: any) => !e.ok).length;
  if (D.settings.ai.kill_switch) out.push(['crit', 'AI kill switch is on: generation is stopped', 'costs:alerts']);
  Object.entries(D.settings.flags).forEach(([k, v]) => { if (k !== 'maintenance' && !v) out.push(['crit', 'Switch off: ' + k, 'flags:switches']); });
  if (failed) out.push(['crit', failed + ' Stripe webhook deliveries failed', 'billing:hooks']);
  const cap = D.settings.ai.daily_cap_gbp;
  if (cap && D.costs.today / cap >= 0.8) out.push([D.costs.today >= cap ? 'crit' : 'warn', 'AI spend at ' + pct(D.costs.today / cap, 0) + ' of the daily cap', 'costs:alerts']);
  const dup = {};
  D.users.forEach((u: any) => { if (u.phone) dup[u.phone] = (dup[u.phone] || 0) + 1; });
  const big = Object.entries(dup).filter(([, n]: any) => n > 2).sort((a: any, b: any) => b[1] - a[1])[0];
  if (big) out.push(['crit', big[1] + ' accounts share one phone number', 'users:abuse']);
  if (D.moderation.length) out.push(['warn', D.moderation.length + ' safety refusals to review', 'ai:mod']);
  const noTfa = D.admins.filter((a: any) => !a.tfa).length;
  if (noTfa) out.push(['warn', noTfa + ' admin' + (noTfa === 1 ? '' : 's') + ' without 2FA', 'access:']);
  if (D.system.openTickets) out.push(['warn', D.system.openTickets + ' open support ticket' + (D.system.openTickets === 1 ? '' : 's'), 'system:health']);
  if (!D.system.site.ok) out.push(['crit', 'The public site did not answer its check', 'system:health']);
  return out;
}
function showAlerts() {
  const al = alerts();
  $('#drawer').innerHTML = `<aside class="drawer" aria-label="Alerts"><div class="row sb"><span class="kicker">Alerts</span><button class="iconbtn" data-close aria-label="Close">${ic('x')}</button></div><h3 style="font-size:26px">Needs attention</h3>
  ${al.map((a) => `<a class="li" href="#" data-tabgo="${a[2]}" style="text-decoration:none"><span class="li__ic ${a[0]}">${ic('alert')}</span><div class="li__b"><b>${esc(a[1])}</b></div>${ic('chev', '')}</a>`).join('') || `<div class="li"><span class="li__ic good">${ic('check')}</span><div class="li__b"><b>All clear</b><small>Nothing needs attention right now</small></div></div>`}</aside>`;
}
function showDrawer(a: any) {
  $('#drawer').innerHTML = `<aside class="drawer" aria-label="Audit entry"><div class="row sb"><span class="kicker">audit_log · ${esc(String(a.id).slice(0, 8))}</span><button class="iconbtn" data-close aria-label="Close">${ic('x')}</button></div><h3 style="font-size:26px">${esc(a.action)}</h3>
  ${[['When', fDT(a.at)], ['Admin', a.admin + ' (' + a.role + ')'], ['Record', a.target], ['Before', a.before], ['After', a.after], ['Reason', a.reason || '—'], ['IP', a.ip]].map((r) => `<div class="row sb" style="padding:8px 0;border-bottom:1px solid var(--stone-2)"><span class="muted">${r[0]}</span><b style="font-weight:600;text-align:right;word-break:break-word">${esc(r[1])}</b></div>`).join('')}
  <span class="flabel">Row as stored</span><pre style="margin:0;padding:12px;border-radius:12px;background:var(--paper-2);box-shadow:inset 0 0 0 1px var(--stone);font-size:12px;overflow:auto;white-space:pre-wrap">${esc(JSON.stringify({ id: a.id, created_at: a.at.toISOString(), actor: a.admin, actor_role: a.role, action: a.action, target: a.target, before: a.before, after: a.after, reason: a.reason || null, ip: a.ip }, null, 2))}</pre></aside>`;
}

function render() {
  const r = route(); CH.length = 0;
  const root = $('.sa-root') || document.querySelector('.sa-root');
  if (root) root.dataset.role = isSA() ? 'super_admin' : 'admin';
  const pg = $('#page');
  const scroll = window.scrollY;
  pg.innerHTML = r.user ? P.user(r.user) : P[r.id]();
  $('#crumb').textContent = (ROUTES.find((x: any) => x.id === r.id) || {}).n || '';
  $('#imp').innerHTML = S.impersonating ? `<div class="imp-banner">${ic('eye')}<span>Viewing as ${esc(S.impersonating.name)} · read-only · logged</span><button class="btn btn-l btn-s" data-act="endImp">End session</button></div>` : '';
  $('#me-role').textContent = (D.me.role === 'super_admin' ? (isSA() ? 'super_admin' : 'admin (preview)') : 'admin') + ' · ' + D.me.email;
  $('#rs-sa').setAttribute('aria-pressed', S.roleView === 'super_admin');
  $('#rs-ad').setAttribute('aria-pressed', S.roleView === 'admin');
  $('#rs-sa').disabled = D.me.role !== 'super_admin';
  $('#mfa-state').innerHTML = `<i class="dot" style="${D.me.mfa ? '' : 'background:#E0B055;box-shadow:0 0 0 3px rgba(224,176,85,.25)'}"></i>${D.me.mfa ? '2FA on' : 'No 2FA'}`;
  $('#bellpip').style.display = alerts().some((a) => a[0] === 'crit') ? '' : 'none';
  renderNav();
  if (!r.user && AFTER[r.id]) AFTER[r.id]();
  document.querySelector('.sa-root')?.classList.remove('navopen');
  if (!S.firstRender) S.firstRender = true; else window.scrollTo(0, scroll);
}
hooks.render = render;

let refreshing = false;
hooks.refresh = async (quiet = false) => {
  if (refreshing) return;
  refreshing = true;
  try {
    const changed = await pull();
    S.lastPull = Date.now();
    if (changed || !quiet) render();
    else { renderNav(); }
  } catch (e) {
    if (!quiet) fail(e);
    if (e instanceof ApiError && ['mfa_required', 'not_admin', 'unauthenticated', 'ip_blocked'].includes(e.code)) window.dispatchEvent(new CustomEvent('sa-denied', { detail: e.code }));
  } finally { refreshing = false; }
};

/* ---- idle lock ---- */
function tick() {
  if (S.locked) return;
  S.idleLeft = Math.max(0, S.idleLeft - 1);
  const m = Math.floor(S.idleLeft / 60), s = S.idleLeft % 60;
  const el = $('#idle'); if (el) el.textContent = 'Session ' + m + ':' + String(s).padStart(2, '0');
  const live = $('#live'); if (live && S.lastPull) live.textContent = 'Live · ' + Math.max(0, Math.round((Date.now() - S.lastPull) / 1000)) + 's';
  if (S.idleLeft === 0) lock();
}
hooks.tick = tick;
function lock() {
  S.locked = true;
  openModal(`<div class="modal__ic" style="background:var(--tint);color:var(--char)">${ic('lock')}</div><h3>Session locked</h3><p>You were idle for ${D.settings.security.timeout_min} minutes. Enter your password to continue.</p><div class="field"><label for="pw">Password</label><input class="inp" id="pw" type="password" autocomplete="current-password"></div><div class="modal__act"><button class="btn btn-l" id="pw-out">Sign out</button><button class="btn btn-p" id="pw-go">Unlock</button></div>`);
  const go2 = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: D.me.email, password: $('#pw').value });
    if (error) return toast('That password was wrong', '', true);
    S.locked = false; S.idleLeft = D.settings.security.timeout_min * 60; closeModal(); toast('Welcome back');
  };
  $('#pw-go').onclick = go2;
  $('#pw').onkeydown = (e: any) => { if (e.key === 'Enter') go2(); };
  $('#pw-out').onclick = async () => { await supabase.auth.signOut(); location.href = '/admin'; };
}

/* ---- boot ---- */
export function mountSuper(host: HTMLElement) {
  host.innerHTML = `<div class="sa-root" data-role="super_admin">${SHELL(D.me)}</div>`;
  const root = host.querySelector('.sa-root') as HTMLElement;
  setRoot(root);
  S.roleView = D.me.role === 'super_admin' ? 'super_admin' : 'admin';
  S.idleLeft = D.settings.security.timeout_min * 60;
  S.firstRender = false;
  $$('[data-ic]', root).forEach((e: any) => { e.outerHTML = ic(e.dataset.ic); });

  const onClick = (e: any) => {
    const act = e.target.closest('[data-act]');
    if (act && !act.matches('select')) { e.preventDefault(); if (act.hasAttribute('disabled')) return; const f = A[act.dataset.act]; f && f(act, e); return; }
    const tg = e.target.closest('[data-tabgo]');
    if (tg) { e.preventDefault(); $('#drawer').innerHTML = ''; const [p, t] = tg.dataset.tabgo.split(':'); if (t) S.tab[p] = t; location.hash = p; if (location.hash === '#' + p) render(); return; }
    const gg = e.target.closest('[data-go]');
    if (gg && !e.target.closest('a')) { const h = gg.dataset.go; if (location.hash === '#' + h) render(); else location.hash = h; return; }
    const t = e.target.closest('[data-tab]');
    if (t) { const [p, v] = t.dataset.tab.split(':'); S.tab[p] = v; render(); return; }
    const s = e.target.closest('[data-seg]');
    if (s) { const [k, v] = s.dataset.seg.split(':'); if (k === 'range') S.range = +v; else S.f[k] = v; render(); return; }
    const c = e.target.closest('[data-chip]');
    if (c) { const [k, v] = c.dataset.chip.split(':'); S.f[k] = v; if (k === 'uf') { $$('[data-chip^="uf:"]').forEach((b: any) => b.setAttribute('aria-pressed', b === c)); $('#utbl').innerHTML = userTable(); } else if (k === 'as') { $$('[data-chip^="as:"]').forEach((b: any) => b.setAttribute('aria-pressed', b === c)); $('#atbl').innerHTML = auditTable(); } else render(); return; }
    const au = e.target.closest('[data-audit]');
    if (au) { const a = D.audit.find((x: any) => x.id === au.dataset.audit); a && showDrawer(a); return; }
    if (e.target.closest('#bell')) { showAlerts(); return; }
    if (e.target.closest('#menubtn')) { root.classList.toggle('navopen'); return; }
    if (e.target.closest('#navclose') || e.target.closest('#sidebackdrop')) { root.classList.remove('navopen'); return; }
    if (e.target.closest('[data-close]')) { $('#drawer').innerHTML = ''; return; }
    if (e.target === $('#modal') && !S.locked) closeModal();
  };
  root.addEventListener('click', onClick);

  $('#rs-sa').onclick = () => { if (D.me.role !== 'super_admin') return; S.roleView = 'super_admin'; render(); toast('Back to super admin'); };
  $('#rs-ad').onclick = () => { S.roleView = 'admin'; render(); toast('Previewing as admin', 'Risky actions show a lock.'); };
  $('#gsearch').addEventListener('keydown', (e: any) => {
    if (e.key !== 'Enter') return; const v = e.target.value.trim(); if (!v) return;
    S.f.uq = v; S.tab.users = 'all'; location.hash = 'users'; if (location.hash === '#users') render();
  });
  const onKey = (e: any) => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { e.preventDefault(); $('#gsearch').focus(); }
    if (e.key === 'Escape') { if (!S.locked) closeModal(); $('#drawer').innerHTML = ''; root.classList.remove('navopen'); }
  };
  document.addEventListener('keydown', onKey);
  const onHash = () => { render(); window.scrollTo(0, 0); };
  window.addEventListener('hashchange', onHash);
  let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(() => CH.forEach((f: any) => f()), 120); };
  window.addEventListener('resize', onResize);
  const idleReset = () => { if (!S.locked) S.idleLeft = D.settings.security.timeout_min * 60; };
  ['click', 'keydown', 'mousemove', 'scroll'].forEach((ev) => document.addEventListener(ev, idleReset, { passive: true }));

  render();
  S.lastPull = Date.now();
  // Charts measure their container's pixel width the moment they draw. On first mount that can
  // happen just before this route's own stylesheet or web fonts have finished settling layout,
  // so they briefly draw oversized against an unstyled/wider container and never self-correct
  // (nothing else re-measures them). Re-run the same redraw the resize handler uses, a few times
  // shortly after mount, once layout has actually caught up.
  requestAnimationFrame(() => requestAnimationFrame(() => CH.forEach((f: any) => f())));
  document.fonts?.ready?.then(() => CH.forEach((f: any) => f()));
  [400, 1200, 2500].forEach((ms) => setTimeout(() => CH.forEach((f: any) => f()), ms));

  const timer = setInterval(tick, 1000);
  // live data: refresh every 12s while the tab is visible and nobody is typing or has a dialog open
  const poll = setInterval(() => {
    if (document.hidden || S.locked) return;
    if (!$('#modal').hidden) return;
    const ae = document.activeElement as HTMLElement | null;
    if (ae && root.contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
    hooks.refresh(true);
  }, 12000);
  // realtime: refresh right away when a design or a support ticket changes
  let debounce;
  const ch = supabase.channel('sa-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'generations' }, () => { clearTimeout(debounce); debounce = setTimeout(() => hooks.refresh(true), 1500); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => { clearTimeout(debounce); debounce = setTimeout(() => hooks.refresh(true), 1500); })
    .subscribe();

  return () => {
    clearInterval(timer); clearInterval(poll); supabase.removeChannel(ch);
    root.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('hashchange', onHash);
    window.removeEventListener('resize', onResize);
    ['click', 'keydown', 'mousemove', 'scroll'].forEach((ev) => document.removeEventListener(ev, idleReset));
    host.innerHTML = '';
  };
}
