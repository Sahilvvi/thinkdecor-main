// @ts-nocheck
/* Super admin pages, part 2: Users, AI & generations, Flags & settings, Access & roles. Real data from D. */
import {
  $, $$, esc, gbp, gbp0, int, pct, sum, fDate, fDateY, fDT, fTime, ago, ic, kpi, legend, hbars, statusPill, whoCell, saBtn,
  barChart, lineChart, D, S, isSA, userById, api, hooks, fail, initials,
} from './core';
import { P, AFTER, tab, tabs, head, seg, chips, emptyCard, totalCost, genDay, lastDays } from './pages1';

const chipRole = (r: string) => `<span class="role ${r === 'super_admin' ? 'sa' : 'ad'}">${r}</span>`;

/* ---------------- 4. USERS ---------------- */
S.f.uq = ''; S.f.uf = 'all';
function userRows() {
  const q = S.f.uq.toLowerCase();
  return D.users.filter((u: any) => (!q || (u.name + u.email + u.phone + u.id).toLowerCase().includes(q)) &&
    (S.f.uf === 'all' || (S.f.uf === 'paid' && u.plan !== 'Free') || (S.f.uf === 'free' && u.plan === 'Free') || (S.f.uf === 'flagged' && u.flags.length) || (S.f.uf === 'suspended' && u.suspended)));
}
function userTable() {
  const rows = userRows();
  return `<table><thead><tr><th>User</th><th>Plan</th><th>Status</th><th class="n">Credits</th><th class="n">Designs</th><th>Country</th><th>Signed up</th><th>Last active</th><th>Flags</th></tr></thead><tbody>${rows.slice(0, 60).map((u: any) => `<tr class="click" data-go="user-${u.id}"><td>${whoCell(u)}${u.isAdmin ? ' <span class="pill mute nodot">admin</span>' : ''}</td><td>${esc(u.plan)}</td><td>${statusPill(u.suspended ? 'suspended' : u.status)}</td><td class="n">${u.credits}</td><td class="n">${u.designs}</td><td>${u.country}</td><td class="tabnum">${fDate(u.signup)}</td><td class="tabnum">${ago(u.last)}</td><td>${u.flags.map((f: string) => `<span class="pill ${f.startsWith('dup') ? 'crit' : 'warn'}">${f}</span>`).join(' ')}</td></tr>`).join('') || '<tr><td colspan="9"><div class="empty">No users match. Try an email, phone number or user ID.</div></td></tr>'}</tbody></table>${rows.length > 60 ? `<p class="sub" style="padding:10px">Showing 60 of ${rows.length}. Narrow the search to see more.</p>` : ''}`;
}
P.users = () => {
  const t = tab('users', 'all'); const flagged = D.users.filter((u: any) => u.flags.length).length;
  return head('Operations · Accounts', 'User <em>management</em>', 'Open any account for plan, credits, designs, tickets and sign-ins. Suspend, view read-only, export or delete for GDPR.', `${saBtn('Export users CSV', 'exportUsers', '', 'btn-l', 'down')}`) +
  tabs('users', [['all', 'All users', D.users.length], ['abuse', 'Abuse & duplicates', flagged]]) +
  (t === 'all' ? `<div class="card"><div class="toolbar"><label class="minisearch">${ic('search')}<input id="uq" value="${esc(S.f.uq)}" placeholder="Name, email, phone or user ID"></label>${chips('uf', [['all', 'All'], ['paid', 'Paid'], ['free', 'Free'], ['flagged', 'Flagged', flagged], ['suspended', 'Suspended', D.users.filter((u: any) => u.suspended).length]], S.f.uf)}</div><div class="tbl-wrap" id="utbl">${userTable()}</div></div>` : P.abuse());
};
AFTER.users = () => { const q = $('#uq'); if (q) q.oninput = () => { S.f.uq = q.value; $('#utbl').innerHTML = userTable(); }; };
export { userTable };

P.abuse = () => {
  const byPhone: Record<string, any[]> = {};
  D.users.forEach((u: any) => { if (u.phone) (byPhone[u.phone] = byPhone[u.phone] || []).push(u); });
  const pc = Object.entries(byPhone).filter(([, v]) => v.length > 1);
  const byIp: Record<string, any[]> = {};
  D.users.forEach((u: any) => { if (u.ip) (byIp[u.ip] = byIp[u.ip] || []).push(u); });
  const ic2 = Object.entries(byIp).filter(([, v]) => v.length > 1);
  const disposable = D.users.filter((u: any) => u.flags.includes('disposable-email'));
  const demo = D.settings.demo;
  return (pc[0] ? `<div class="callout crit">${ic('alert')}<span><b>${pc[0][1].length} accounts share ${esc(pc[0][0])}.</b> Review them below; suspend the group in one step if it is abuse.</span></div>` : `<div class="callout">${ic('check')}<span>No phone number is shared by more than one account.</span></div>`) +
  `<section class="grid g-73">
   ${pc.map(([ph, us]: any) => `<div class="card"><div class="card__h"><div><h3>Same phone · <span class="mono">${esc(ph)}</span></h3><p>${us.length} accounts · ${us.filter((u: any) => u.suspended).length} suspended</p></div>${saBtn('Suspend all ' + us.length, 'suspendCluster', 'data-phone="' + esc(ph) + '"', 'btn-x btn-s', 'pause')}</div>
    <div class="tbl-wrap"><table><thead><tr><th>Account</th><th>Last IP</th><th>Signed up</th><th class="n">Designs</th><th>Status</th></tr></thead><tbody>${us.map((u: any) => `<tr class="click" data-go="user-${u.id}"><td>${whoCell(u)}</td><td class="mono">${esc(u.ip || '—')}</td><td class="tabnum">${fDT(u.signup)}</td><td class="n">${u.designs}</td><td>${statusPill(u.suspended ? 'suspended' : u.status)}</td></tr>`).join('')}</tbody></table></div></div>`).join('') || `<div class="card"><div class="empty">Nothing to review.</div></div>`}
   <div class="stack">
    <div class="card"><div class="card__h"><div><h3>Free demo limits</h3><p>Enforced in <span class="mono">demo-redesign</span> before calling Gemini</p></div></div>
     <div class="fgrid"><div class="field"><label for="d-ip">Demos per IP / day</label><input class="inp" id="d-ip" type="number" min="1" value="${demo.per_ip}"></div><div class="field"><label for="d-dev">Demos per device</label><input class="inp" id="d-dev" type="number" value="1" disabled><small>Fixed at one per device</small></div></div>
     ${saBtn('Save limits', 'saveDemo', '', 'btn-p', 'check')}
     <div class="hr"></div><span class="sub">Demo runs in the last 30 days: <b>${int(D.system.demoUses30)}</b></span></div>
    <div class="card"><div class="card__h"><div><h3>Shared sign-in addresses</h3><p>Same last IP on 2+ accounts</p></div></div>${ic2.map(([ip, us]: any) => `<div class="li"><span class="li__ic warn">${ic('phone')}</span><div class="li__b"><b class="mono">${esc(ip)}</b><small>${us.length} accounts · ${us.map((u: any) => esc(u.name)).slice(0, 3).join(', ')}${us.length > 3 ? '…' : ''}</small></div><span class="pill crit nodot">${us.length}</span></div>`).join('') || '<div class="empty">None.</div>'}
     ${disposable.length ? `<div class="hr"></div><span class="flabel">Disposable email domains</span>${disposable.map((u: any) => `<div class="li"><div class="li__b"><b>${esc(u.email)}</b></div></div>`).join('')}` : ''}</div>
   </div></section>`;
};

/* user detail (loads on demand) */
P.user = (id: string) => {
  const u = userById(id);
  if (!u) return `<div class="card"><div class="empty">That account no longer exists. It may have been deleted for GDPR. <a href="#users">Back to users</a></div></div>`;
  const det = S.detail[id];
  if (!det) { api('userDetail', { userId: id }).then((d) => { S.detail[id] = d; hooks.render(); }).catch(fail); }
  const subInfo = D.subs.find((s: any) => s.userId === u.id);
  return `<button class="back" data-go="users">${ic('back')}All users</button>
  <div class="card"><div class="uhead"><span class="av">${esc(initials(u.name))}</span><div style="min-width:0"><h2>${esc(u.name)}</h2><div class="row" style="gap:6px;margin-top:6px"><span class="muted">${esc(u.email)}</span>${statusPill(u.suspended ? 'suspended' : u.status)}<span class="pill nodot">${esc(u.plan)}</span>${u.isAdmin ? '<span class="pill info nodot">admin</span>' : ''}${u.flags.map((f: string) => `<span class="pill crit">${f}</span>`).join('')}</div></div>
   <div class="row" style="gap:6px">
    <button class="btn btn-l btn-s" data-act="impersonate" data-id="${u.id}">${ic('eye')}View as user</button>
    ${saBtn('Export data', 'exportUser', 'data-id="' + u.id + '"', 'btn-l btn-s', 'down')}
    ${saBtn('Reset credits', 'resetCredits', 'data-id="' + u.id + '"', 'btn-l btn-s', 'refresh')}
    ${u.suspended ? saBtn('Unsuspend', 'unsuspend', 'data-id="' + u.id + '"', 'btn-d btn-s', 'play') : saBtn('Suspend', 'suspend', 'data-id="' + u.id + '"', 'btn-xl btn-s', 'pause')}
    ${saBtn('Delete account', 'deleteUser', 'data-id="' + u.id + '"', 'btn-x btn-s', 'trash')}
   </div></div>
   <div class="facts"><div><small>Plan</small><b>${esc(u.plan)}${subInfo ? ' · ' + gbp(subInfo.amount) : ''}</b></div><div><small>Credits left</small><b>${u.credits}</b></div><div><small>Designs</small><b>${u.designs}</b></div><div><small>Lifetime spend</small><b>${gbp(u.spend)}</b></div></div></div>
  <section class="grid g-73">
   <div class="stack">
    <div class="card"><div class="card__h"><div><h3>Designs</h3><p>Latest outputs from Mantha</p></div><span class="sub">${u.designs} total</span></div>
     ${det ? (det.designs.length ? `<div class="gal">${det.designs.slice(0, 8).map((g: any) => `<div class="gi"><figure>${g.url ? `<img src="${esc(g.url)}" alt="Design output" loading="lazy">` : ''}<span class="ba">${esc(g.feature)}</span>${g.flag ? `<span class="pill crit">${esc(g.flag)}</span>` : ''}</figure><div class="gi__b"><small>${fDT(g.at)}</small></div></div>`).join('')}</div>` : '<div class="empty">No designs yet.</div>') : '<div class="empty">Loading…</div>'}</div>
    <div class="card"><div class="card__h"><div><h3>Credit history</h3><p>From <span class="mono">credit_ledger</span></p></div>${saBtn('Grant credits', 'grantFor', 'data-id="' + u.id + '"', 'btn-l btn-s', 'plus')}</div>
     <div class="tbl-wrap"><table><thead><tr><th>When</th><th class="n">Change</th><th>What</th></tr></thead><tbody>${det ? (det.ledger.map((l: any) => `<tr><td class="tabnum">${fDT(l.created_at)}</td><td class="n"><b style="color:${l.delta > 0 ? 'var(--good)' : 'var(--ink)'}">${l.delta > 0 ? '+' : '−'}${Math.abs(l.delta)}</b></td><td>${esc((l.reason || '').replace(/_/g, ' '))}</td></tr>`).join('') || '<tr><td colspan="3"><div class="empty">No credit history.</div></td></tr>') : '<tr><td colspan="3"><div class="empty">Loading…</div></td></tr>'}</tbody></table></div></div>
   </div>
   <div class="stack">
    <div class="card"><div class="card__h"><h3>Profile</h3></div>
     ${[['User ID', u.id], ['Phone', u.phone || '—'], ['Country', u.country], ['Signed up', fDateY(u.signup)], ['Last sign-in', u.lastSignIn ? fDT(u.lastSignIn) : '—'], ['Last IP', u.ip || '—'], ['Stripe customer', u.cus || 'none']].map((r) => `<div class="row sb"><span class="muted">${r[0]}</span><span class="mono" style="word-break:break-all;text-align:right">${esc(r[1])}</span></div>`).join('')}
     <div class="row">${u.cus ? `<a class="btn btn-l btn-s" href="https://dashboard.stripe.com/customers/${u.cus}" target="_blank" rel="noopener">${ic('ext')}Open in Stripe</a>` : ''}<button class="btn btn-l btn-s" data-act="sync" data-id="${u.id}">${ic('refresh')}Sync from Stripe</button></div></div>
    <div class="card"><div class="card__h"><h3>Tickets</h3><span class="pill ${u.openTickets ? 'warn' : 'mute'} nodot">${u.openTickets} open</span></div>
     ${det ? (det.tickets.map((t: any) => `<div class="li"><span class="li__ic">${ic('mail')}</span><div class="li__b"><b>${esc(t.subject)}</b><small>${ago(t.created_at)} · ${esc(t.status)}</small></div></div>`).join('') || '<div class="empty">No tickets.</div>') : '<div class="empty">Loading…</div>'}</div>
    <div class="card"><div class="card__h"><h3>Sign-in history</h3></div>
     <div class="tbl-wrap"><table><tbody>${det ? (det.signins.map((s: any) => `<tr><td class="tabnum">${fDT(s.at)}</td><td class="mono">${esc(s.ip || '—')}</td><td>${esc(s.action)}</td></tr>`).join('') || '<tr><td><div class="empty">No sign-in records.</div></td></tr>') : '<tr><td><div class="empty">Loading…</div></td></tr>'}</tbody></table></div></div>
   </div></section>`;
};

/* ---------------- 5. AI & GENERATION OPS ---------------- */
S.f.gs = 'all'; S.f.qf = 'recent';
P.ai = () => {
  const t = tab('ai', 'monitor');
  const h24 = D.gens.filter((g: any) => Date.now() - g.at.getTime() < 864e5);
  const ok = h24.filter((g: any) => g.status === 'succeeded').length, bad = h24.length - ok;
  const lat = h24.filter((g: any) => g.status === 'succeeded' && g.latency).map((g: any) => g.latency).sort((a: number, b: number) => a - b);
  const p95 = lat.length ? lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.95))] : null;
  const fb = h24.length ? h24.filter((g: any) => g.fallback).length / h24.length : 0;
  const tg = genDay(new Date().toISOString().slice(0, 10));
  const gensToday = tg ? tg.redesign + tg.cleanup + tg.replace + tg.demo : 0;
  const flagged = D.outputs.filter((o: any) => o.flag).length;
  const on = D.settings.flags.generation && !D.settings.ai.kill_switch;
  return head('Operations · Mantha AI', 'AI & <em>generations</em>', 'Every generation attempt with model, time, tokens and cost. Review outputs, handle safety refusals, and change the live model without a deploy.',
    `<span class="pill ${on ? 'good' : 'crit'}">${on ? 'Generation on' : 'Generation off'}</span><span class="pill nodot mono">${esc(D.settings.ai.model)}</span>`) +
  tabs('ai', [['monitor', 'Monitor'], ['quality', 'Quality review', flagged || null], ['model', 'Model settings'], ['mod', 'Moderation', D.moderation.length || null]]) +
  (t === 'monitor' ? `<section class="grid g5">${kpi('Generations · today', int(gensToday), '', '', { note: 'succeeded, all features' })}${kpi('Success rate', h24.length ? pct(ok / h24.length) : '—', '', '', { note: 'last 24h attempts' })}${kpi('p95 latency', p95 != null ? p95 + 's' : '—', '', 'flat', { note: 'upload to result', c: 'var(--s2)' })}${kpi('Failed · 24h', bad, '', bad ? 'down' : '', { note: 'credits auto-refunded' })}${kpi('Fallback used', h24.length ? pct(fb, 0) : '—', '', '', { note: 'of attempts, 24h' })}</section>
   <section class="grid g2"><div class="card"><div class="card__h"><div><h3>Latency by hour</h3><p>Seconds from request to result · last 24h</p></div>${legend([['p50', 'var(--s1)'], ['p95', 'var(--s2)']], true)}</div>${D.hours.length > 1 ? '<div class="chart" id="ch-lat"></div>' : '<div class="empty">Needs at least two active hours of data.</div>'}</div>
    <div class="card"><div class="card__h"><div><h3>Runs by hour</h3><p>Succeeded vs failed · last 24h</p></div>${legend([['Succeeded', 'var(--s1)'], ['Failed', 'var(--crit)']])}</div>${D.hours.length ? '<div class="chart" id="ch-runs"></div>' : '<div class="empty">No attempts in the last 24 hours.</div>'}</div></section>
   <div class="card"><div class="toolbar"><h3 style="font-size:22px">Generation attempts</h3>${chips('gs', [['all', 'All', D.gens.length], ['failed', 'Failed', D.gens.filter((g: any) => g.status === 'failed').length], ['demo', 'Demo only']], S.f.gs)}</div>
    <div class="tbl-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Feature</th><th>Model</th><th>Status</th><th class="n">Latency</th><th class="n">Tokens in/out</th><th class="n">Cost</th><th>Error</th></tr></thead><tbody>
    ${D.gens.filter((g: any) => S.f.gs === 'all' || (S.f.gs === 'demo' ? g.feature === 'demo' : g.status === S.f.gs)).slice(0, 40).map((g: any) => { const u = g.userId ? userById(g.userId) : null; return `<tr><td class="tabnum">${fDT(g.at)}</td><td>${u ? `<a href="#user-${u.id}">${esc(u.name)}</a>` : '<span class="muted">visitor (demo)</span>'}</td><td>${esc(g.feature)}</td><td class="mono" style="font-size:11.5px">${esc(String(g.model).replace('gemini-', ''))}${g.fallback ? ' <span class="pill warn nodot">fallback</span>' : ''}</td><td>${statusPill(g.status)}</td><td class="n">${g.latency != null ? g.latency + 's' : '—'}</td><td class="n mono">${g.inTok ?? '—'} / ${g.outTok ?? '—'}</td><td class="n">${g.cost ? gbp(g.cost, 3) : '—'}</td><td>${g.err ? `<span class="err" title="${esc(g.err)}">${esc(g.err)}</span>` : '<span class="muted">—</span>'}</td></tr>`; }).join('') || '<tr><td colspan="9"><div class="empty">No attempts recorded yet. They appear as people use Mantha.</div></td></tr>'}
    </tbody></table></div></div>` : '') +
  (t === 'quality' ? `<div class="card"><div class="toolbar"><div><h3 style="font-size:22px">Recent outputs</h3><p class="sub">Spot-check quality. Flag anything that looks wrong; “Refund” gives the customer one credit back as goodwill.</p></div>${chips('qf', [['recent', 'Recent'], ['flagged', 'Flagged', flagged]], S.f.qf)}</div>
    <div class="gal">${D.outputs.filter((o: any) => S.f.qf === 'recent' || o.flag).map((o: any) => { const u = userById(o.userId); return `<div class="gi"><figure>${o.url ? `<img src="${esc(o.url)}" alt="${esc(o.feature)} output" loading="lazy">` : ''}${o.flag ? `<span class="pill crit">${esc(o.flag)}</span>` : ''}<span class="ba">${esc(o.feature)}</span></figure><div class="gi__b"><small>${esc(u?.name ?? 'user')} · ${ago(o.at)}</small><div class="gi__act"><button class="btn btn-l btn-s" data-act="flagGen" data-id="${o.id}">${ic('flag')}${o.flag ? 'Clear' : 'Flag'}</button>${saBtn('Refund 1', 'refundGen', 'data-id="' + o.id + '"')}</div></div></div>`; }).join('') || '<div class="empty">Nothing here.</div>'}</div></div>` : '') +
  (t === 'model' ? P.model() : '') +
  (t === 'mod' ? `<div class="card"><div class="card__h"><div><h3>Safety refusals</h3><p>Uploads the model refused in the last 30 days. Blocked images are not kept, so only the reason is shown.</p></div><span class="pill info nodot">${D.moderation.length} in 30 days</span></div>
    <div class="tbl-wrap"><table><thead><tr><th>When</th><th>User</th><th>Feature</th><th>Reason</th><th></th></tr></thead><tbody>${D.moderation.map((m: any) => { const u = m.userId ? userById(m.userId) : null; return `<tr><td class="tabnum">${fDT(m.at)}</td><td>${u ? `<a href="#user-${u.id}">${esc(u.name)}</a>` : 'visitor'}</td><td>${esc(m.feature)}</td><td><span class="err" title="${esc(m.reason)}">${esc(m.reason)}</span></td><td><div class="row" style="gap:6px;flex-wrap:nowrap">${u ? saBtn('Suspend user', 'suspend', 'data-id="' + u.id + '"', 'btn-xl btn-s', 'pause') : ''}<button class="btn btn-l btn-s" data-act="modDismiss" data-id="${m.id}">Dismiss</button></div></td></tr>`; }).join('') || '<tr><td colspan="5"><div class="empty">No safety refusals. The queue is clear.</div></td></tr>'}</tbody></table></div></div>` : '');
};
AFTER.ai = () => {
  if (tab('ai', 'monitor') !== 'monitor' || D.hours.length < 1) return;
  const labels = D.hours.map((h: any) => new Date(h.h + ':00:00Z'));
  if (D.hours.length > 1) lineChart('#ch-lat', { labels, series: [{ name: 'p50', color: 'var(--s1)', values: D.hours.map((h: any) => h.p50 ?? 0) }, { name: 'p95', color: 'var(--s2)', values: D.hours.map((h: any) => h.p95 ?? 0) }], fmt: (v: number) => v + 's', yfmt: (v: number) => v + 's', xfmt: fTime, tfmt: fDT, h: 210, ml: 40, area: false });
  barChart('#ch-runs', { labels, series: [{ name: 'Succeeded', color: 'var(--s1)', values: D.hours.map((h: any) => h.ok) }, { name: 'Failed', color: 'var(--crit)', values: D.hours.map((h: any) => h.bad) }], fmt: int, xfmt: fTime, tfmt: fDT, h: 210, ml: 36 });
};
P.model = () => {
  const ai = D.settings.ai; S.f.fallback = S.f.fallback || [...ai.fallback];
  const known = [...new Set([ai.model, ...D.aiPricing.map((p: any) => p.model).filter((m: string) => /image|imagen/.test(m)), ...ai.fallback])];
  const meta = D.settingsMeta.ai;
  const beaut = S.f.beaut ?? ai.beautifier;
  return `<section class="grid g-73"><div class="card"><div class="card__h"><div><h3>Live model settings</h3><p>Stored in <span class="mono">app_settings</span>. Edge functions read them on each request, so changes apply within seconds, no deploy.</p></div>${meta ? `<span class="pill info nodot">saved ${ago(meta.at)}${meta.by ? ' by ' + esc(meta.by) : ''}</span>` : ''}</div>
   <div class="fgrid"><div class="field"><label for="m-model">Live model</label><select class="inp" id="m-model">${known.map((m: string) => `<option ${m === ai.model ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select><small>Est. ${D.costs.avgCostPerGen != null ? gbp(D.costs.avgCostPerGen, 3) : '—'} per image from real usage</small></div>
   <div class="field"><label for="m-free">Free credits on signup</label><input class="inp" id="m-free" type="number" min="0" max="20" value="${ai.free_credits}"><small>Applies to new accounts. The homepage copy still says ${ai.free_credits === 2 ? 'the same' : 'the old number'} until you edit it.</small></div></div>
   <div class="field"><span class="flabel">Fallback order</span><small>Tried top to bottom when the model above fails or times out</small><ol class="order" id="m-order">${S.f.fallback.map((m: string, i: number) => `<li><b>${esc(m)}</b><button data-act="mv" data-i="${i}" data-d="-1" aria-label="Move up">${ic('up')}</button><button data-act="mv" data-i="${i}" data-d="1" aria-label="Move down" style="transform:rotate(180deg)">${ic('up')}</button></li>`).join('')}</ol></div>
   <div class="field"><label for="m-beaut">Prompt beautifier (opening instruction)</label><textarea class="inp" id="m-beaut" rows="4" placeholder="You turn a homeowner's rough note into a precise instruction for an interior-design image editor.">${esc(beaut)}</textarea><small>${beaut.length} characters · replaces the opening line sent to the text model before every generation. Leave empty for the built-in default. The rules after it (under 40 words, no extra changes) stay fixed.</small></div>
   <div class="row">${saBtn('Save model settings', 'saveModel', '', 'btn-p', 'check')}</div></div>
   <div class="stack"><div class="card"><div class="card__h"><div><h3>Price per million tokens</h3><p>Used to turn Gemini's token counts into pounds. These start as estimates: copy the real numbers from Google's pricing page.</p></div></div>
    ${D.aiPricing.map((p: any, i: number) => `<div class="stack" style="gap:6px"><b class="mono" style="font-size:12.5px">${esc(p.model)}</b><div class="fgrid"><div class="field"><label class="flabel" for="pr-in-${i}">Input $</label><input class="inp" id="pr-in-${i}" type="number" step="0.01" value="${p.input_usd_per_m}"></div><div class="field"><label class="flabel" for="pr-out-${i}">Output $</label><input class="inp" id="pr-out-${i}" type="number" step="0.01" value="${p.output_usd_per_m}"></div></div>${saBtn('Save ' + p.model.replace('gemini-', ''), 'savePrice', 'data-i="' + i + '"', 'btn-l btn-s', 'check')}</div>`).join('<div class="hr"></div>')}
    <div class="field"><label for="usdgbp">USD to GBP rate</label><input class="inp" id="usdgbp" type="number" step="0.01" value="${ai.usd_gbp}"></div>${saBtn('Save rate', 'saveRate', '', 'btn-l btn-s', 'check')}</div>
   <div class="card"><div class="card__h"><h3>Settings history</h3></div><div class="tl">${D.audit.filter((a: any) => a.action.startsWith('settings.ai') || a.action === 'flag.change').slice(0, 6).map((a: any) => `<div class="tl__i"><span class="tl__d warn"></span><div class="tl__b"><b class="mono">${esc(a.action)}</b><small>${esc(a.admin)} · ${ago(a.at)}</small><span class="diff"><s>${esc(a.before)}</s>→<ins>${esc(a.after)}</ins></span></div></div>`).join('') || '<div class="empty">No changes yet.</div>'}</div></div></div></section>`;
};

/* ---------------- 6. FEATURE FLAGS & SETTINGS ---------------- */
export const FLAGS = [['demo', 'Free demo', 'Try Mantha on the homepage without an account', 'DISABLE DEMO'], ['signups', 'Signups', 'The Create account page (existing customers can still sign in)', 'DISABLE SIGNUPS'], ['generation', 'Generation', 'All Mantha features for signed-in users', 'DISABLE GENERATION'], ['checkout', 'Checkout', 'Stripe checkout and new subscriptions', 'DISABLE CHECKOUT']];
P.flags = () => {
  const t = tab('flags', 'switches'); const fl = D.settings.flags;
  return head('Configuration · app_settings', 'Flags & <em>site settings</em>', 'Turn parts of the product on and off, show a maintenance banner, and see the live price. Every change is typed-confirmed and logged.', '') +
  tabs('flags', [['switches', 'Switches'], ['pricing', 'Pricing']]) +
  (t === 'switches' ? `<section class="grid g-73"><div class="card"><div class="card__h"><div><h3>Product switches</h3><p>Take effect within about 10 seconds for everyone</p></div></div>
    ${FLAGS.map((f) => `<div class="flag ${fl[f[0]] ? '' : 'off'}"><div class="flag__b"><b>${f[1]}</b><small>${f[2]}</small></div>${fl[f[0]] ? '<span class="pill good">on</span>' : '<span class="pill crit">off</span>'}<button class="sw sa-only" role="switch" aria-checked="${fl[f[0]]}" data-act="flag" data-k="${f[0]}" aria-label="${f[1]}"></button></div>`).join('')}
    ${D.settings.ai.kill_switch ? `<div class="callout crit">${ic('alert')}<span>The AI kill switch is on, so generation is stopped regardless of the switch above. <a href="#costs" data-tabgo="costs:alerts">Open kill switch</a></span></div>` : ''}</div>
   <div class="card"><div class="card__h"><div><h3>Maintenance banner</h3><p>Shown at the top of the site and the app</p></div><button class="sw" role="switch" aria-checked="${fl.maintenance}" data-act="maint" aria-label="Show maintenance banner"></button></div>
    <div class="field"><label for="mt">Banner text</label><textarea class="inp" id="mt" rows="3">${esc(D.settings.maintenance_text)}</textarea></div>
    <span class="flabel">Preview</span><div class="maint">${ic('alert')}<span id="mtp">${esc(D.settings.maintenance_text)}</span></div>
    ${saBtn('Save text', 'saveMaint', '', 'btn-l', 'check')}</div></section>` :
  `<div class="callout warn">${ic('lock')}<span><b>Pricing is read-only here.</b> Changing a price means creating a new Stripe Price and moving subscribers, so it stays a deliberate step in Stripe. What you see below is read live from Stripe.</span></div>
   <div class="card"><div class="card__h"><div><h3>Plans on sale</h3><p>From Stripe and the product catalogue</p></div><a class="btn btn-l btn-s" href="https://dashboard.stripe.com/products" target="_blank" rel="noopener">${ic('ext')}Open in Stripe</a></div>
    <div class="plans">${D.plans.map((p: any) => `<div class="plan feat"><div class="plan__n">${esc(p.name)} · ${p.subs} subs</div><div class="plan__p">${gbp(p.price)}<small> / month</small></div>
     <div class="fgrid"><div class="field"><label class="flabel">Credits</label><input class="inp" disabled value="${p.credits}"></div><div class="field"><label class="flabel">First month</label><input class="inp" disabled value="${p.intro != null ? gbp(p.intro) : 'none'}"></div></div>
     <small>${gbp(p.price / p.credits, 3)} per design</small></div>`).join('')}</div></div>
   <div class="card"><div class="card__h"><h3>Price change history</h3></div><div class="tl">${D.audit.filter((a: any) => a.action.startsWith('pricing')).map((a: any) => `<div class="tl__i"><span class="tl__d crit"></span><div class="tl__b"><b>${esc(a.target)}</b><small>${esc(a.admin)} · ${fDT(a.at)}</small></div></div>`).join('') || '<div class="empty">No price changes recorded here.</div>'}</div></div>`);
};
AFTER.flags = () => { const mt = $('#mt'); if (mt) mt.oninput = () => { $('#mtp').textContent = mt.value; }; };

/* ---------------- ACCESS & ROLES ---------------- */
P.access = () => {
  const sec = D.settings.security, me = D.me;
  return head('Configuration · access model', 'Access & <em>roles</em>', 'super_admin sits above admin. Admins keep today’s powers. Risky actions need super_admin, a typed confirmation, and write to the audit log.', saBtn('Invite admin', 'invite', '', 'btn-p', 'plus')) +
  `<section class="grid g4">${kpi('Super admins', D.admins.filter((a: any) => a.role === 'super_admin').length, '', '', { note: 'max 3 recommended' })}${kpi('Admins', D.admins.filter((a: any) => a.role === 'admin').length, '', '', { note: '' })}${kpi('Without 2FA', D.admins.filter((a: any) => !a.tfa).length, '', D.admins.some((a: any) => !a.tfa) ? 'down' : '', { note: sec.require_2fa ? 'blocked at sign-in' : 'not enforced yet' })}${kpi('Session timeout', sec.timeout_min + ' min', '', 'flat', { note: 'idle, then password again' })}</section>
  <div class="card"><div class="card__h"><div><h3>Admin team</h3><p>Nobody can raise or remove their own role. Role changes need another super admin. The last super admin can't be demoted.</p></div></div>
   <div class="tbl-wrap"><table><thead><tr><th>Admin</th><th>Role</th><th>2FA</th><th>Last sign-in</th><th>IP</th><th>Change role</th><th></th></tr></thead><tbody>
   ${D.admins.map((a: any) => { const self = a.id === me.id; return `<tr><td>${whoCell(a)}</td><td>${chipRole(a.role)}${self ? ' <span class="pill mute nodot">you</span>' : ''}</td><td>${a.tfa ? '<span class="pill good">TOTP on</span>' : '<span class="pill crit">not set up</span>'}</td><td class="tabnum">${a.last ? ago(a.last) : '—'}</td><td class="mono">${esc(a.ip || '—')}</td>
    <td>${self ? `<span class="sub" title="No self-changes">Can’t change your own role</span>` : `<select class="inp" style="padding:7px 10px;width:auto" data-role-for="${a.id}" ${isSA() ? '' : 'disabled'}><option value="admin" ${a.role === 'admin' ? 'selected' : ''}>admin</option><option value="super_admin" ${a.role === 'super_admin' ? 'selected' : ''}>super_admin</option></select>`}</td>
    <td>${self ? '' : saBtn('Remove', 'removeAdmin', 'data-id="' + a.id + '"', 'btn-xl btn-s', 'trash')}</td></tr>`; }).join('')}
   </tbody></table></div></div>
  <section class="grid g-37"><div class="card"><div class="card__h"><div><h3>Sign-in policy</h3><p>Applies to everyone with an admin role</p></div></div>
    <div class="flag"><div class="flag__b"><b>Require 2FA (authenticator app)</b><small>Supabase MFA · admins without it are blocked from the panel. Set yours up below first.</small></div><button class="sw sa-only" role="switch" aria-checked="${sec.require_2fa}" data-act="req2fa" aria-label="Require 2FA"></button></div>
    <div class="field"><label for="tout">Idle session timeout</label><select class="inp" id="tout" ${isSA() ? '' : 'disabled'}>${[15, 30, 60, 120].map((m) => `<option value="${m}" ${m === sec.timeout_min ? 'selected' : ''}>${m} minutes</option>`).join('')}</select><small>After this the panel locks and asks for your password again</small></div>
    <div class="flag"><div class="flag__b"><b>IP allow-list</b><small>Optional · only these addresses can use the panel. Your current IP is ${esc(me.ip)}.</small></div><button class="sw sa-only" role="switch" aria-checked="${sec.ip_allow}" data-act="ipAllow" aria-label="IP allow-list"></button></div>
    <div class="stack" style="gap:6px">${sec.ips.map((ip: string, i: number) => `<div class="row sb" style="padding:8px 12px;border-radius:12px;background:var(--paper-2);box-shadow:inset 0 0 0 1px var(--stone)"><span class="mono">${esc(ip)}</span><button class="btn btn-l btn-s" data-act="rmIp" data-i="${i}">Remove</button></div>`).join('')}
     <div class="row"><input class="inp mono" id="newip" placeholder="e.g. 81.2.69.142 · office" style="flex:1;min-width:160px"><button class="btn btn-l" data-act="addIp">${ic('plus')}Add</button><button class="btn btn-l" data-act="addMyIp">Add my IP</button></div></div>
    <button class="btn btn-l" data-act="simTimeout">${ic('lock')}Preview the timeout lock screen</button>
    <div class="hr"></div>
    <div class="flag"><div class="flag__b"><b>Your two-factor authentication</b><small>${me.mfa ? 'Authenticator app is set up on your account.' : 'Not set up. Scan a QR code with Google Authenticator, 1Password or similar.'}</small></div>${me.mfa ? '<span class="pill good">on</span>' : '<button class="btn btn-p btn-s" data-act="mfaEnroll">Set up</button>'}</div><div id="mfa-box"></div></div>
   <div class="card"><div class="card__h"><div><h3>What each role can do</h3><p>Risky actions are super-admin only and need a typed confirmation</p></div></div>
    <div class="tbl-wrap"><table class="mx"><thead><tr><th>Action</th><th>admin</th><th>super_admin</th><th>Typed confirm</th></tr></thead><tbody>
    ${[['View dashboards, users, generations', 1, 1, 0], ['Sync from Stripe, open in Stripe', 1, 1, 0], ['View a user read-only', 1, 1, 1], ['Flag a design', 1, 1, 0], ['Grant or remove credits', 0, 1, 1], ['Suspend, reset credits, export user', 0, 1, 1], ['Delete account (GDPR)', 0, 1, 1], ['Re-sync failed Stripe events', 0, 1, 1], ['Feature flags, maintenance, kill switch', 0, 1, 1], ['Model settings, free credits, token prices', 0, 1, 1], ['Promo codes', 0, 1, 1], ['Change other admins’ roles', 0, 1, 1], ['Change your own role', 0, 0, 0]].map((r) => `<tr><td>${r[0]}</td><td>${r[1] ? '<span class="ck">✓</span>' : '<span class="nk">–</span>'}</td><td>${r[2] ? '<span class="ck">✓</span>' : '<span class="nk">–</span>'}</td><td>${r[3] ? '<span class="pill warn nodot">typed</span>' : ''}</td></tr>`).join('')}
    </tbody></table></div></div></section>`;
};
