// @ts-nocheck
/* Super admin pages, part 1: Business dashboard, Cost & margin, Billing. All numbers come from D (real data). */
import {
  $, esc, gbp, gbp0, int, pct, sum, fDate, fDateY, fDT, fTime, ago, ic, kpi, spark, legend, hbars, statusPill, whoCell, saBtn,
  barChart, divChart, D, S, isSA, userById,
} from './core';

export const P: Record<string, any> = {};
export const AFTER: Record<string, any> = {};

export const tab = (pg: string, def: string) => S.tab[pg] || def;
export function tabs(pg: string, list: any[]) {
  const cur = tab(pg, list[0][0]);
  return `<div class="tabs" role="tablist">${list.map((t) => `<button role="tab" aria-selected="${t[0] === cur}" data-tab="${pg}:${t[0]}">${esc(t[1])}${t[2] != null ? `<span class="cnt">${t[2]}</span>` : ''}</button>`).join('')}</div>`;
}
export function head(kicker: string, title: string, sub: string, actions = '') {
  return `<div class="phead"><div><div class="kicker">${kicker}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="phead__act">${actions}</div></div>`;
}
export function seg(name: string, opts: any[], cur: any) {
  return `<div class="seg" role="group">${opts.map((o) => `<button aria-pressed="${String(o[0]) === String(cur)}" data-seg="${name}:${o[0]}">${esc(o[1])}</button>`).join('')}</div>`;
}
export const chips = (name: string, opts: any[], cur: any) =>
  `<div class="chips">${opts.map((o) => `<button class="chip" aria-pressed="${o[0] === cur}" data-chip="${name}:${o[0]}">${esc(o[1])}${o[2] != null ? ` <b>${o[2]}</b>` : ''}</button>`).join('')}</div>`;
export const emptyCard = (title: string, body: string) => `<div class="card"><div class="empty"><b>${esc(title)}</b><br>${body}</div></div>`;

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
/** The last n calendar days as Date objects (UTC), oldest first. */
export function lastDays(n: number) {
  const out: Date[] = [];
  const t = new Date(); t.setUTCHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) { const x = new Date(t); x.setUTCDate(x.getUTCDate() - i); out.push(x); }
  return out;
}
export const totalCost = (o: any) => (o?.cRedesign ?? 0) + (o?.cCleanup ?? 0) + (o?.cReplace ?? 0) + (o?.cDemo ?? 0);
export const genDay = (k: string) => D.genDaily.find((g: any) => g.d === k);
export const FEATURES = [
  { k: 'redesign', c: 'cRedesign', n: 'Redesign', col: 'var(--s1)' },
  { k: 'cleanup', c: 'cCleanup', n: 'Cleanup', col: 'var(--s2)' },
  { k: 'replace', c: 'cReplace', n: 'Replace', col: 'var(--s3)' },
  { k: 'demo', c: 'cDemo', n: 'Demo', col: 'var(--s4)' },
];
const stripeUrl = (cus: string) => `https://dashboard.stripe.com/customers/${cus}`;

/* ---------------- 1. BUSINESS DASHBOARD ---------------- */
S.f.revGrain = 'day'; S.f.liveOnly = true;
P.dashboard = () => {
  const r = S.range;
  const days = lastDays(r), prevDays = lastDays(2 * r).slice(0, r);
  const revMap = new Map(D.revenue.map((x: any) => [x.d, x]));
  const val = (d: Date) => { const x: any = revMap.get(dayKey(d)); return x ? x.live + (S.f.liveOnly ? 0 : x.test) : 0; };
  const rev = days.map(val), total = sum(rev), prev = sum(prevDays.map(val));
  const mrr = sum(D.plans.map((p: any) => p.price * p.subs)), subs = sum(D.plans.map((p: any) => p.subs));
  const wk = Math.max(1, Math.round(r / 7)), nw = D.newCh.slice(-wk), newS = sum(nw.map((x: any) => x.new)), chS = sum(nw.map((x: any) => x.churn));
  const f = D.funnel, conv = f.signups ? f.paid / f.signups : 0;
  const delta = prev > 0 ? pct((total - prev) / prev) : 'new';
  return head('Overview · Stripe live payments only', 'Business <em>dashboard</em>',
    'Revenue, subscribers and the path from first visit to paid plan. Test-mode payments are excluded unless you switch them on.',
    seg('range', [[7, '7 days'], [30, '30 days'], [90, '90 days']], r) + `<button class="btn btn-l" data-act="exportDash">${ic('down')}Export</button>`) +
  `<section class="grid g5">
    ${kpi('MRR', gbp(mrr), '', '', { note: 'from ' + int(subs) + ' active sub' + (subs === 1 ? '' : 's') }, true)}
    ${kpi('Revenue · ' + r + 'd', gbp(total), delta, total >= prev ? 'up' : 'down', { v: rev.length > 1 ? rev : null, note: 'vs previous ' + r + 'd' })}
    ${kpi('New vs churned', `${newS}<small> / ${chS}</small>`, 'net ' + (newS - chS >= 0 ? '+' : '') + (newS - chS), newS - chS >= 0 ? 'up' : 'down', { v: nw.length > 1 ? nw.map((x: any) => x.new - x.churn) : null, note: 'subscribers', c: 'var(--s3)' })}
    ${kpi('Free → paid', pct(conv), '', '', { note: f.paid + ' of ' + f.signups + ' signups, 30d' })}
    ${kpi('ARPU', subs ? gbp(mrr / subs) : '—', '', '', { note: 'per paying user', c: 'var(--s2)' })}
  </section>
  <section class="grid g-73">
    <div class="card"><div class="card__h"><div><h3>Revenue by ${S.f.revGrain}</h3><p>Stripe <b>live</b> payments · £ gross before fees</p></div>
      <div class="row"><label class="row" style="gap:8px;font:600 12.5px var(--mono);color:var(--taupe)">Include test payments <button class="sw" role="switch" aria-checked="${!S.f.liveOnly}" data-act="toggleTest" aria-label="Include test payments"></button></label>${seg('revGrain', [['day', 'Day'], ['week', 'Week']], S.f.revGrain)}</div></div>
      <div class="chart" id="ch-rev"></div>
      ${S.f.liveOnly ? '' : '<div class="callout warn">' + ic('alert') + '<span>Test-mode payments are included. Switch them off before sharing these numbers.</span></div>'}
    </div>
    <div class="card"><div class="card__h"><div><h3>New vs churned</h3><p>Subscribers per week · last 12 weeks</p></div></div>
      ${legend([['New', 'var(--s1)'], ['Churned', 'var(--s4)']])}<div class="chart" id="ch-nc"></div></div>
  </section>
  <section class="grid g-73">
    <div class="card"><div class="card__h"><div><h3>Funnel</h3><p>Last 30 days · unique people · each bar is share of visitors</p></div><span class="pill info nodot">Paid is ${f.visitors ? pct(f.paid / f.visitors, 2) : '0%'} of visitors</span></div>
      <div class="funnel">${[['Visitors', 'page_views', f.visitors], ['Tried demo', 'homepage_demo_usage', f.demo], ['Signed up', 'auth.users', f.signups], ['First design', 'generations', f.firstDesign], ['Paid', 'subscriptions', f.paid]].map((s: any, i: number, a: any[]) => {
        const w = a[0][2] ? Math.max(4, Math.sqrt(s[2] / a[0][2]) * 100) : 4;
        const cv = i && a[i - 1][2] ? s[2] / a[i - 1][2] : 1;
        return `<div class="fstep"><div class="fstep__n">${s[0]}<small>${s[1]}</small></div><div class="fstep__bar"><i style="width:${Math.min(100, w).toFixed(1)}%">${i ? pct(cv, 0) : '100%'}</i></div><div class="fstep__v">${int(s[2])}${i ? `<small class="${cv >= .3 ? 'ok' : ''}">${pct(cv, 0)} of previous step</small>` : ''}</div></div>`;
      }).join('')}</div>
      <p class="sub">Bar length uses a square-root scale so later steps stay readable. Steps are not strictly nested: a visitor can sign up without using the demo.</p>
    </div>
    <div class="card"><div class="card__h"><div><h3>Plan mix</h3><p>Active subscribers and MRR per plan</p></div></div>
      ${D.plans.length ? hbars(D.plans.map((p: any) => [p.name + ' · ' + gbp(p.price), p.subs]), int) : '<div class="empty">No plans yet.</div>'}
      <div class="hr"></div>
      <div class="stack">${D.plans.map((p: any) => `<div class="row sb"><span class="muted">${esc(p.name)} MRR</span><b class="tabnum">${gbp(p.price * p.subs)}</b></div>`).join('')}<div class="row sb"><b>Total MRR</b><b class="tabnum">${gbp(mrr)}</b></div></div>
    </div>
  </section>
  <section class="grid g-73">
    <div class="card"><div class="card__h"><div><h3>Retention by signup week</h3><p>% of each weekly cohort that made a design N weeks after signing up</p></div><div class="scale">0%<i></i>100%</div></div>
      ${D.cohorts.length ? '<div class="tbl-wrap"><div class="heat" id="heat" style="min-width:560px"></div></div>' : '<div class="empty">Not enough signups yet.</div>'}</div>
    <div class="card"><div class="card__h"><div><h3>Credits left per user</h3><p>All accounts · right now</p></div></div>
      <div class="chart" id="ch-cred"></div>
      <div class="grid g2" style="gap:10px"><div class="kpi" style="padding:12px 14px"><div class="kpi__l">Median</div><div class="kpi__v" style="font-size:26px">${median(D.users.map((u: any) => u.credits))} <small>credits</small></div></div><div class="kpi" style="padding:12px 14px"><div class="kpi__l">Out of credits</div><div class="kpi__v" style="font-size:26px">${D.users.filter((u: any) => u.credits <= 0).length}</div></div></div>
    </div>
  </section>`;
};
function median(a: number[]) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
AFTER.dashboard = () => {
  const r = S.range;
  const revMap = new Map(D.revenue.map((x: any) => [x.d, x]));
  let lab = lastDays(r), vals = lab.map((d) => { const x: any = revMap.get(dayKey(d)); return x ? +(x.live + (S.f.liveOnly ? 0 : x.test)).toFixed(2) : 0; });
  if (S.f.revGrain === 'week') { const L: Date[] = [], V: number[] = []; for (let i = 0; i < vals.length; i += 7) { L.push(lab[i]); V.push(+sum(vals.slice(i, i + 7)).toFixed(2)); } lab = L; vals = V; }
  barChart('#ch-rev', { labels: lab, series: [{ name: 'Revenue', color: 'var(--s1)', values: vals }], fmt: (v: number) => gbp(v), yfmt: (v: number) => '£' + v, xfmt: fDate, tfmt: (d: Date) => S.f.revGrain === 'week' ? 'Week of ' + fDate(d) : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }), h: 230 });
  divChart('#ch-nc', { labels: D.newCh.map((x: any) => fDate(x.w)), pos: { name: 'New', color: 'var(--s1)', values: D.newCh.map((x: any) => x.new) }, neg: { name: 'Churned', color: 'var(--s4)', values: D.newCh.map((x: any) => x.churn) }, h: 230 });
  const hh = $('#heat');
  if (hh) {
    const cols = 10;
    let h = `<div class="heat__row" style="grid-template-columns:120px 54px repeat(${cols},minmax(0,1fr))"><span class="heat__h" style="text-align:left">Signup week</span><span class="heat__h">Users</span>${[...Array(cols)].map((_, i) => `<span class="heat__h">W${i}</span>`).join('')}</div>`;
    D.cohorts.forEach((c: any) => {
      h += `<div class="heat__row" style="grid-template-columns:120px 54px repeat(${cols},minmax(0,1fr))"><span class="heat__lab">${fDate(c.w)}</span><span class="heat__lab" style="justify-content:center">${c.n}</span>${[...Array(cols)].map((_, k) => {
        const v = c.row[k]; if (v == null) return '<span></span>';
        const t = Math.pow(v / 100, .7);
        return `<span class="heat__c ${t > .55 ? 'dk' : ''}" style="background:color-mix(in srgb,var(--heat-hi) ${(t * 100).toFixed(0)}%,var(--heat-lo))" title="${fDate(c.w)} cohort · week ${k}: ${v}% of ${c.n}">${v}%</span>`;
      }).join('')}</div>`;
    });
    hh.innerHTML = h;
  }
  barChart('#ch-cred', { labels: D.creditBuckets.map((b: any) => b[0]), series: [{ name: 'Users', color: 'var(--s3)', values: D.creditBuckets.map((b: any) => b[1]) }], fmt: int, h: 180, tfmt: (l: string) => l + ' credits', ml: 44 });
};

/* ---------------- 2. COST & MARGIN ---------------- */
const monthCost = () => {
  const m = new Date().toISOString().slice(0, 7);
  return sum(D.genDaily.filter((g: any) => g.d.startsWith(m)).map(totalCost));
};
P.costs = () => {
  const cap = D.settings.ai.daily_cap_gbp, today = D.costs.today, kill = D.settings.ai.kill_switch;
  const tk = dayKey(new Date()), tg = genDay(tk);
  const gensToday = tg ? tg.redesign + tg.cleanup + tg.replace + tg.demo : 0;
  const last30 = lastDays(30).map((d) => genDay(dayKey(d)));
  const cost30 = sum(last30.map(totalCost));
  const rev30 = sum(lastDays(30).map((d) => { const x = D.revenue.find((r: any) => r.d === dayKey(d)); return x ? x.live : 0; }));
  const t = tab('costs', 'spend');
  const tracked = D.genDaily.length > 0;
  return head('Overview · Gemini spend', 'Cost & <em>margin</em>',
    'What each generation costs, which feature and user drives it, and whether the plan still makes money. Cost is logged per attempt in <span class="mono">generation_events</span> from the tokens Gemini reports, priced from the table on the Model settings tab.',
    `<span class="pill ${kill ? 'crit' : 'good'}">${kill ? 'Generation stopped' : 'Generation running'}</span>`) +
  `<section class="grid g4">
    <div class="kpi kpi--hero"><div class="kpi__l"><span>AI spend today</span><span>cap ${gbp0(cap)}</span></div><div class="kpi__v">${gbp(today)}</div><div class="meter"><div class="bar" style="background:rgba(255,255,255,.18)"><i style="width:${cap ? Math.min(100, today / cap * 100).toFixed(0) : 0}%;background:#fff"></i></div></div><div class="kpi__d"><span>${cap ? pct(today / cap, 0) : '0%'} of daily cap · resets 00:00 UTC</span></div></div>
    ${kpi('Spend this month', gbp(monthCost()), '', '', { v: last30.some(Boolean) ? last30.map(totalCost) : null, note: 'since tracking began', c: 'var(--s2)' })}
    ${kpi('Cost per generation', D.costs.avgCostPerGen != null ? gbp(D.costs.avgCostPerGen, 3) : '—', '', '', { note: 'blended, last 30 days' })}
    ${kpi('AI cost ÷ revenue', rev30 > 0 ? pct(cost30 / rev30, 0) : '—', '', '', { note: rev30 > 0 ? '30 days · lower is better' : 'no live revenue yet', c: 'var(--s4)' })}
  </section>
  ${!tracked ? `<div class="callout">${ic('alert')}<span><b>Cost tracking just started.</b> Every generation from now on records its model, tokens, time and cost. Older designs have no cost data, so charts fill in as people use Mantha.</span></div>` : ''}
  ${tabs('costs', [['spend', 'Spend'], ['margin', 'Margin by plan'], ['alerts', 'Alerts & caps']])}
  ${t === 'spend' ? `
  <section class="grid g-73">
    <div class="card"><div class="card__h"><div><h3>Spend per day by feature</h3><p>Last 30 days · dashed line is your daily cap</p></div>${legend(FEATURES.map((f) => [f.n, f.col]))}</div><div class="chart" id="ch-spend"></div></div>
    <div class="card"><div class="card__h"><div><h3>By feature</h3><p>Last 30 days</p></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Feature</th><th class="n">Runs</th><th class="n">£ / run</th><th class="n">Total</th></tr></thead><tbody>${FEATURES.map((f) => { const g = sum(last30.map((x) => x?.[f.k] ?? 0)), c = sum(last30.map((x) => x?.[f.c] ?? 0)); return `<tr><td><span class="row" style="gap:8px"><i style="width:10px;height:10px;border-radius:3px;background:${f.col}"></i>${f.n}</span></td><td class="n">${int(g)}</td><td class="n">${g ? gbp(c / g, 3) : '—'}</td><td class="n"><b>${gbp(c)}</b></td></tr>`; }).join('')}</tbody></table></div>
      <div class="hr"></div><h4 style="font-size:18px">By model</h4>
      ${Object.keys(D.costs.byModel).length ? hbars(Object.entries(D.costs.byModel).map(([m, v]: any) => [m, v]), (v: number) => gbp(v, 3)) : '<div class="empty">No model spend recorded yet.</div>'}
    </div>
  </section>
  <div class="card"><div class="card__h"><div><h3>Top users by AI cost</h3><p>Last 30 days · revenue is everything they have paid</p></div></div>
    <div class="tbl-wrap"><table><thead><tr><th>User</th><th>Plan</th><th class="n">Generations</th><th class="n">AI cost</th><th class="n">Lifetime paid</th><th class="n">Margin</th></tr></thead><tbody>
    ${D.costs.byUser.map((x: any) => { const u = userById(x.userId); if (!u) return ''; const m = u.spend - x.cost; return `<tr class="click" data-go="user-${u.id}"><td>${whoCell(u)}</td><td>${esc(u.plan)}</td><td class="n">${int(x.gens)}</td><td class="n">${gbp(x.cost, 3)}</td><td class="n">${gbp(u.spend)}</td><td class="n"><span class="pill ${m < 0 ? 'crit' : 'good'} nodot">${gbp(m)}</span></td></tr>`; }).join('') || '<tr><td colspan="6"><div class="empty">No per-user cost yet.</div></td></tr>'}
    </tbody></table></div></div>` : ''}
  ${t === 'margin' ? P.margin() : ''}
  ${t === 'alerts' ? P.alerts() : ''}`;
};
const STRIPE_FEE = (p: number) => p * 0.015 + 0.20;
P.margin = () => {
  const cpg = S.f.cpg ?? D.costs.avgCostPerGen ?? 0.036;
  const plan = D.plans[0];
  const usedDefault = plan && D.costs.avgUsed != null ? Math.min(D.costs.avgUsed / plan.credits, 1.5) : 0.7;
  const util = S.f.util ?? usedDefault;
  const free = D.settings.ai.free_credits;
  const rows = D.plans.map((p: any) => { const used = D.costs.avgUsed ?? p.credits * util; const ai = used * cpg * 1.08; const m = p.price - STRIPE_FEE(p.price) - ai; return { ...p, used, ai, fee: STRIPE_FEE(p.price), m, mp: p.price ? m / p.price : 0 }; });
  const st = plan || { price: 0, credits: 20, intro: 0 };
  const sm = st.price - STRIPE_FEE(st.price) - st.credits * util * cpg * 1.08, be = st.credits * util ? (st.price - STRIPE_FEE(st.price)) / (st.credits * util * 1.08) : 0;
  return `<section class="grid">
   <div class="card"><div class="card__h"><div><h3>Margin per plan</h3><p>Per subscriber per month · AI cost includes 8% retries · Stripe UK fee 1.5% + 20p · "avg used" is real ledger data for the last 30 days</p></div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Plan</th><th class="n">Price</th><th class="n">Credits</th><th class="n">Avg used</th><th class="n">AI cost</th><th class="n">Stripe fee</th><th class="n">Gross margin</th><th style="min-width:140px">Margin %</th></tr></thead><tbody>
    ${rows.map((r: any) => `<tr><td><b>${esc(r.name)}</b><br><small class="muted">${r.subs} subscribers</small></td><td class="n">${gbp(r.price)}</td><td class="n">${r.credits}</td><td class="n">${r.used.toFixed(1)}</td><td class="n">${gbp(r.ai)}</td><td class="n">${gbp(r.fee)}</td><td class="n"><b>${gbp(r.m)}</b></td><td><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar" style="flex:1"><i class="${r.mp < .5 ? 'warn' : ''}" style="width:${Math.max(0, Math.min(100, r.mp * 100)).toFixed(0)}%"></i></div><span class="mono">${pct(r.mp, 0)}</span></div></td></tr>`).join('')}
    <tr><td><b>Free</b><br><small class="muted">${free} credits on signup</small></td><td class="n">£0.00</td><td class="n">${free}</td><td class="n">${free}</td><td class="n">${gbp(free * cpg)}</td><td class="n">—</td><td class="n"><b>${gbp(-free * cpg)}</b></td><td><span class="mono muted">acquisition cost</span></td></tr>
    </tbody></table></div>
    ${plan && plan.intro != null ? `<p class="sub">Intro price: first month at ${gbp(plan.intro)} leaves ${gbp(plan.intro - STRIPE_FEE(plan.intro) - plan.credits * util * cpg * 1.08)} after Stripe and AI cost on month one (at the utilisation below).</p>` : ''}
   </div>
   <div class="card card--dark"><div class="card__h"><div><h3>Is ${plan ? gbp(plan.price) : '£4.99'} for ${plan ? plan.credits : 20} designs profitable?</h3><p>Move the sliders to test Gemini price changes and heavy users. Starts at your real numbers.</p></div></div>
    <div class="field"><label for="cpg" style="color:#fff">Cost per generation · <span id="cpg-v">${gbp(cpg, 3)}</span></label><input type="range" id="cpg" min="0.005" max="0.12" step="0.001" value="${Math.min(0.12, cpg)}" style="accent-color:#8FE3D4"></div>
    <div class="field"><label for="util" style="color:#fff">Credits used · <span id="util-v">${Math.round(util * 100)}%</span> of ${st.credits}</label><input type="range" id="util" min="0.1" max="1.5" step="0.01" value="${Math.min(1.5, util)}" style="accent-color:#8FE3D4"><small style="color:#BFE0DA">Above 100% means top-up packs on the same plan.</small></div>
    <div class="grid g3" style="gap:10px;align-items:end"><div><div class="kicker" style="color:#8FE3D4">Margin / sub</div><div class="big" id="sm">${gbp(sm)}</div></div><div><div class="kicker" style="color:#8FE3D4">Break-even £ / gen</div><div class="big" id="be">${gbp(be, 3)}</div></div>
    <div class="meter"><div class="bar" style="background:rgba(255,255,255,.15)"><i id="smbar" style="width:${st.price ? Math.max(0, Math.min(100, sm / st.price * 100)).toFixed(0) : 0}%;background:#fff"></i></div><small style="color:#BFE0DA" id="smnote">${st.price ? pct(sm / st.price, 0) : '0%'} of price kept after AI and Stripe</small></div></div>
   </div></section>`;
};
AFTER.costs = () => {
  const t = tab('costs', 'spend');
  if (t === 'spend') {
    const days = lastDays(30);
    barChart('#ch-spend', { labels: days, series: FEATURES.map((f) => ({ name: f.n, color: f.col, values: days.map((d) => +(genDay(dayKey(d))?.[f.c] ?? 0).toFixed(4)) })), fmt: (v: number) => gbp(v, 3), yfmt: (v: number) => '£' + v, xfmt: fDate, tfmt: fDateY, h: 250, limit: D.settings.ai.daily_cap_gbp, limitLabel: 'Daily cap ' + gbp0(D.settings.ai.daily_cap_gbp) });
  }
  if (t === 'margin') {
    const upd = () => {
      S.f.cpg = +$('#cpg').value; S.f.util = +$('#util').value;
      const st = D.plans[0] || { price: 0, credits: 20 }, fee = STRIPE_FEE(st.price);
      const sm = st.price - fee - st.credits * S.f.util * S.f.cpg * 1.08, be = st.credits * S.f.util ? (st.price - fee) / (st.credits * S.f.util * 1.08) : 0;
      $('#cpg-v').textContent = gbp(S.f.cpg, 3); $('#util-v').textContent = Math.round(S.f.util * 100) + '%'; $('#sm').textContent = gbp(sm); $('#be').textContent = gbp(be, 3);
      $('#smbar').style.width = (st.price ? Math.max(0, Math.min(100, sm / st.price * 100)) : 0).toFixed(0) + '%';
      $('#smnote').textContent = (st.price ? pct(sm / st.price, 0) : '0%') + ' of price kept after AI and Stripe';
    };
    $('#cpg').oninput = upd; $('#util').oninput = upd;
  }
};
P.alerts = () => {
  const ai = D.settings.ai;
  const recent = D.audit.filter((a: any) => /^(flag\.|ai\.|settings\.ai|settings\.spend)/.test(a.action)).slice(0, 5);
  const spikeAvg = (() => { const days = lastDays(8).slice(0, 7).map((d) => totalCost(genDay(dayKey(d)))); const avg = sum(days) / 7; return avg; })();
  const spike = spikeAvg > 0 && D.costs.today > spikeAvg * (1 + ai.spike_pct / 100);
  return `<section class="grid g-73">
  <div class="card"><div class="card__h"><div><h3>Daily spend cap</h3><p>Stored in <span class="mono">app_settings.ai</span> · checked before every generation</p></div><span class="pill info nodot">Admins can view, super admins can change</span></div>
   <div class="fgrid">
    <div class="field"><label for="cap">Daily cap</label><div class="inp-group"><span>£</span><input id="cap" type="number" min="0" step="1" value="${ai.daily_cap_gbp}"></div><small>Today so far: ${gbp(D.costs.today, 3)} · 0 turns the cap off</small></div>
    <div class="field"><label for="capact">When the cap is reached</label><select class="inp" id="capact"><option value="demo" ${ai.cap_action === 'demo' ? 'selected' : ''}>Pause the free demo only</option><option value="free" ${ai.cap_action === 'free' ? 'selected' : ''}>Pause demo and free-plan generation</option><option value="all" ${ai.cap_action === 'all' ? 'selected' : ''}>Pause all generation</option></select></div>
    <div class="field"><label for="spike">Spike warning</label><div class="inp-group"><input id="spike" type="number" value="${ai.spike_pct}"><span>% above 7-day avg</span></div><small>Shown here when today's spend passes it${spike ? ' · <b style="color:var(--crit)">it does right now</b>' : ''}</small></div>
    <div class="field"><label for="alertto">Alert contact (note)</label><input class="inp" id="alertto" value="${esc(ai.alert_to)}" placeholder="email or Slack channel"><small>Stored for reference. Emailed alerts need RESEND_API_KEY.</small></div>
   </div>
   <div class="row">${saBtn('Save spend limits', 'saveCaps', '', 'btn-p', 'check')}<span class="sub">Needs typed confirmation</span></div>
   <div class="hr"></div><h4 style="font-size:18px">Recent changes</h4>
   <div>${recent.map((a: any) => `<div class="li"><span class="li__ic ${a.sev === 'crit' ? 'crit' : 'warn'}">${ic('alert')}</span><div class="li__b"><b>${esc(a.action)}</b><small>${fDT(a.at)} · ${esc(a.admin)}${a.reason ? ' · ' + esc(a.reason) : ''}</small></div></div>`).join('') || '<div class="empty">No cap or kill-switch changes yet.</div>'}</div>
  </div>
  <div class="card card--danger"><div class="card__h"><div><h3>Kill switch</h3><p>Stops every Gemini call at once: redesign, cleanup, replace and demo. Users see “Mantha is paused for a few minutes”.</p></div></div>
   <div class="flag ${ai.kill_switch ? 'off' : ''}"><div class="flag__b"><b>${ai.kill_switch ? 'Generation is stopped' : 'Generation is running'}</b><small>${ai.kill_switch ? 'New jobs are refused and no credit is charged' : 'Takes effect within about 10 seconds'}</small></div><button class="sw" role="switch" aria-checked="${!ai.kill_switch}" data-act="kill" aria-label="Generation running"></button></div>
   <div class="callout crit">${ic('alert')}<span>Turning this off stops revenue-generating features for all paying users. Use it for runaway spend or a model incident.</span></div>
  </div></section>`;
};

/* ---------------- 3. BILLING ---------------- */
S.f.subStatus = 'all'; S.f.subView = 'all'; S.f.evt = 'all'; S.f.grantKind = 'grant';
const evFailed = () => D.stripe.events.filter((e: any) => !e.ok);
P.billing = () => {
  const t = tab('billing', 'subs'); const failed = evFailed().length;
  return head('Operations · Stripe', 'Billing <em>control</em>', 'Subscriptions, manual credit changes, webhook health and promo codes. Read live from Stripe and the subscriptions and payments tables.',
    `<a class="btn btn-l" href="https://dashboard.stripe.com" target="_blank" rel="noopener">${ic('ext')}Stripe dashboard</a>`) +
  (D.stripe.error ? `<div class="callout crit">${ic('alert')}<span>Stripe request failed: ${esc(D.stripe.error)}</span></div>` : '') +
  tabs('billing', [['subs', 'Subscriptions', D.subs.length], ['manual', 'Manual actions'], ['hooks', 'Webhook health', failed || null], ['promo', 'Promo codes', D.stripe.promos.filter((p: any) => p.active).length]]) +
  ({ subs: P.subs, manual: P.manual, hooks: P.hooks, promo: P.promo } as any)[t]();
};
P.subs = () => {
  const st = S.f.subStatus, v = S.f.subView;
  let rows = D.subs.filter((s: any) => st === 'all' || s.status === st);
  const soon = (s: any) => s.status === 'active' && s.renew && (s.renew.getTime() - Date.now()) < 7 * 864e5 && s.renew.getTime() > Date.now();
  if (v === 'failed') rows = rows.filter((s: any) => s.status === 'past_due');
  if (v === 'cancel') rows = rows.filter((s: any) => s.status === 'canceled' || s.cancelAtEnd);
  if (v === 'renew') rows = rows.filter(soon).sort((a: any, b: any) => a.renew - b.renew);
  const cnt = (k: string) => D.subs.filter((s: any) => s.status === k).length;
  const renew7 = D.subs.filter(soon);
  const cancelled30 = D.subs.filter((s: any) => s.status === 'canceled').length;
  return `<section class="grid g4">${kpi('Active', cnt('active') + cnt('trialing'), '', '', { note: 'paying now' })}${kpi('Past due', cnt('past_due'), cnt('past_due') ? 'retrying' : '', cnt('past_due') ? 'down' : '', { note: 'Stripe retries automatically' })}${kpi('Cancelled', cancelled30, '', '', { note: 'all time' })}${kpi('Renewing in 7 days', gbp(sum(renew7.map((s: any) => s.amount))), renew7.length + ' subs', 'flat', { note: '' })}</section>
  <div class="card"><div class="toolbar">${seg('subView', [['all', 'All'], ['failed', 'Failed payments'], ['cancel', 'Cancellations'], ['renew', 'Upcoming renewals']], v)}${chips('subStatus', [['all', 'Any status'], ['active', 'Active', cnt('active')], ['trialing', 'Trialing', cnt('trialing')], ['past_due', 'Past due', cnt('past_due')], ['canceled', 'Cancelled', cnt('canceled')]], st)}</div>
   <div class="tbl-wrap"><table><thead><tr><th>Customer</th><th>Plan</th><th>Status</th><th class="n">Amount</th><th>${v === 'cancel' ? 'Access ends' : 'Renews'}</th><th>Actions</th></tr></thead><tbody>
   ${rows.length ? rows.map((s: any) => `<tr><td><a href="#user-${s.userId}" style="text-decoration:none">${whoCell({ name: s.name, email: s.email })}</a></td><td>${esc(s.plan)}${s.cancelAtEnd ? ' <span class="pill warn nodot">cancels</span>' : ''}</td><td>${statusPill(s.status)}</td><td class="n">${gbp(s.amount)}</td><td class="tabnum">${s.renew ? fDate(s.renew) : '—'}</td><td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn btn-l btn-s" data-act="sync" data-id="${s.userId}">${ic('refresh')}Sync</button>${s.cus ? `<a class="btn btn-l btn-s" href="https://dashboard.stripe.com/customers/${s.cus}" target="_blank" rel="noopener">${ic('ext')}Stripe</a>` : ''}${saBtn('Credits', 'grantFor', 'data-id="' + s.userId + '"')}</div></td></tr>`).join('') : '<tr><td colspan="6"><div class="empty">No subscriptions match these filters.</div></td></tr>'}
   </tbody></table></div></div>`;
};
P.manual = () => {
  const users = [...D.users].sort((a: any, b: any) => a.email.localeCompare(b.email)).slice(0, 300);
  const u = userById(S.f.grantUser) || users[0];
  const recent = D.audit.filter((a: any) => /credits|stripe\./.test(a.action)).slice(0, 6);
  const subscribers = D.subs.map((s: any) => userById(s.userId)).filter(Boolean);
  return `<section class="grid g-73">
  <div class="card"><div class="card__h"><div><h3>Grant or remove credits</h3><p>Writes a row to <span class="mono">credit_ledger</span> and to the audit log. A reason is required.</p></div>${seg('grantKind', [['grant', 'Grant'], ['refund', 'Remove']], S.f.grantKind)}</div>
   <div class="fgrid">
    <div class="field"><label for="g-user">User</label><select class="inp" id="g-user">${users.map((x: any) => `<option value="${x.id}" ${x.id === u?.id ? 'selected' : ''}>${esc(x.name)} · ${esc(x.email)}</option>`).join('')}</select></div>
    <div class="field"><label for="g-amt">Credits</label><input class="inp" id="g-amt" type="number" min="1" max="500" value="10"></div>
    <div class="field" style="grid-column:1/-1"><label for="g-reason">Reason (required)</label><select class="inp" id="g-reason"><option value="">Choose a reason…</option><option>Failed generations not auto-refunded</option><option>Goodwill · support ticket</option><option>Duplicate charge</option><option>Influencer / partner credit</option><option>Abuse · clawback</option></select></div>
    <div class="field" style="grid-column:1/-1"><label for="g-note">Note</label><input class="inp" id="g-note" placeholder="Ticket number or context"></div>
   </div>
   <div class="row sb"><span class="sub">Current balance: <b id="g-bal">${u ? u.credits : 0}</b> credits</span>${saBtn(S.f.grantKind === 'grant' ? 'Grant credits' : 'Remove credits', 'doGrant', '', S.f.grantKind === 'grant' ? 'btn-p' : 'btn-x', 'check')}</div>
  </div>
  <div class="stack">
   <div class="card"><div class="card__h"><div><h3>Sync from Stripe</h3><p>Pulls the customer's subscription, payments and credits from Stripe. Safe to repeat: credits are granted once per invoice.</p></div></div>
    <div class="row"><select class="inp" id="s-user" style="flex:1;min-width:180px">${users.map((x: any) => `<option value="${x.id}">${esc(x.name)} · ${esc(x.email)}</option>`).join('')}</select><button class="btn btn-d" data-act="syncSel">${ic('refresh')}Sync now</button></div></div>
   <div class="card"><div class="card__h"><div><h3>Recent manual changes</h3></div><a class="btn btn-l btn-s" href="#audit">Audit log</a></div>
    <div class="tl">${recent.map((a: any) => `<div class="tl__i"><span class="tl__d ${a.sev === 'crit' ? 'crit' : a.sev === 'warn' ? 'warn' : 'good'}"></span><div class="tl__b"><b>${esc(a.action)}</b> · ${esc(a.target)}<small>${esc(a.admin)} · ${ago(a.at)}${a.reason ? ' · ' + esc(a.reason) : ''}</small><span class="diff"><s>${esc(a.before)}</s>→<ins>${esc(a.after)}</ins></span></div></div>`).join('') || '<div class="empty">No manual changes yet.</div>'}</div></div>
  </div></section>`;
};
P.hooks = () => {
  const ev = D.stripe.events, failed = evFailed(), ok = ev.length - failed.length;
  const byType: Record<string, number> = {};
  failed.forEach((e: any) => { byType[e.type] = (byType[e.type] || 0) + 1; });
  const rows = ev.filter((e: any) => S.f.evt === 'all' || (S.f.evt === 'failed' ? !e.ok : e.ok)).slice(0, 60);
  return `<section class="grid g4">${kpi('Delivered · last 100', ev.length ? pct(ok / ev.length) : '—', '', '', { note: ok + ' of ' + ev.length + ' events' })}${kpi('Failed deliveries', failed.length, failed.length ? 'needs a look' : '', failed.length ? 'down' : '', { note: 'from Stripe' })}${kpi('Still retrying', sum(ev.map((e: any) => e.pending || 0)), '', '', { note: 'pending webhooks' })}${kpi('Last event', ev[0] ? ago(ev[0].at) : '—', '', '', { note: ev[0]?.type ?? '' })}</section>
  <section class="grid g-73"><div class="card"><div class="card__h"><div><h3>Events per 4 hours</h3><p>Delivered vs failed · last 48 hours</p></div>${legend([['Delivered', 'var(--s1)'], ['Failed', 'var(--crit)']])}</div><div class="chart" id="ch-hooks"></div></div>
   <div class="card"><div class="card__h"><div><h3>Failures by event type</h3><p>Last 100 events</p></div></div>${failed.length ? hbars(Object.entries(byType), int) : '<div class="empty">No failed deliveries.</div>'}
   <div class="callout">${ic('refresh')}<span>Stripe cannot re-send an event with a new signature, so “Re-sync” reconciles that customer's subscription and credits from Stripe instead. It is idempotent.</span></div></div></section>
  <div class="card"><div class="toolbar"><h3 style="font-size:22px">Stripe events</h3>${chips('evt', [['all', 'All', ev.length], ['failed', 'Failed', failed.length], ['ok', 'Delivered', ok]], S.f.evt)}</div>
   <div class="tbl-wrap"><table><thead><tr><th>Event</th><th>Type</th><th>Status</th><th class="n">Pending</th><th>Received</th><th>Customer</th><th></th></tr></thead><tbody>
   ${rows.map((e: any) => `<tr><td class="mono">${esc(e.id.slice(0, 16))}…</td><td class="mono">${esc(e.type)}</td><td>${statusPill(e.ok ? 'delivered' : 'failed')}</td><td class="n">${e.pending}</td><td class="tabnum">${fDT(e.at)}</td><td class="muted">${esc(e.email || e.customer || '—')}</td><td>${e.ok ? '' : saBtn('Re-sync', 'replay', 'data-id="' + e.id + '"', 'btn-l btn-s', 'refresh')}</td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">No events.</div></td></tr>'}
   </tbody></table></div></div>`;
};
AFTER.billing = () => {
  const t = tab('billing', 'subs');
  if (t === 'hooks') {
    const b = [...Array(12)].map(() => ({ ok: 0, bad: 0 }));
    D.stripe.events.forEach((e: any) => { const h = Math.floor((Date.now() - e.at.getTime()) / 36e5 / 4); if (h >= 0 && h < 12) b[11 - h][e.ok ? 'ok' : 'bad']++; });
    barChart('#ch-hooks', { labels: [...Array(12)].map((_, i) => { const d = new Date(); d.setHours(d.getHours() - (11 - i) * 4); return d; }), series: [{ name: 'Delivered', color: 'var(--s1)', values: b.map((x) => x.ok) }, { name: 'Failed', color: 'var(--crit)', values: b.map((x) => x.bad) }], fmt: int, xfmt: fTime, tfmt: fDT, h: 200, ml: 32 });
  }
  if (t === 'manual') { const sel = $('#g-user'); if (sel) sel.onchange = () => { S.f.grantUser = sel.value; $('#g-bal').textContent = userById(sel.value).credits; }; }
};
P.promo = () => `<section class="grid g-37">
  <div class="card"><div class="card__h"><div><h3>Create promo code</h3><p>Creates a Stripe coupon and promotion code in your live account, then tracks redemptions here.</p></div></div>
   <div class="fgrid"><div class="field"><label for="p-code">Code</label><input class="inp mono" id="p-code" placeholder="SUMMER10" style="text-transform:uppercase"></div>
   <div class="field"><label for="p-owner">Owner / influencer</label><input class="inp" id="p-owner" placeholder="@handle or campaign"></div>
   <div class="field"><label for="p-kind">Type</label><select class="inp" id="p-kind"><option>Influencer</option><option>Affiliate</option><option>Seasonal</option></select></div>
   <div class="field"><label for="p-disc">Discount</label><select class="inp" id="p-disc"><option value="pct">Percent off</option><option value="amt">£ off first payment</option></select></div>
   <div class="field"><label for="p-val">Percent or £ amount</label><input class="inp" id="p-val" type="number" min="1" value="10"></div>
   <div class="field"><label for="p-months">Months (percent only)</label><input class="inp" id="p-months" type="number" min="1" max="12" value="1"></div>
   <div class="field"><label for="p-limit">Redemption limit</label><input class="inp" id="p-limit" type="number" min="0" placeholder="no limit"></div>
   <div class="field"><label for="p-exp">Expires</label><input class="inp" id="p-exp" type="date"></div></div>
   ${saBtn('Create code', 'createPromo', '', 'btn-p', 'plus')}</div>
  <div class="card"><div class="card__h"><div><h3>Codes</h3><p>Read from Stripe. Codes attribute signups through the existing referral flow.</p></div></div>
   <div class="tbl-wrap"><table><thead><tr><th>Code</th><th>Owner</th><th>Offer</th><th style="min-width:130px">Uses</th><th>Expires</th><th>Active</th></tr></thead><tbody>
   ${D.stripe.promos.map((p: any, i: number) => `<tr><td><b class="mono">${esc(p.code)}</b><br><small class="muted">${esc(p.kind)}</small></td><td>${esc(p.owner || '—')}</td><td>${esc(p.off)}</td><td><div class="meter"><div class="meter__top"><b>${p.uses}</b><span>${p.limit ? '/ ' + p.limit : 'no limit'}</span></div><div class="bar"><i class="${p.limit && p.uses >= p.limit ? 'crit' : ''}" style="width:${p.limit ? Math.min(100, p.uses / p.limit * 100) : (p.uses ? 30 : 0)}%"></i></div></div></td><td class="tabnum">${p.expires ? fDateY(p.expires) : '—'}</td><td><button class="sw" role="switch" aria-checked="${p.active}" data-act="promoToggle" data-i="${i}" aria-label="Code active"></button></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No promo codes yet.</div></td></tr>'}
   </tbody></table></div></div></section>`;
