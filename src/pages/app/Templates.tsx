import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { TEMPLATES } from '@/lib/templates';

const ALL = 'All';

export default function Templates() {
  const [tag, setTag] = useState(ALL);
  const [query, setQuery] = useState('');

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    TEMPLATES.forEach((t) => t.tags.forEach((tg) => counts.set(tg, (counts.get(tg) ?? 0) + 1)));
    return [[ALL, TEMPLATES.length] as [string, number], ...Array.from(counts.entries())];
  }, []);

  const visible = TEMPLATES.filter((t) => {
    const matchesTag = tag === ALL || t.tags.includes(tag);
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });

  return (
    <>
      <SEO title="Templates | ThinkDecor" description="Interior styles to start a redesign from." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">{TEMPLATES.length} styles · Curated by Mantha</div>
            <h1>Templates</h1>
            <p className="sub">Start from a style. You can still describe your own changes on top.</p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <Link className="btn btn-line" to="/app/library">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>
              See before &amp; after
            </Link>
          </div>
        </div>

        <div className="toolbar r" style={{ ['--i' as string]: 2 }}>
          <div className="chips">
            {tags.map(([t, count]) => (
              <button key={t} type="button" className={`pchip${tag === t ? ' on' : ''}`} onClick={() => setTag(t)}>
                {t} <span>{count}</span>
              </button>
            ))}
          </div>
          <span className="spacer" />
          <div className="field" style={{ width: 230 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles" />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty r" style={{ ['--i' as string]: 3, marginTop: 20, gridTemplateColumns: '1fr' }}>
            <div style={{ textAlign: 'center' }}>
              <h4>No styles match that search</h4>
              <button type="button" className="btn btn-line" style={{ marginTop: 14 }} onClick={() => { setQuery(''); setTag(ALL); }}>
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid">
            {visible.map((t, i) => (
              <Link key={t.key} className={`tp${i === 0 ? ' hv' : ''} r`} style={{ ['--i' as string]: 3 + i }} to={`/app/create?template=${t.key}`}>
                <div className="pic">
                  <img src={t.image} alt="" />
                  {t.featured && <span className="tagp dark feat">Featured</span>}
                  <span className="fav">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.4-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-2 4.6-9 9-9 9z" /></svg>
                  </span>
                  <span className="use">
                    Use this template
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </div>
                <div className="bd">
                  <h4>{t.label}</h4>
                  <p>{t.description}</p>
                  <div className="tags">
                    {t.tags.map((tg) => <span key={tg} className="tagp">{tg}</span>)}
                  </div>
                </div>
              </Link>
            ))}
            <Link className="own r" style={{ ['--i' as string]: 3 + visible.length }} to="/app/create">
              <div className="ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2M15 10V8M11 6h2M17 6h2M4 20L14 10M18 13v2M18 19v2M16 17h-2M22 17h-2" /></svg>
              </div>
              <h4>Or describe <em>your own</em></h4>
              <p>No template needed. Tell Mantha what you want and it works from your photo.</p>
              <div className="ex">"Dark green walls, oak floor, keep my sofa<span className="caret" />"</div>
              <span className="btn btn-dark" style={{ marginTop: 16 }}>
                Open Create
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
