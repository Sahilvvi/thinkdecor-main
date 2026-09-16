import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Loader2, FileText, Search,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { listAll, updatePost, deletePost, type BlogPost } from '@/lib/blog';

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<BlogPost | null>(null);

  const load = () => {
    return listAll().then(setPosts).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (p: BlogPost) => {
    try {
      await updatePost(p.id, { published: !p.published });
      toast.success(p.published ? 'Moved to drafts' : 'Published');
      load();
    } catch (e: unknown) { toast.error((e as Error).message); }
  };

  const remove = async (p: BlogPost) => {
    try {
      await deletePost(p.id);
      setConfirm(null);
      toast.success('Post deleted');
      load();
    } catch (e: unknown) { toast.error((e as Error).message); }
  };

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  const live = posts.filter((p) => p.published).length;

  return (
    <AdminShell>
      <SEO title="Journal admin · ThinkDecor" description="Manage ThinkDecor journal articles." />

      <main className="container mx-auto max-w-[1180px] px-6 py-10">
        {/* heading + stats */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-foreground">Articles</h1>
            <p className="mt-1.5 text-[13.5px] text-foreground/50">
              {posts.length} total · {live} published · {posts.length - live} draft
            </p>
          </div>
          <Link
            to="/admin/blog/new"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
          >
            <Plus className="h-4 w-4" /> New article
          </Link>
        </div>

        {/* search */}
        <div className="mt-7 flex items-center gap-3 rounded-xl border border-foreground/[0.10] bg-foreground/[0.025] px-4 py-3">
          <Search className="h-4 w-4 text-foreground/42" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles…"
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-foreground/38 outline-none"
          />
        </div>

        {/* list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/[0.09]">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] text-foreground/58">
                {posts.length === 0 ? 'No articles yet' : 'Nothing matches that search'}
              </p>
              {posts.length === 0 && (
                <Link to="/admin/blog/new" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground">
                  <Plus className="h-4 w-4" /> Write your first article
                </Link>
              )}
            </div>
          )}

          {!loading && filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-4 border-b border-foreground/[0.07] bg-white/60 px-5 py-4 last:border-0 transition-colors hover:bg-foreground/[0.025]"
            >
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-foreground/[0.09] bg-foreground/[0.025]">
                {p.cover_url
                  ? <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center"><FileText className="h-4 w-4 text-foreground/32" /></div>}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <p className="truncate text-[14.5px] font-medium text-foreground">{p.title}</p>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ${
                    p.published ? 'bg-primary/15 text-primary' : 'bg-foreground/[0.05] text-foreground/50'
                  }`}>
                    {p.published ? 'Live' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-[11.5px] text-foreground/38">/blog/{p.slug}</p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  onClick={() => togglePublish(p)}
                  title={p.published ? 'Unpublish' : 'Publish'}
                  className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/58 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Link
                  to={`/admin/blog/${p.id}`}
                  title="Edit"
                  className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/58 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setConfirm(p)}
                  title="Delete"
                  className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/58 transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* delete confirm */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/38 px-6 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[380px] rounded-2xl border border-foreground/[0.12] bg-white p-6"
            >
              <h3 className="text-[17px] font-semibold text-foreground">Delete this article?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/55">
                “{confirm.title}” will be permanently removed. This can't be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  className="flex-1 rounded-xl border border-foreground/[0.12] py-2.5 text-[14px] text-foreground/70 transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => remove(confirm)}
                  className="flex-1 rounded-xl bg-destructive py-2.5 text-[14px] font-semibold text-foreground transition-opacity hover:opacity-90"
                >
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
