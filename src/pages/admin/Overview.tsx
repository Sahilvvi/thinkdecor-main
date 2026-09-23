import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Users, Sparkles, PoundSterling, Ticket, ArrowRight, Inbox, FileText, Check,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Seg } from '@/components/admin/Seg';
import { CountUp } from '@/components/admin/CountUp';
import { useOverviewStats } from '@/lib/admin';
import { useLeadsSummary } from '@/lib/leads';
import { useBlogSummary } from '@/lib/blog';
import { money } from '@/lib/billing';

const KIND_LABEL: Record<string, string> = {
  redesign: 'Mantha redesigns',
  repaint_floor: 'Floor repaints',
  repaint_walls: 'Wall repaints',
  cleanup: 'Cleanups',
  replace: 'Replacements',
};

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
}

const TEMPLATE_SAMPLES = ['/assets/rooms/t-scandi.jpg', '/assets/rooms/t-classic.jpg', '/assets/rooms/t-japandi.jpg'];

export default function Overview() {
  const { data: stats, isLoading, error } = useOverviewStats();
  const { data: leadsSummary } = useLeadsSummary();
  const { data: blogSummary } = useBlogSummary();
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');

  const maxDaily = stats ? Math.max(1, ...stats.dailyViews.map((d) => d.count)) : 1;
  const totalViews = stats?.dailyViews.reduce((s, d) => s + d.count, 0) ?? 0;
  const peakDay = stats?.dailyViews.reduce((best, d) => (d.count > (best?.count ?? -1) ? d : best), stats.dailyViews[0]);
  const genByKind = (stats?.generationsByKind ?? []).slice().sort((a, b) => b.count - a.count);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AdminShell>
      <SEO title="Overview · Admin" description="Traffic, signups and revenue at a glance." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">{today}</div>
            <h1>The week at a <em>glance</em></h1>
            <p className="sub">
              Site traffic, signups and revenue for the last 7 days
              <span className="sep" />
              {isLoading ? 'Loading…' : 'Updated just now'}
            </p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <Seg<'7d' | '30d' | 'all'>
              layoutId="overview-range"
              value={range}
              onChange={setRange}
              options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: 'all', label: 'All time' }]}
            />
          </div>
        </div>

        {!isLoading && error && (
          <div className="mt-8 rounded-2xl px-6 py-10 text-center" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)' }}>
            <p className="text-[14.5px]" style={{ color: 'var(--taupe)' }}>
              Couldn't load stats. If this is a fresh setup, run the <code>admin_panel</code> migration in Supabase.
            </p>
          </div>
        )}

        {stats && (
          <>
            <div className="kpis r" style={{ ['--i' as string]: 2 }}>
              <div className="kpi lead">
                <div className="lab"><Eye width={15} height={15} /> Visitors</div>
                <div className="v"><CountUp value={stats.visitors7d} /></div>
                <div className="n"><b>{stats.pageViews7d}</b> page views</div>
                <svg className="spark" width="96" height="40" viewBox="0 0 96 40" fill="none">
                  <path
                    className="l"
                    d={sparkPath(stats.dailyViews.map((d) => d.count))}
                    stroke="#8FE3D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="kpi">
                <div className="lab"><Users width={15} height={15} /> Signups</div>
                <div className="v"><CountUp value={stats.signupsTotal} /></div>
                <div className="n"><b>+{stats.signups7d}</b> this week</div>
              </div>
              <div className="kpi">
                <div className="lab"><Sparkles width={15} height={15} /> Designs</div>
                <div className="v"><CountUp value={stats.generationsTotal} /></div>
                <div className="n">{stats.activeSubscriptions} active plans</div>
              </div>
              <div className="kpi">
                <div className="lab"><PoundSterling width={15} height={15} /> Revenue</div>
                <div className="v">{money(stats.revenuePenceTotal / 100)}</div>
                <div className="n">All-time, paid</div>
              </div>
              <div className="kpi">
                <div className="lab"><Ticket width={15} height={15} /> Open queries</div>
                <div className="v"><CountUp value={stats.openTickets} /></div>
                <div className="n">{stats.openTickets ? 'Awaiting a reply' : 'Inbox is clear'}</div>
              </div>
            </div>

            <div className="row2">
              <div className="card r" style={{ ['--i' as string]: 3 }}>
                <div className="card-h">
                  <h3>Page views</h3>
                  <span className="tagp">Last 7 days</span>
                  <a className="more" href="#views">Full report <ArrowRight width={13} height={13} /></a>
                </div>
                <div className="chart">
                  <div className="sum">
                    <b>{totalViews}</b>
                    <span>views{peakDay?.count ? ` · almost all on ${dayLabel(peakDay.day)}` : ''}</span>
                  </div>
                  <div className="bars">
                    <div className="gl" style={{ bottom: '33%' }}><span>{Math.round(maxDaily * 0.33)}</span></div>
                    <div className="gl" style={{ bottom: '66%' }}><span>{Math.round(maxDaily * 0.66)}</span></div>
                    {stats.dailyViews.map((d, i) => {
                      const isPeak = peakDay && d.day === peakDay.day && d.count > 0;
                      const pct = Math.max(3, (d.count / maxDaily) * 100);
                      return (
                        <div
                          key={d.day}
                          className={`bar${isPeak ? ' hi' : d.count === 0 ? ' z' : ''}`}
                          style={{ ['--h' as string]: d.count === 0 ? '3px' : `${pct}%`, ['--d' as string]: i }}
                        >
                          {isPeak && <span className="tip">{dayLabel(d.day)} · ~{d.count} views</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="days">
                    {stats.dailyViews.map((d) => (
                      <span key={d.day} className={peakDay?.day === d.day ? 't' : ''}>{dayLabel(d.day)}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card r" style={{ ['--i' as string]: 4 }}>
                <div className="card-h"><h3>Designs by type</h3></div>
                {genByKind.length === 0 ? (
                  <div className="empty">
                    <div className="stack">
                      {TEMPLATE_SAMPLES.map((src) => <figure key={src}><img src={src} alt="" /></figure>)}
                    </div>
                    <h4>No generations yet</h4>
                    <p>Redesigns, cleanups and replacements show up here once members start designing.</p>
                    <div className="types">
                      <div>Redesign<b>0</b></div>
                      <div>Cleanup<b>0</b></div>
                      <div>Replace<b>0</b></div>
                    </div>
                  </div>
                ) : (
                  <div className="empty" style={{ justifyContent: 'center', gap: 14 }}>
                    {genByKind.map((k) => {
                      const max = genByKind[0].count || 1;
                      return (
                        <div key={k.kind}>
                          <div className="flex items-center justify-between text-[12.5px]" style={{ color: 'var(--taupe)' }}>
                            <span>{KIND_LABEL[k.kind] ?? k.kind}</span>
                            <span style={{ color: 'var(--char)', fontWeight: 600 }}>{k.count}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--stone-2)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(k.count / max) * 100}%`, background: 'var(--brass)', transition: 'width .6s var(--ease)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="row3">
              <div className="card r" style={{ ['--i' as string]: 5 }}>
                <div className="card-h">
                  <h3>Latest signups</h3>
                  <span className="tagp">{stats.signupsTotal} total</span>
                  <Link className="more" to="/admin/accounts">All accounts <ArrowRight width={13} height={13} /></Link>
                </div>
                <div className="people">
                  {stats.signupsTotal === 0 && <p className="px-3 py-6 text-[13px]" style={{ color: 'var(--taupe)' }}>No signups yet.</p>}
                  {/* Overview's own stats query doesn't carry per-user rows — Accounts is the source of truth for the list. */}
                  <Link to="/admin/accounts" className="person">
                    <div className="av s l">→</div>
                    <div>
                      <div className="nm">See the full list</div>
                      <div className="em">Names, emails and admin roles</div>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="card r" style={{ ['--i' as string]: 6 }}>
                <div className="card-h">
                  <h3>Needs your attention</h3>
                </div>
                <div className="todo">
                  <Link className="task" to="/admin/leads">
                    <div className={`ic${leadsSummary?.unread ? ' hot' : ''}`}><Inbox width={18} height={18} /></div>
                    <div>
                      <b>{leadsSummary?.unread ? `${leadsSummary.unread} new lead${leadsSummary.unread === 1 ? '' : 's'} unread` : 'Leads inbox clear'}</b>
                      <span>{leadsSummary?.total ?? 0} total enquiries</span>
                    </div>
                    <span className="go"><ArrowRight width={16} height={16} /></span>
                  </Link>
                  <Link className="task" to="/admin/blog">
                    <div className="ic"><FileText width={18} height={18} /></div>
                    <div>
                      <b>{blogSummary?.total ?? 0} articles in the journal</b>
                      <span>Manage drafts and live posts</span>
                    </div>
                    <span className="go"><ArrowRight width={16} height={16} /></span>
                  </Link>
                  <Link className={`task${!stats.openTickets ? ' done' : ''}`} to="/admin/support">
                    <div className="ic"><Check width={18} height={18} /></div>
                    <div>
                      <b>{stats.openTickets ? `${stats.openTickets} open support ${stats.openTickets === 1 ? 'ticket' : 'tickets'}` : 'Support inbox clear'}</b>
                      <span>{stats.openTickets ? 'Waiting on you' : 'Nothing waiting'}</span>
                    </div>
                    <span className="go"><ArrowRight width={16} height={16} /></span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}

/** A tiny 96×40 sparkline from the last 7 days of page views. */
function sparkPath(counts: number[]) {
  const max = Math.max(1, ...counts);
  const step = 96 / Math.max(1, counts.length - 1);
  const points = counts.map((c, i) => [i * step, 36 - (c / max) * 32]);
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}
