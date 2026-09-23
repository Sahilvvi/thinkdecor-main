import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, Globe } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Seg } from '@/components/admin/Seg';
import { readinessChecks } from '@/lib/blogReadiness';
import { listAll, updatePost, deletePost, type BlogPost } from '@/lib/blog';

type Filter = 'all' | 'live' | 'drafts';

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : ''));
  const [filter, setFilter] = useState<Filter>('all');
  const [confirm, setConfirm] = useState<BlogPost | null>(null);

  const load = () => listAll().then(setPosts).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        window.location.href = '/admin/blog/new';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const togglePublish = async (p: BlogPost) => {
    try {
      await updatePost(p.id, { published: !p.published });
      toast.success(p.published ? 'Moved to drafts' : 'Published');
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (p: BlogPost) => {
    try {
      await deletePost(p.id);
      setConfirm(null);
      toast.success('Post deleted');
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const live = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);
  const mostRecentDraft = drafts.slice().sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter === 'live' && !p.published) return false;
      if (filter === 'drafts' && p.published) return false;
      if (!term) return true;
      return p.title.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term);
    });
  }, [posts, q, filter]);

  return (
    <AdminShell>
      <SEO title="Journal admin · ThinkDecor" description="Manage ThinkDecor journal articles." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">Content · The journal</div>
            <h1>Articles <em>&amp; stories</em></h1>
            <p className="sub">
              {posts.length} articles<span className="sep" />{live.length} live on thinkdecor.app/blog<span className="sep" />{drafts.length} draft
            </p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <a className="btn btn-line" href="/blog" target="_blank" rel="noreferrer">
              <Globe width={15} height={15} /> Open journal
            </a>
            <Link className="btn btn-dark" to="/admin/blog/new">
              <Plus width={15} height={15} /> New article <kbd>N</kbd>
            </Link>
          </div>
        </div>

        {!loading && mostRecentDraft && (
          <article className="resume r" style={{ ['--i' as string]: 2 }}>
            <figure>
              {mostRecentDraft.cover_url
                ? <img src={mostRecentDraft.cover_url} alt="" />
                : <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.08)' }}><FileText color="#fff" opacity={0.4} /></div>}
            </figure>
            <div className="body">
              <div className="kicker">
                <span>Continue writing</span>
                <span className="chip" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>Draft</span>
              </div>
              <h2>{mostRecentDraft.title || 'Untitled article'}</h2>
              <div className="meta">
                <span><Tag14 /> {mostRecentDraft.tag ?? 'Uncategorised'}</span>
                <span><Clock14 /> About {mostRecentDraft.read_minutes ?? 1} min read</span>
                <span><LinkIcon14 /> <code>/blog/{mostRecentDraft.slug}</code></span>
              </div>
              <div className="foot">
                <div className="progress">
                  <small>
                    <span>Ready to publish</span>
                    <span>{readinessChecks(mostRecentDraft).filter((c) => c.ok).length} of {readinessChecks(mostRecentDraft).length} checks</span>
                  </small>
                  <div><i style={{ width: `${(readinessChecks(mostRecentDraft).filter((c) => c.ok).length / readinessChecks(mostRecentDraft).length) * 100}%` }} /></div>
                </div>
                <span className="spacer" />
                <a className="btn btn-g" href={`/blog/${mostRecentDraft.slug}`} target="_blank" rel="noreferrer">
                  <Eye width={15} height={15} /> Preview
                </a>
                <Link className="btn btn-w" to={`/admin/blog/${mostRecentDraft.id}`}>
                  Continue editing <ArrowRight14 />
                </Link>
              </div>
            </div>
          </article>
        )}

        <div className="toolbar r" style={{ ['--i' as string]: 3 }}>
          <Seg<Filter>
            layoutId="articles-filter"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: posts.length },
              { value: 'live', label: 'Live', count: live.length },
              { value: 'drafts', label: 'Drafts', count: drafts.length },
            ]}
          />
          <span className="spacer" />
          <div className="field" style={{ width: 280 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles and slugs…" />
          </div>
        </div>

        <div className="list-tbl r" style={{ ['--i' as string]: 4 }}>
          <div className="lh">
            <span>ARTICLE</span>
            <span>STATUS</span>
            <span>UPDATED</span>
            <span style={{ textAlign: 'right' }}>ACTIONS</span>
          </div>

          {loading && <div className="px-6 py-16 text-center text-[14px]" style={{ color: 'var(--taupe)' }}>Loading…</div>}

          {!loading && filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto h-8 w-8" style={{ color: 'var(--stone)' }} />
              <p className="mt-4 text-[15px]" style={{ color: 'var(--taupe)' }}>
                {posts.length === 0 ? 'No articles yet' : 'Nothing matches that search'}
              </p>
              {posts.length === 0 && (
                <Link to="/admin/blog/new" className="btn btn-dark mt-6 inline-flex">
                  <Plus width={15} height={15} /> Write your first article
                </Link>
              )}
            </div>
          )}

          {!loading && filtered.map((p) => (
            <div key={p.id} className="row">
              <div className="art">
                <div className={`thumb${p.cover_url ? '' : ' none'}`}>
                  {p.cover_url ? <img src={p.cover_url} alt="" /> : <FileText width={20} height={20} />}
                </div>
                <div className="t">
                  <h4>{p.title}</h4>
                  <code>/blog/{p.slug}</code>
                </div>
              </div>
              <div className="status-cell">
                <span className={`sw${p.published ? ' on' : ''}`} />
                <span className={`chip ${p.published ? 'live' : 'draft'}`}><i />{p.published ? 'Live' : 'Draft'}</span>
              </div>
              <span className="cat">{timeAgo(p.updated_at)}</span>
              <div className="acts">
                <button type="button" className="ico-btn" title={p.published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(p)}>
                  {p.published ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
                </button>
                <Link className="ico-btn" to={`/admin/blog/${p.id}`} title="Edit"><Pencil width={16} height={16} /></Link>
                <button type="button" className="ico-btn danger" title="Delete" onClick={() => setConfirm(p)}><Trash2 width={16} height={16} /></button>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="foot-note r" style={{ ['--i' as string]: 5 }}>
            <span>Showing {filtered.length} of {posts.length}</span>
            <span>Tip: press <kbd style={{ background: 'var(--linen)' }}>N</kbd> anywhere to start a new article</span>
          </div>
        )}
      </section>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-x w-full max-w-[380px] rounded-2xl bg-white p-6"
            >
              <h3 className="font-display text-[19px]" style={{ color: 'var(--char)' }}>Delete this article?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--taupe)' }}>
                "{confirm.title}" will be permanently removed. This can't be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setConfirm(null)} className="btn btn-line flex-1 justify-center">Cancel</button>
                <button type="button" onClick={() => remove(confirm)} className="btn flex-1 justify-center" style={{ background: 'var(--rose)', color: '#fff' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

function Tag14() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.3" /></svg>;
}
function Clock14() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}
function LinkIcon14() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>;
}
function ArrowRight14() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
