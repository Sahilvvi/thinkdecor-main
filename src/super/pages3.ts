// @ts-nocheck
/* Super admin pages, part 3: Growth & marketing, System & data, Audit log. Real data from D. */
import {
  $, esc, gbp, int, pct, sum, fDate, fDateY, fDT, fTime, ago, ic, kpi, spark, hbars, saBtn, barChart, lineChart, D, S, isSA, userById,
} from './core';
import { P, AFTER, tab, tabs, head, seg, chips, lastDays } from './pages1';

const mb = (b: number) => (b / 1e6 >= 1000 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(1) + ' MB');

/* ---------------- 7. GROWTH & MARKETING ---------------- */
P.growth = () => {
  const t = tab('growth', 'traffic'); const tr = D.traffic;
  const v30 = sum(tr.daily.slice(-30).map((d: any) => Number(d.views))), vis30 = D.funnel.visitors;
  const src = tr.sources.filter((s: any) => s.source !== 'Internal');
  const tracked = src.some((s: any) => s.source !== 'Not tracked yet');
  return head('Growth · page_views, posts, codes', 'Growth & <em>marketing</em>', 'Where visitors come from, which posts and pages work, who to email, and which promo codes pay back.', '') +
  tabs('growth', [['traffic', 'Traffic'], ['content', 'Content & SEO'], ['comms', 'Email'], ['refs', 'Referrals']]) +
  (t === 'traffic' ? `<section class="grid g4">${kpi('Visitors · 30d', int(vis30), '', '', { v: tr.daily.length > 1 ? tr.daily.slice(-30).map((d: any) => Number(d.visitors)) : null, note: 'unique sessions' })}${kpi('Page views · 30d', int(v30), '', '', { note: 'from page_views' })}${kpi('Views per visitor', vis30 ? (v30 / vis30).toFixed(1) : '—', '', '', { note: '30 days' })}${kpi('Signups · 30d', int(D.funnel.signups), '', '', { note: vis30 ? pct(D.funnel.signups / vis30) + ' of visitors' : '' })}</section>
   <div class="card"><div class="card__h"><div><h3>Page views per day</h3><p>Last 90 days · logged by the site into <span class="mono">page_views</span></p></div></div>${tr.daily.length > 1 ? '<div class="chart" id="ch-pv"></div>' : '<div class="empty">Needs at least two days of data.</div>'}</div>
   <section class="grid g2"><div class="card"><div class="card__h"><div><h3>Sources</h3><p>Visitors · last 30 days</p></div></div>${src.length ? hbars(src.map((s: any) => [s.source, Number(s.visitors)]), int) : '<div class="empty">No data yet.</div>'}${tracked ? '' : `<div class="callout">${ic('alert')}<span>Referrer tracking was switched on today. Earlier visits have no source, so this fills in from now on.</span></div>`}</div>
    <div class="card"><div class="card__h"><div><h3>Search keywords</h3><p>Google Search Console</p></div></div><div class="empty"><b>Not connected.</b><br>Search Console data can't be read from here yet. Open <a href="https://search.google.com/search-console" target="_blank" rel="noopener">Search Console</a> for queries and positions.</div></div></section>
   <div class="card"><div class="card__h"><div><h3>Top pages</h3><p>Last 30 days</p></div></div><div class="tbl-wrap"><table><thead><tr><th>Page</th><th class="n">Views</th><th class="n">Visitors</th></tr></thead><tbody>${tr.top.map((p: any) => `<tr><td class="mono">${esc(p.path)}</td><td class="n">${int(Number(p.views))}</td><td class="n">${int(Number(p.visitors))}</td></tr>`).join('') || '<tr><td colspan="3"><div class="empty">No page views yet.</div></td></tr>'}</tbody></table></div></div>` : '') +
  (t === 'content' ? `<div class="card"><div class="card__h"><div><h3>Blog posts</h3><p>Views in the last 30 days and SEO checks worked out from each post</p></div><div class="legend"><span><span class="ck" style="width:18px;height:18px;font-size:10px">✓</span>passing</span><span><span class="nk" style="width:18px;height:18px">–</span>missing</span></div></div>
    <div class="tbl-wrap"><table class="mx"><thead><tr><th>Post</th><th class="n">Views</th><th class="n">Read</th><th>Title ≤70</th><th>Excerpt 60–200</th><th>Schema</th><th>In sitemap</th><th>2+ internal links</th><th>Status</th></tr></thead><tbody>
    ${D.posts.map((p: any) => `<tr><td style="text-align:left"><b>${esc(p.title)}</b><br><small class="mono muted">/blog/${esc(p.slug)}</small></td><td class="n">${int(p.views)}</td><td class="n">${p.readMin ?? '—'} min</td>${['title', 'meta', 'schema', 'sitemap', 'links'].map((k) => `<td>${p.seo[k] ? '<span class="ck">✓</span>' : '<span class="nk">–</span>'}</td>`).join('')}<td>${p.published ? '<span class="pill good">live</span>' : '<span class="pill mute">draft</span>'}</td></tr>`).join('') || '<tr><td colspan="9"><div class="empty">No posts.</div></td></tr>'}
    </tbody></table></div></div>
    <div class="card"><div class="card__h"><div><h3>Views per post</h3><p>Top posts · last 30 days</p></div></div>${D.posts.some((p: any) => p.views) ? '<div class="chart" id="ch-posts"></div>' : '<div class="empty">No post views recorded yet.</div>'}</div>` : '') +
  (t === 'comms' ? P.comms() : '') +
  (t === 'refs' ? `<section class="grid g-73"><div class="card"><div class="card__h"><div><h3>Promo codes and redemptions</h3><p>From Stripe, all time</p></div><a class="btn btn-l btn-s" href="#billing" data-tabgo="billing:promo">Manage codes</a></div>
    <div class="tbl-wrap"><table><thead><tr><th>Code</th><th>Owner</th><th>Offer</th><th class="n">Redemptions</th><th class="n">Limit</th><th>Status</th></tr></thead><tbody>${D.stripe.promos.map((r: any) => `<tr><td><b class="mono">${esc(r.code)}</b></td><td>${esc(r.owner || '—')}</td><td>${esc(r.off)}</td><td class="n">${r.uses}</td><td class="n">${r.limit ?? '—'}</td><td>${r.active ? '<span class="pill good">active</span>' : '<span class="pill mute">paused</span>'}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No promo codes yet.</div></td></tr>'}</tbody></table></div></div>
    <div class="card"><div class="card__h"><div><h3>Redemptions by code</h3></div></div>${D.stripe.promos.some((r: any) => r.uses) ? '<div class="chart" id="ch-refs"></div>' : '<div class="empty">No redemptions yet.</div>'}</div></section>` : '');
};
P.comms = () => {
  const c = D.comms; const mode = S.f.mailTo || 'seg';
  return `<section class="grid g-73"><div class="card"><div class="card__h"><div><h3>Send an email</h3><p>Sent through Resend from hello@thinkdecor.app</p></div>${seg('mailTo', [['seg', 'Segment'], ['one', 'One user']], mode)}</div>
    ${c.emailReady ? '' : `<div class="callout warn">${ic('alert')}<span><b>Email isn't switched on.</b> Add <span class="mono">RESEND_API_KEY</span> to the Supabase secrets and verify the thinkdecor.app domain in Resend, then sending works here.</span></div>`}
    ${mode === 'seg' ? `<div class="field"><label for="e-seg">Segment</label><select class="inp" id="e-seg">${c.segments.map((s: any) => `<option value="${s.key}">${esc(s.label)} · ${s.count}</option>`).join('')}</select></div>` : `<div class="field"><label for="e-one">User</label><select class="inp" id="e-one">${D.users.slice(0, 200).map((u: any) => `<option>${esc(u.email)}</option>`).join('')}</select></div>`}
    <div class="field"><label for="e-sub">Subject</label><input class="inp" id="e-sub" placeholder="Your room, redesigned in seconds"></div>
    <div class="field"><label for="e-body">Message</label><textarea class="inp" id="e-body" rows="6" placeholder="Write your message"></textarea><small>Plain text. Sent one by one, up to 500 people.</small></div>
    <div class="row">${saBtn('Send', 'sendMail', c.emailReady ? '' : 'disabled', 'btn-p', 'mail')}</div></div>
    <div class="card"><div class="card__h"><div><h3>Newsletter and enquiries</h3><p>${c.newsletter.count} newsletter signups from the site</p></div></div>
     ${c.newsletter.recent.map((s: any) => `<div class="li"><div class="li__b"><b>${esc(s.email)}</b><small>${ago(s.at)}</small></div></div>`).join('') || '<div class="empty">No signups yet.</div>'}</div></section>`;
};
AFTER.growth = () => {
  const t = tab('growth', 'traffic'), tr = D.traffic;
  if (t === 'traffic' && tr.daily.length > 1) {
    lineChart('#ch-pv', { labels: tr.daily.map((d: any) => new Date(d.d)), series: [{ name: 'Page views', color: 'var(--s1)', values: tr.daily.map((d: any) => Number(d.views)) }, { name: 'Visitors', color: 'var(--s3)', values: tr.daily.map((d: any) => Number(d.visitors)) }], fmt: int, yfmt: (v: number) => (v >= 1000 ? v / 1000 + 'k' : v), xfmt: fDate, tfmt: fDateY, h: 220, ml: 40 });
  }
  if (t === 'content') { const ps = D.posts.filter((p: any) => p.views).sort((a: any, b: any) => b.views - a.views).slice(0, 12); if (ps.length) barChart('#ch-posts', { labels: ps.map((_: any, i: number) => 'Post ' + (i + 1)), series: [{ name: 'Views', color: 'var(--s3)', values: ps.map((p: any) => p.views) }], fmt: int, tfmt: (l: string) => ps[+l.split(' ')[1] - 1].title.slice(0, 40) + '…', h: 200, ml: 44 }); }
  if (t === 'refs') { const ps = D.stripe.promos.filter((r: any) => r.uses); if (ps.length) barChart('#ch-refs', { labels: ps.map((r: any) => r.code), series: [{ name: 'Redemptions', color: 'var(--s2)', values: ps.map((r: any) => r.uses) }], fmt: int, h: 220, ml: 40 }); }
};

/* ---------------- 8. SYSTEM & DATA ---------------- */
P.system = () => {
  const t = tab('system', 'health'); const sy = D.system;
  const missing = sy.secrets.filter((s: any) => !s.set && !s.optional).length;
  return head('Safety · infrastructure', 'System & <em>data</em>', 'Site check, failures, storage and database size, backups, exports and a checklist of secrets. Secret values are never shown here.', '') +
  tabs('system', [['health', 'Health'], ['backups', 'Backups & export'], ['secrets', 'Secrets checklist', missing || null]]) +
  (t === 'health' ? (() => {
    const h24 = D.gens.filter((g: any) => Date.now() - g.at.getTime() < 864e5), bad = h24.filter((g: any) => g.status === 'failed').length;
    const fails = D.stripe.events.filter((e: any) => !e.ok).length;
    const dbTop = sy.db.tables?.[0];
    const fnRows = [
      ['generate-redesign', h24.filter((g: any) => g.feature !== 'demo')],
      ['demo-redesign', h24.filter((g: any) => g.feature === 'demo')],
    ].map(([n, arr]: any) => { const bads = arr.filter((g: any) => g.status === 'failed').length; const l = arr.filter((g: any) => g.latency).map((g: any) => g.latency).sort((a: number, b: number) => a - b); return [n, arr.length, arr.length ? bads / arr.length : 0, l.length ? l[Math.min(l.length - 1, Math.floor(l.length * .95))] : null]; });
    return `<section class="grid g5">${kpi('Site check', sy.site.ok ? 'Up' : 'Down', '', sy.site.ok ? 'up' : 'down', { note: sy.site.ok ? sy.site.ms + ' ms · HTTP ' + sy.site.status : 'HTTP ' + sy.site.status })}${kpi('Failed attempts · 24h', bad, '', bad ? 'down' : '', { note: 'AI generation' })}${kpi('Failed webhooks', fails, '', fails ? 'down' : '', { note: 'Stripe, last 100 events' })}
    <div class="kpi"><div class="kpi__l">Storage</div><div class="kpi__v" style="font-size:28px">${mb(Number(sy.db.storage_bytes || 0))}</div><div class="kpi__d">${int(Number(sy.db.storage_objects || 0))} files · uploads + outputs</div></div>
    <div class="kpi"><div class="kpi__l">Database</div><div class="kpi__v" style="font-size:28px">${mb(Number(sy.db.db_bytes || 0))}</div><div class="kpi__d">${dbTop ? esc(dbTop.name) + ' is the largest table' : ''}</div></div></section>
   <section class="grid g-73"><div class="card"><div class="card__h"><div><h3>Largest tables</h3><p>Total size including indexes</p></div></div>${hbars((sy.db.tables || []).map((x: any) => [x.name, Number(x.bytes)]), (v: number) => mb(v))}</div>
    <div class="card"><div class="card__h"><div><h3>Open items</h3></div></div>
     <div class="li"><span class="li__ic ${sy.openTickets ? 'warn' : 'good'}">${ic(sy.openTickets ? 'alert' : 'check')}</span><div class="li__b"><b>${sy.openTickets} open support ticket${sy.openTickets === 1 ? '' : 's'}</b></div></div>
     <div class="li"><span class="li__ic ${fails ? 'crit' : 'good'}">${ic(fails ? 'alert' : 'check')}</span><div class="li__b"><b>${fails} failed Stripe deliveries</b><small><a href="#billing" data-tabgo="billing:hooks">Open webhook health</a></small></div></div>
     <div class="li"><span class="li__ic ${missing ? 'warn' : 'good'}">${ic(missing ? 'alert' : 'check')}</span><div class="li__b"><b>${missing} required secret${missing === 1 ? '' : 's'} missing</b></div></div>
     <div class="li"><span class="li__ic ${D.admins.some((a: any) => !a.tfa) ? 'warn' : 'good'}">${ic('shield')}</span><div class="li__b"><b>${D.admins.filter((a: any) => !a.tfa).length} admin${D.admins.filter((a: any) => !a.tfa).length === 1 ? '' : 's'} without 2FA</b></div></div></div></section>
   <div class="card"><div class="card__h"><div><h3>Functions we can measure</h3><p>Last 24 hours, from the attempt log</p></div></div><div class="tbl-wrap"><table><thead><tr><th>Function</th><th class="n">Calls</th><th style="min-width:160px">Error rate</th><th class="n">p95</th><th>Status</th></tr></thead><tbody>${fnRows.map((f: any) => `<tr><td class="mono">${f[0]}</td><td class="n">${int(f[1])}</td><td><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar" style="flex:1"><i class="${f[2] > .1 ? 'crit' : f[2] > .03 ? 'warn' : ''}" style="width:${Math.max(2, f[2] * 100)}%"></i></div><span class="mono">${pct(f[2])}</span></div></td><td class="n">${f[3] != null ? f[3] + 's' : '—'}</td><td>${!f[1] ? '<span class="pill mute">no traffic</span>' : f[2] > .1 ? '<span class="pill crit">degraded</span>' : f[2] > .03 ? '<span class="pill warn">watch</span>' : '<span class="pill good">healthy</span>'}</td></tr>`).join('')}</tbody></table></div></div>`;
  })() : '') +
  (t === 'backups' ? `<section class="grid g2"><div class="card"><div class="card__h"><div><h3>Backups</h3><p>Managed by Supabase</p></div></div>
    <div class="callout">${ic('db')}<span>Daily backups and point-in-time recovery are run by Supabase and can only be viewed or restored from its dashboard. This panel can't read their status.</span></div>
    <a class="btn btn-d" href="https://supabase.com/dashboard/project/xgeywhbuvpbbzhldtbxj/database/backups/scheduled" target="_blank" rel="noopener">${ic('ext')}Open backups in Supabase</a></div>
   <div class="card"><div class="card__h"><div><h3>Data export</h3><p>Downloads a CSV straight to your computer. Every export is logged.</p></div></div>
    <div class="fgrid"><div class="field"><label for="x-set">Dataset</label><select class="inp" id="x-set"><option value="users">Users · ${int(D.users.length)} rows</option><option value="payments">Payments</option><option value="generations">Generation attempts</option><option value="audit">Audit log</option></select></div>
    <div class="field"><label for="x-from">From</label><input class="inp" id="x-from" type="date" value="${new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)}"></div><div class="field"><label for="x-to">To</label><input class="inp" id="x-to" type="date" value="${new Date().toISOString().slice(0, 10)}"></div></div>
    <div class="flag"><div class="flag__b"><b>Mask personal data</b><small>Hash emails and phone numbers in the file</small></div><button class="sw" role="switch" aria-checked="true" data-act="plainToggle" id="x-mask" aria-label="Mask personal data"></button></div>
    ${saBtn('Download export', 'doExport', '', 'btn-p', 'down')}
    <div class="hr"></div><h4 style="font-size:18px">Recent exports</h4>${D.audit.filter((a: any) => a.action.startsWith('export')).slice(0, 4).map((a: any) => `<div class="li"><span class="li__ic">${ic('down')}</span><div class="li__b"><b>${esc(a.target)}</b><small>${esc(a.admin)} · ${ago(a.at)}</small></div></div>`).join('') || '<div class="empty">No exports yet.</div>'}</div></section>` : '') +
  (t === 'secrets' ? `<div class="card"><div class="card__h"><div><h3>Secrets & environment</h3><p>Checked from the edge function's environment on every refresh. Values never leave the server.</p></div><span class="pill ${sy.secrets.every((s: any) => s.set || s.optional) ? 'good' : 'warn'}">${sy.secrets.filter((s: any) => s.set).length}/${sy.secrets.length} set</span></div>
    ${sy.secrets.map((s: any) => `<div class="secret"><div><code>${s.name}</code><small>${esc(s.group)}${s.optional ? ' · optional' : ''}</small></div><span class="mask">${s.set ? '••••••••••' : ''}</span>${s.set ? '<span class="pill good">set</span>' : s.optional ? '<span class="pill mute">optional</span>' : '<span class="pill crit">missing</span>'}</div>`).join('')}
    <div class="callout">${ic('key')}<span>To change a value, use <span class="mono">supabase secrets set</span> or the Supabase dashboard. This panel only reports whether each one exists.</span></div></div>` : '');
};

/* ---------------- AUDIT LOG ---------------- */
S.f.aq = ''; S.f.aa = 'all'; S.f.ad = 'all'; S.f.as = 'all';
export function auditRows() {
  const q = S.f.aq.toLowerCase(), lim = ({ d1: 1, d7: 7, d30: 30 } as any)[S.f.ad];
  return D.audit.filter((a: any) => (S.f.aa === 'all' || a.admin === S.f.aa) && (S.f.as === 'all' || a.sev === S.f.as) && (!lim || (Date.now() - a.at.getTime()) / 864e5 <= lim) && (!q || (a.action + a.target + a.reason + a.before + a.after).toLowerCase().includes(q)));
}
export function auditTable() {
  const rows = auditRows();
  return `<table><thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Record</th><th>Before → after</th><th>Reason</th><th>IP</th></tr></thead><tbody>${rows.map((a: any) => `<tr class="click" data-audit="${a.id}"><td class="tabnum" style="white-space:nowrap">${fDT(a.at)}</td><td><b style="font-weight:600">${esc(a.admin)}</b><br><span class="role ${a.role === 'super_admin' ? 'sa' : 'ad'}" style="padding:2px 7px;font-size:10.5px">${esc(a.role)}</span></td><td><span class="pill ${a.sev === 'crit' ? 'crit' : a.sev === 'warn' ? 'warn' : 'info'} nodot mono">${esc(a.action)}</span></td><td>${esc(a.target)}</td><td><span class="diff"><s>${esc(a.before)}</s>→<ins>${esc(a.after)}</ins></span></td><td class="muted" style="max-width:220px">${esc(a.reason) || '—'}</td><td class="mono">${esc(a.ip)}</td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">No entries yet. Every risky action appears here.</div></td></tr>'}</tbody></table>`;
}
P.audit = () => {
  const admins = [...new Set(D.audit.map((a: any) => a.admin))];
  return head('Safety · audit_log', 'Audit <em>log</em>', 'Who did what, to which record, when, with the value before and after. Every risky action writes here. Entries can’t be edited or deleted: the database refuses.', saBtn('Export CSV', 'exportAudit', '', 'btn-l', 'down')) +
  `<div class="card"><div class="toolbar"><label class="minisearch">${ic('search')}<input id="aq" value="${esc(S.f.aq)}" placeholder="Search action, record or reason"></label>
   <div class="row"><select class="inp" id="aa" style="width:auto">${['all', ...admins].map((n: any) => `<option value="${esc(n)}" ${n === S.f.aa ? 'selected' : ''}>${n === 'all' ? 'All admins' : esc(n)}</option>`).join('')}</select>
   <select class="inp" id="ad" style="width:auto">${[['all', 'Any date'], ['d1', 'Last 24 hours'], ['d7', 'Last 7 days'], ['d30', 'Last 30 days']].map((o) => `<option value="${o[0]}" ${o[0] === S.f.ad ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
   ${chips('as', [['all', 'All'], ['crit', 'Danger', D.audit.filter((a: any) => a.sev === 'crit').length], ['warn', 'Sensitive'], ['info', 'Routine']], S.f.as)}</div>
   <div class="tbl-wrap" id="atbl">${auditTable()}</div></div>`;
};
AFTER.audit = () => { const q = $('#aq'); q.oninput = () => { S.f.aq = q.value; $('#atbl').innerHTML = auditTable(); }; $('#aa').onchange = (e: any) => { S.f.aa = e.target.value; $('#atbl').innerHTML = auditTable(); }; $('#ad').onchange = (e: any) => { S.f.ad = e.target.value; $('#atbl').innerHTML = auditTable(); }; };
