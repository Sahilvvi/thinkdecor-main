// @ts-nocheck
/* Core helpers for the super admin panel: DOM helpers, formatters, icons, SVG charts, toasts, modal, shared state.
   Ported from the design prototype so the look, motion and behaviour match it exactly. */

export let ROOT: HTMLElement | Document = document;
export const setRoot = (el: HTMLElement) => { ROOT = el; };
export const $ = (s: string, r: any = ROOT) => r.querySelector(s);
export const $$ = (s: string, r: any = ROOT) => [...r.querySelectorAll(s)];
export const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]);
export const gbp = (n: number, d = 2) => (n < 0 ? '−' : '') + '£' + Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
export const gbp0 = (n: number) => gbp(n, 0);
export const int = (n: number) => Math.round(n).toLocaleString('en-GB');
export const pct = (n: number, d = 1) => (n * 100).toFixed(d) + '%';
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const NOW = () => new Date();
export const D0 = (x: any) => (x instanceof Date ? x : new Date(x));
export const fDate = (d: any) => D0(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const fDateY = (d: any) => D0(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fTime = (d: any) => D0(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
export const fDT = (d: any) => (d ? fDate(d) + ', ' + fTime(d) : '—');
export const ago = (d: any) => { if (!d) return '—'; const m = Math.round((Date.now() - D0(d).getTime()) / 6e4); if (m < 1) return 'just now'; if (m < 60) return m + 'm ago'; const h = Math.round(m / 60); if (h < 24) return h + 'h ago'; return Math.round(h / 24) + 'd ago'; };
export const initials = (n: string) => (n || '?').split(/[\s@.]+/).filter(Boolean).map((x) => x[0]).slice(0, 2).join('').toUpperCase();

/* ---------- icons (stroke) ---------- */
export const IC: any = {
 dash:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.9 0-3 .9-3 2.1 0 2.9 6 1.4 6 4.3 0 1.2-1.2 2.1-3 2.1-1.5 0-2.6-.6-3.1-1.6M12 6v2M12 16v2"/>',
 card:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6 15h4"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
 spark:'<path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.5l-1.8-5L5 9.7l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
 toggle:'<rect x="2.5" y="6.5" width="19" height="11" rx="5.5"/><circle cx="16" cy="12" r="3"/>',
 growth:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 log:'<path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
 server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 bell:'<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 lock:'<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 refresh:'<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5M20 3.5v5h-5"/>',
 eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 down:'<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 pause:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
 play:'<path d="M7 4.5v15l12-7.5z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3.5 7l8.5 6 8.5-6"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 phone:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
 up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 chev:'<path d="M9 6l6 6-6 6"/>',
 back:'<path d="M15 6l-6 6 6 6"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 db:'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 gift:'<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3.5 8 4.5 9 8 12 8zm0 0s1.5-4.5 4-3.5S15 8 12 8z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>'
};
export const ic=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;

/* ---------- charts + small view helpers ---------- */
/* ---------- charts ---------- */
export const CH=[];
export function nice(max,n=4,min=0){const span=Math.max(max-min,1e-9);const raw=span/n;const mag=Math.pow(10,Math.floor(Math.log10(raw)));const f=raw/mag;const step=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*mag;const top=Math.ceil(max/step)*step;const bot=Math.floor(min/step)*step;const t=[];for(let v=bot;v<=top+step*1e-6;v+=step)t.push(+v.toFixed(8));return{top,bot,ticks:t}}
export function tipHTML(title,rows){return `<b>${esc(title)}</b>`+rows.map(r=>`<div><span>${r[2]?`<i style="background:${r[2]}"></i>`:''}${esc(r[0])}</span><em>${esc(r[1])}</em></div>`).join('')}
export function mount(el,draw){if(typeof el==='string')el=$(el);if(!el)return;const d=()=>{if(!el.isConnected)return;draw(el,Math.max(260,el.clientWidth))};CH.push(d);d()}
export function setTip(el,x,y,html){let t=el.querySelector('.tip');if(!t){t=document.createElement('div');t.className='tip';el.append(t)}t.innerHTML=html;const W=el.clientWidth;const tw=t.offsetWidth||160;const cx=Math.min(Math.max(x,tw/2+4),W-tw/2-4);t.style.left=cx+'px';t.style.top=y+'px';t.classList.add('on')}
export function hideTip(el){const t=el.querySelector('.tip');t&&t.classList.remove('on')}
export function xLabelIdx(n,maxLabels){if(n<=8)return[...Array(n).keys()];const step=Math.max(1,Math.ceil(n/maxLabels));const out=[];for(let i=n-1;i>=0;i-=step)out.push(i);return out}

/* line / area chart. o={labels, series:[{name,color,values}], fmt, h, area, yfmt, band:[lo,hi] } */
export function lineChart(sel,o){mount(sel,(el,W)=>{
  const H=o.h||220,m={t:14,r:14,b:26,l:o.ml||48},iw=W-m.l-m.r,ih=H-m.t-m.b,n=o.labels.length;
  const all=o.series.flatMap(s=>s.values);const {top,ticks}=nice(Math.max(...all)*1.05,4,0);
  const x=i=>m.l+(n===1?iw/2:i*iw/(n-1)),y=v=>m.t+ih-(v/top)*ih;const yf=o.yfmt||o.fmt||(v=>v);
  let g=ticks.map(t=>`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${m.l-8}" y="${y(t)+4}" text-anchor="end">${esc(yf(t))}</text>`).join('');
  g+=`<line class="base" x1="${m.l}" x2="${W-m.r}" y1="${y(0)}" y2="${y(0)}"/>`;
  g+=xLabelIdx(n,Math.max(3,Math.floor(iw/80))).map(i=>`<text x="${x(i)}" y="${H-6}" text-anchor="middle">${esc(o.xfmt?o.xfmt(o.labels[i]):o.labels[i])}</text>`).join('');
  if(o.limit){g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y(o.limit)}" y2="${y(o.limit)}" style="stroke:var(--crit);stroke-width:1.5" stroke-dasharray="5 4"/><text x="${W-m.r}" y="${y(o.limit)-6}" text-anchor="end" style="fill:var(--crit)">${esc(o.limitLabel||'limit')}</text>`}
  const uid='g'+Math.random().toString(36).slice(2,7);
  o.series.forEach((s,si)=>{const pts=s.values.map((v,i)=>[x(i),y(v)]);const d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L');
    if(o.area!==false&&si===0){g+=`<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${s.color};stop-opacity:.22"/><stop offset="1" style="stop-color:${s.color};stop-opacity:0"/></linearGradient></defs><path d="${d}L${x(n-1)} ${y(0)}L${x(0)} ${y(0)}Z" style="fill:url(#${uid})"/>`}
    g+=`<path d="${d}" style="fill:none;stroke:${s.color};stroke-width:2;stroke-linejoin:round;stroke-linecap:round;${s.dash?'stroke-dasharray:4 4':''}"/>`;
    const L=pts[n-1];g+=`<circle cx="${L[0]}" cy="${L[1]}" r="4" style="fill:${s.color};stroke:var(--paper);stroke-width:2"/>`});
  g+=`<g class="hov" style="opacity:0"><line class="xh" y1="${m.t}" y2="${m.t+ih}" style="stroke:var(--axis);stroke-width:1" stroke-dasharray="3 3"/>${o.series.map(s=>`<circle r="4.5" style="fill:${s.color};stroke:var(--paper);stroke-width:2"/>`).join('')}</g>`;
  g+=`<rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" style="fill:transparent" class="hit"/>`;
  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'')}">${g}</svg>`;
  const svg=el.querySelector('svg'),hov=svg.querySelector('.hov'),hit=svg.querySelector('.hit');
  hit.addEventListener('mousemove',e=>{const r=svg.getBoundingClientRect();const px=e.clientX-r.left;const i=Math.max(0,Math.min(n-1,Math.round((px-m.l)/iw*(n-1))));hov.style.opacity=1;hov.querySelector('.xh').setAttribute('x1',x(i));hov.querySelector('.xh').setAttribute('x2',x(i));
    hov.querySelectorAll('circle').forEach((c,si)=>{c.setAttribute('cx',x(i));c.setAttribute('cy',y(o.series[si].values[i]))});
    setTip(el,x(i),Math.min(...o.series.map(s=>y(s.values[i]))),tipHTML(o.tfmt?o.tfmt(o.labels[i]):o.labels[i],o.series.map(s=>[s.name,(o.fmt||String)(s.values[i]),s.color])))});
  hit.addEventListener('mouseleave',()=>{hov.style.opacity=0;hideTip(el)});
})}

/* stacked / single bar chart. o={labels, series:[{name,color,values}], fmt, h} */
export function barChart(sel,o){mount(sel,(el,W)=>{
  const H=o.h||220,m={t:14,r:10,b:26,l:o.ml||48},iw=W-m.l-m.r,ih=H-m.t-m.b,n=o.labels.length;
  const tot=o.labels.map((_,i)=>sum(o.series.map(s=>s.values[i])));const {top,ticks}=nice(Math.max(...tot)*1.05,4,0);
  const bw=iw/n,w=Math.max(2,Math.min(38,bw*(n>40?.72:.6))),y=v=>m.t+ih-(v/top)*ih;const yf=o.yfmt||o.fmt||(v=>v);
  let g=ticks.map(t=>`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${m.l-8}" y="${y(t)+4}" text-anchor="end">${esc(yf(t))}</text>`).join('');
  if(o.limit){g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y(o.limit)}" y2="${y(o.limit)}" style="stroke:var(--crit);stroke-width:1.5" stroke-dasharray="5 4"/><text x="${W-m.r}" y="${y(o.limit)-6}" text-anchor="end" style="fill:var(--crit)">${esc(o.limitLabel||'')}</text>`}
  g+=`<rect class="bandhl" y="${m.t}" height="${ih}" width="${bw}" style="fill:var(--tint-2);opacity:0" rx="6"/>`;
  for(let i=0;i<n;i++){const cx=m.l+bw*i+bw/2;let acc=0;const segs=o.series.map(s=>s.values[i]);
    segs.forEach((v,si)=>{if(v<=0)return;const y0=y(acc),y1=y(acc+v);acc+=v;const isTop=o.series.slice(si+1).every(s=>s.values[i]<=0);const gap=si>0?2:0;const hh=Math.max(0,y0-y1-gap);const xx=cx-w/2,yy=y1;const r=isTop?Math.min(4,w/2,hh):0;
      g+=`<path d="M${xx} ${yy+hh}V${yy+r}${r?`Q${xx} ${yy} ${xx+r} ${yy}`:''}H${xx+w-r}${r?`Q${xx+w} ${yy} ${xx+w} ${yy+r}`:''}V${yy+hh}Z" style="fill:${o.series[si].color}${o.hl&&o.hl(i)?';opacity:1':o.hl?';opacity:.55':''}"/>`})}
  g+=`<line class="base" x1="${m.l}" x2="${W-m.r}" y1="${y(0)}" y2="${y(0)}"/>`;
  g+=xLabelIdx(n,Math.max(3,Math.floor(iw/70))).map(i=>`<text x="${m.l+bw*i+bw/2}" y="${H-6}" text-anchor="middle">${esc(o.xfmt?o.xfmt(o.labels[i]):o.labels[i])}</text>`).join('');
  g+=`<rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" style="fill:transparent" class="hit"/>`;
  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'')}">${g}</svg>`;
  const svg=el.querySelector('svg'),hl=svg.querySelector('.bandhl'),hit=svg.querySelector('.hit');
  hit.addEventListener('mousemove',e=>{const r=svg.getBoundingClientRect();const i=Math.max(0,Math.min(n-1,Math.floor((e.clientX-r.left-m.l)/bw)));hl.setAttribute('x',m.l+bw*i);hl.style.opacity=1;
    const rows=o.series.map(s=>[s.name,(o.fmt||String)(s.values[i]),s.color]);if(o.series.length>1)rows.push(['Total',(o.fmt||String)(tot[i]),'']);
    setTip(el,m.l+bw*i+bw/2,y(tot[i]),tipHTML(o.tfmt?o.tfmt(o.labels[i]):o.labels[i],rows))});
  hit.addEventListener('mouseleave',()=>{hl.style.opacity=0;hideTip(el)});
})}

/* diverging bars: pos above, neg below baseline */
export function divChart(sel,o){mount(sel,(el,W)=>{
  const H=o.h||220,m={t:12,r:10,b:26,l:40},iw=W-m.l-m.r,ih=H-m.t-m.b,n=o.labels.length;
  const mx=Math.max(...o.pos.values),mn=Math.max(...o.neg.values);const s=nice(mx*1.1,3,-mn*1.1);const top=s.top,bot=s.bot;
  const y=v=>m.t+(top-v)/(top-bot)*ih,bw=iw/n,w=Math.min(26,bw*.56);
  let g=s.ticks.map(t=>`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${m.l-8}" y="${y(t)+4}" text-anchor="end">${Math.abs(t)}</text>`).join('');
  g+=`<rect class="bandhl" y="${m.t}" height="${ih}" width="${bw}" style="fill:var(--tint-2);opacity:0" rx="6"/>`;
  for(let i=0;i<n;i++){const cx=m.l+bw*i+bw/2-w/2;const p=o.pos.values[i],q=o.neg.values[i];const y0=y(0),yp=y(p),yn=y(-q),r=4;
    g+=`<path d="M${cx} ${y0-1}V${yp+r}Q${cx} ${yp} ${cx+r} ${yp}H${cx+w-r}Q${cx+w} ${yp} ${cx+w} ${yp+r}V${y0-1}Z" style="fill:${o.pos.color}"/>`;
    g+=`<path d="M${cx} ${y0+1}V${yn-r}Q${cx} ${yn} ${cx+r} ${yn}H${cx+w-r}Q${cx+w} ${yn} ${cx+w} ${yn-r}V${y0+1}Z" style="fill:${o.neg.color}"/>`}
  g+=`<line class="base" x1="${m.l}" x2="${W-m.r}" y1="${y(0)}" y2="${y(0)}"/>`;
  g+=xLabelIdx(n,Math.max(3,Math.floor(iw/70))).map(i=>`<text x="${m.l+bw*i+bw/2}" y="${H-6}" text-anchor="middle">${esc(o.labels[i])}</text>`).join('');
  g+=`<rect x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" style="fill:transparent" class="hit"/>`;
  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
  const svg=el.querySelector('svg'),hl=svg.querySelector('.bandhl'),hit=svg.querySelector('.hit');
  hit.addEventListener('mousemove',e=>{const r=svg.getBoundingClientRect();const i=Math.max(0,Math.min(n-1,Math.floor((e.clientX-r.left-m.l)/bw)));hl.setAttribute('x',m.l+bw*i);hl.style.opacity=1;
    setTip(el,m.l+bw*i+bw/2,y(o.pos.values[i]),tipHTML('Week of '+o.labels[i],[[o.pos.name,o.pos.values[i],o.pos.color],[o.neg.name,o.neg.values[i],o.neg.color],['Net','+'+(o.pos.values[i]-o.neg.values[i]),'']]))});
  hit.addEventListener('mouseleave',()=>{hl.style.opacity=0;hideTip(el)});
})}

export function spark(vals,color='var(--s1)',h=34){const W=200,n=vals.length,mx=Math.max(...vals),mn=Math.min(...vals),y=v=>h-3-(v-mn)/((mx-mn)||1)*(h-8),x=i=>i*(W-4)/(n-1)+2;const d='M'+vals.map((v,i)=>x(i).toFixed(1)+' '+y(v).toFixed(1)).join('L');const id='sp'+Math.random().toString(36).slice(2,7);
  return `<svg class="spark" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${color};stop-opacity:.25"/><stop offset="1" style="stop-color:${color};stop-opacity:0"/></linearGradient></defs><path d="${d}L${x(n-1)} ${h}L2 ${h}Z" style="fill:url(#${id})"/><path d="${d}" style="fill:none;stroke:${color};stroke-width:2" vector-effect="non-scaling-stroke"/></svg>`}
export function legend(items,line=false){return `<div class="legend">${items.map(i=>`<span><i class="${line?'ln':''}" style="background:${i[1]}"></i>${esc(i[0])}</span>`).join('')}</div>`}
export function hbars(items,fmt=int,max){const mx=max||Math.max(...items.map(i=>i[1]));return `<div class="stack">${items.map(i=>`<div class="hbar"><span>${esc(i[0])}</span><div class="bar"><i style="width:${(i[1]/mx*100).toFixed(1)}%"></i></div><span class="v">${fmt(i[1])}</span></div>`).join('')}</div>`}
export function kpi(label,value,delta,dir,sp,hero=false,extra=''){return `<div class="kpi${hero?' kpi--hero':''}"><div class="kpi__l"><span>${label}</span>${extra}</div><div class="kpi__v">${value}</div><div class="kpi__d">${delta?`<span class="delta ${dir}">${dir==='up'?'▲':dir==='down'?'▼':'■'} ${delta}</span>`:''}<span>${sp&&sp.note||''}</span></div>${sp&&sp.v?spark(sp.v,hero?'#FFFFFF':sp.c||'var(--s1)'):''}</div>`}
export function statusPill(s){const map={active:'good',trialing:'info',past_due:'warn',canceled:'mute',free:'mute',succeeded:'good',failed:'crit',running:'info',suspended:'crit',delivered:'good'};return `<span class="pill ${map[s]||''}">${esc(s.replace('_',' '))}</span>`}
export function whoCell(u){return `<div class="who"><span class="av">${esc(initials(u.name))}</span><span><b>${esc(u.name)}</b><small>${esc(u.email)}</small></span></div>`}
export function saBtn(label,act,attrs='',cls='btn-l btn-s',icon=''){const off=!isSA();return `<button class="btn ${cls} sa-only" data-act="${act}" ${attrs} ${off?'aria-disabled="true" title="Super admin only"':''}>${icon?ic(icon):''}${off?ic('lock','lock'):''}${esc(label)}</button>`}

/* ---------- shared state ---------- */
import { supabase } from '@/integrations/supabase/client';

export const S: any = {
  roleView: 'super_admin', // what the panel is previewing (a super admin can preview the admin view)
  range: 30,
  tab: {} as Record<string, string>,
  f: {} as Record<string, any>,
  impersonating: null as any,
  detail: {} as Record<string, any>,
  locked: false,
  idleLeft: 30 * 60,
  loading: true,
  error: null as any,
};
export const D: any = {}; // real data from the super-admin edge function
export const hooks: { render: () => void; refresh: (quiet?: boolean) => Promise<void> } = { render: () => {}, refresh: async () => {} };

/** The role that is really in effect: a super admin previewing "Admin view" behaves as admin. */
export const isSA = () => D.me?.role === 'super_admin' && S.roleView === 'super_admin';

/* ---------- server calls ---------- */
export class ApiError extends Error {
  code: string;
  constructor(message: string, code = 'error') { super(message); this.code = code; }
}
export async function api(action: string, params: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke('super-admin', { body: { action, ...params } });
  if (error) {
    let payload: any = null;
    try { payload = await (error as any).context?.json(); } catch { /* not json */ }
    throw new ApiError(payload?.error ?? error.message ?? 'Request failed', payload?.code ?? 'error');
  }
  if (data?.error) throw new ApiError(data.error, data.code);
  return data;
}

/** Turns the ISO strings from the server into what the templates expect. */
function hydrate(d: any) {
  d.users.forEach((u: any) => { u.signup = new Date(u.signup); u.last = new Date(u.last); });
  d.audit.forEach((a: any) => { a.at = new Date(a.at); });
  d.gens.forEach((g: any) => { g.at = new Date(g.at); });
  d.stripe.events.forEach((e: any) => { e.at = new Date(e.at); });
  d.subs.forEach((s: any) => { s.renew = s.renew ? new Date(s.renew) : null; });
  return d;
}

let lastSig = '';
/** Loads everything. Returns true if anything changed since the last load. */
export async function pull(): Promise<boolean> {
  const data = await api('pull');
  const sig = JSON.stringify(data, (k, v) => (k === 'now' ? undefined : v));
  const changed = sig !== lastSig;
  lastSig = sig;
  Object.keys(D).forEach((k) => delete D[k]);
  Object.assign(D, hydrate(data));
  D.byId = new Map(D.users.map((u: any) => [u.id, u]));
  S.loading = false;
  S.error = null;
  return changed;
}
export const userById = (id: string) => D.byId?.get(id);

/* ---------- toasts ---------- */
export function toast(msg: string, sub = '', bad = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (bad ? ' bad' : '');
  t.innerHTML = `<i>${bad ? '!' : '✓'}</i><div>${esc(msg)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  $('#toasts')?.append(t);
  setTimeout(() => t.remove(), 4600);
}
export const fail = (e: any) => toast(e?.message ?? 'Something went wrong', e?.code === 'super_only' ? 'Your role is admin. Ask a super admin.' : '', true);

/* ---------- modal with typed confirmation ---------- */
export function closeModal() { const m = $('#modal'); if (m) { m.hidden = true; m.innerHTML = ''; } }
export function openModal(html: string) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  const f = m.querySelector('input,textarea,select,button.btn-x,button.btn-p');
  f && f.focus();
}
export function denied() { toast('Super admin only', 'Your role is admin. Nothing was changed.', true); }

/* o: { title, body, word, action, target, changes:[[label,before,after]], reason (bool), danger, okLabel, run(reason), done } */
export function confirmDanger(o: any) {
  if (o.sa !== false && !isSA()) { denied(); return; }
  const word = o.word || 'CONFIRM';
  openModal(`<div class="modal__ic" style="${o.danger === false ? 'background:var(--tint);color:var(--char)' : ''}">${ic(o.icon || 'alert')}</div>
   <h3>${esc(o.title)}</h3><p>${o.body || ''}</p>
   ${o.changes ? `<div class="chg">${o.changes.map((c: any) => `<div><span>${esc(c[0])}</span><span class="diff"><s>${esc(c[1])}</s>→<ins>${esc(c[2])}</ins></span></div>`).join('')}</div>` : ''}
   ${o.reason !== false ? `<div class="field"><label for="m-reason">Reason (saved to the audit log)</label><input class="inp" id="m-reason" placeholder="e.g. Ticket from a customer, duplicate charge"></div>` : ''}
   <div class="field"><label for="m-word">Type <span class="typed" style="display:inline;padding:2px 6px">${esc(word)}</span> to confirm</label><input class="inp" id="m-word" autocomplete="off" spellcheck="false"></div>
   <div class="modal__act"><button class="btn btn-l" data-m="cancel">Cancel</button><button class="btn ${o.danger === false ? 'btn-p' : 'btn-x'}" data-m="ok" disabled>${esc(o.okLabel || 'Confirm')}</button></div>
   <small class="sub">Writes to audit_log: action <b class="mono">${esc(o.action)}</b> · who, what, when, before → after.</small>`);
  const w = $('#m-word'), ok = $('[data-m="ok"]'), rs = $('#m-reason');
  const check = () => { ok.disabled = !(w.value.trim() === word && (!rs || !o.reasonRequired || rs.value.trim().length > 2)); };
  w.addEventListener('input', check);
  rs && rs.addEventListener('input', check);
  $('[data-m="cancel"]').onclick = closeModal;
  ok.onclick = async () => {
    ok.disabled = true; ok.textContent = 'Working…';
    try {
      await o.run(rs ? rs.value.trim() : '');
      closeModal();
      toast(o.done || 'Done', `Logged as ${o.action}`);
      await hooks.refresh(true);
    } catch (e) {
      closeModal();
      fail(e);
    }
  };
}

/* ---------- downloads ---------- */
export function download(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
