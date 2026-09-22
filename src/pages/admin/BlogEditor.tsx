import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { uploadImage, UploadError } from '@/lib/upload';
import { ArrowLeft, Loader2, Save, Eye, Send, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { useAuthStore } from '@/stores/authStore';
import {
  createPost, updatePost, listAll, slugify, readingTime, renderMarkdown, postBodyClassName,
  type BlogPost, type BlogPostLayout,
} from '@/lib/blog';

const TAGS = ['Product', 'Engineering', 'Design', 'Company', 'Guides'];

const PROSE_WIDTHS: { value: NonNullable<BlogPostLayout['proseWidth']>; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
];
const RHYTHMS: { value: NonNullable<BlogPostLayout['rhythm']>; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
];
const IMAGE_STYLES: { value: NonNullable<BlogPostLayout['imageStyle']>; label: string }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'full', label: 'Full-bleed' },
];

const STARTER = `Write your article here.

## A section heading

Use **bold**, *italic*, \`code\` and [links](https://thinkdecor.app).

- A bullet point
- Another point

> A pull quote that stands out.

![Caption](https://example.com/image.jpg)
`;

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const nav = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const coverInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState<null | 'cover' | 'body'>(null);

  const handleUpload = async (file: File | undefined, target: 'cover' | 'body') => {
    if (!file) return;
    setUploading(target);
    try {
      const url = await uploadImage(file);
      if (target === 'cover') {
        setCover(url);
        toast.success('Cover image uploaded');
      } else {
        // Insert at the caret so the image lands where the writer is typing,
        // not appended to the bottom of the article.
        const ta = contentRef.current;
        const snippet = `\n\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n\n`;
        if (ta) {
          const at = ta.selectionStart ?? content.length;
          setContent(content.slice(0, at) + snippet + content.slice(at));
        } else {
          setContent(content + snippet);
        }
        toast.success('Image inserted');
      }
    } catch (e) {
      toast.error(e instanceof UploadError ? e.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [cover, setCover] = useState('');
  const [tag, setTag] = useState('Product');
  const [content, setContent] = useState(STARTER);
  const [published, setPublished] = useState(false);
  const [layout, setLayout] = useState<BlogPostLayout>({});

  useEffect(() => {
    if (isNew) return;

    listAll()
      .then((all) => {
        const p = all.find((x) => x.id === id);
        if (!p) { toast.error('Article not found'); nav('/admin/blog'); return; }
        setTitle(p.title); setSlug(p.slug); setSlugTouched(true);
        setExcerpt(p.excerpt ?? ''); setCover(p.cover_url ?? '');
        setTag(p.tag ?? 'Product'); setContent(p.content || ''); setPublished(p.published);
        setLayout(p.layout ?? {});
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew, nav]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const save = async (publish?: boolean) => {
    if (!title.trim()) { toast.error('Give the article a title'); return; }
    const willPublish = publish ?? published;
    setBusy(true);
    const payload: Partial<BlogPost> = {
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt: excerpt.trim() || null,
      cover_url: cover.trim() || null,
      tag,
      content,
      read_minutes: readingTime(content),
      author_name: user?.user_metadata?.name || 'ThinkDecor',
      published: willPublish,
      layout,
    };
    try {
      if (isNew) {
        const created = await createPost(payload);
        toast.success(willPublish ? 'Article published' : 'Draft saved');
        nav(`/admin/blog/${created.id}`, { replace: true });
      } else {
        await updatePost(id!, payload);
        setPublished(willPublish);
        toast.success(willPublish ? 'Article published' : 'Saved');
      }
    } catch (e: unknown) {
      const msg = (e as Error).message;
      toast.error(msg.includes('duplicate') ? 'That slug is already in use' : msg);
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const field = 'w-full rounded-xl border border-foreground/[0.12] bg-foreground/[0.03] px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/38 outline-none transition-colors focus:border-primary/50';

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${isNew ? 'New article' : 'Edit article'} · ThinkDecor`} description="Write a ThinkDecor journal article." />

      <header className="sticky top-0 z-40 border-b border-foreground/[0.09] bg-white/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-[1100px] items-center gap-4 px-6">
          <Link to="/admin/blog" className="flex items-center gap-2 text-[13.5px] text-foreground/58 transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Articles
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider ${
            published ? 'bg-primary/15 text-primary' : 'bg-foreground/[0.05] text-foreground/50'
          }`}>
            {published ? 'Live' : 'Draft'}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 rounded-full border border-foreground/[0.12] px-4 py-2 text-[13px] text-foreground/65 transition-colors hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5" /> {preview ? 'Write' : 'Preview'}
            </button>
            <button
              onClick={() => save(false)} disabled={busy}
              className="flex items-center gap-1.5 rounded-full border border-foreground/[0.14] px-4 py-2 text-[13px] font-medium text-foreground/80 transition-colors hover:border-primary/40 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
            <button
              onClick={() => save(true)} disabled={busy}
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Publish
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-[1100px] px-6 py-9">
        {preview ? (
          <article className={`mx-auto ${layout.proseWidth === 'wide' ? 'max-w-[900px]' : 'max-w-[720px]'}`}>
            {cover && <img src={cover} alt="" className="mb-8 aspect-[16/9] w-full rounded-2xl border border-foreground/[0.10] object-cover" />}
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">{tag}</p>
            <h1 className="mt-4 text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
              {title || 'Untitled article'}
            </h1>
            {excerpt && <p className="mt-5 text-[17px] font-light leading-relaxed text-foreground/60">{excerpt}</p>}
            <div className={`${postBodyClassName(layout)} mt-10`} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          </article>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* main */}
            <div className="space-y-4">
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title"
                className="w-full bg-transparent text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.02em] text-foreground placeholder:text-foreground/32 outline-none"
              />
              <textarea
                value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short excerpt shown on the journal index…"
                rows={2}
                className={`${field} resize-none`}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bodyInput.current?.click()}
                  disabled={uploading !== null}
                  className="flex items-center gap-2 rounded-lg border border-foreground/[0.12] px-3.5 py-2 text-[12.5px] font-medium text-foreground/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {uploading === 'body'
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Upload className="h-3.5 w-3.5" />}
                  {uploading === 'body' ? 'Uploading…' : 'Insert image'}
                </button>
                <span className="text-[11.5px] text-foreground/40">or drag an image into the editor</span>
                <input
                  ref={bodyInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { handleUpload(e.target.files?.[0], 'body'); e.target.value = ''; }}
                />
              </div>

              <textarea
                ref={contentRef}
                value={content} onChange={(e) => setContent(e.target.value)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const f = e.dataTransfer.files?.[0];
                  if (f?.type.startsWith('image/')) { e.preventDefault(); handleUpload(f, 'body'); }
                }}
                onPaste={(e) => {
                  const f = [...e.clipboardData.files].find((x) => x.type.startsWith('image/'));
                  if (f) { e.preventDefault(); handleUpload(f, 'body'); }
                }}
                placeholder="Write in markdown…"
                rows={22}
                className={`${field} font-mono text-[13.5px] leading-relaxed`}
              />
              <p className="text-[12px] text-foreground/42">
                Markdown: <code className="text-primary">## heading</code> · <code className="text-primary">**bold**</code> ·
                <code className="text-primary"> - list</code> · <code className="text-primary"> &gt; quote</code> ·
                <code className="text-primary"> ![alt](url)</code> · <code className="text-primary"> ![alt|wide](url)</code> ·
                <code className="text-primary"> ![alt|full](url)</code> — about {readingTime(content)} min read
              </p>
            </div>

            {/* sidebar */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-foreground/[0.10] bg-foreground/[0.025] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/50">Cover image</p>
                <div className="mt-3 aspect-[16/10] overflow-hidden rounded-xl border border-foreground/[0.09] bg-black/28">
                  {cover
                    ? <img src={cover} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center"><ImageIcon className="h-5 w-5 text-foreground/32" /></div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => coverInput.current?.click()}
                    disabled={uploading !== null}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-[12.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {uploading === 'cover'
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Upload className="h-3.5 w-3.5" />}
                    {uploading === 'cover' ? 'Uploading…' : 'Upload'}
                  </button>
                  {cover && (
                    <button
                      type="button"
                      onClick={() => setCover('')}
                      title="Remove cover"
                      className="rounded-lg border border-foreground/[0.12] px-3 text-foreground/55 transition-colors hover:border-destructive/45 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <input
                    ref={coverInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => { handleUpload(e.target.files?.[0], 'cover'); e.target.value = ''; }}
                  />
                </div>

                <input
                  value={cover} onChange={(e) => setCover(e.target.value)}
                  placeholder="…or paste an image URL"
                  className={`${field} mt-2 text-[13px]`}
                />
              </div>

              <div className="rounded-2xl border border-foreground/[0.10] bg-foreground/[0.025] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/50">Category</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TAGS.map((t) => (
                    <button
                      key={t} onClick={() => setTag(t)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] transition-colors ${
                        tag === t ? 'bg-primary font-medium text-primary-foreground' : 'border border-foreground/[0.12] text-foreground/58 hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-foreground/[0.10] bg-foreground/[0.025] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/50">Layout</p>
                <p className="mt-1 text-[11.5px] text-foreground/40">
                  Fixes for this article only — a bigger heading image, roomier
                  spacing, that sort of thing. Doesn't touch other posts.
                </p>

                <p className="mt-4 text-[11px] font-medium text-foreground/50">Prose width</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROSE_WIDTHS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setLayout((l) => ({ ...l, proseWidth: o.value }))}
                      className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                        (layout.proseWidth ?? 'normal') === o.value
                          ? 'bg-primary font-medium text-primary-foreground'
                          : 'border border-foreground/[0.12] text-foreground/58 hover:text-foreground'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-[11px] font-medium text-foreground/50">Paragraph rhythm</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RHYTHMS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setLayout((l) => ({ ...l, rhythm: o.value }))}
                      className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                        (layout.rhythm ?? 'normal') === o.value
                          ? 'bg-primary font-medium text-primary-foreground'
                          : 'border border-foreground/[0.12] text-foreground/58 hover:text-foreground'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-[11px] font-medium text-foreground/50">Default image size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {IMAGE_STYLES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setLayout((l) => ({ ...l, imageStyle: o.value }))}
                      className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                        (layout.imageStyle ?? 'inline') === o.value
                          ? 'bg-primary font-medium text-primary-foreground'
                          : 'border border-foreground/[0.12] text-foreground/58 hover:text-foreground'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-foreground/[0.10] bg-foreground/[0.025] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/50">URL slug</p>
                <input
                  value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                  className={`${field} mt-3 font-mono text-[12.5px]`}
                />
                <p className="mt-2 truncate font-mono text-[11.5px] text-foreground/38">thinkdecor.app/blog/{slug || '…'}</p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
