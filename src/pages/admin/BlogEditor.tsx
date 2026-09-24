import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import '@/styles/admin-theme.css';
import { uploadImage, UploadError } from '@/lib/upload';
import {
  ArrowLeft, Loader2, Eye, Send, Upload, Trash2, Check, AlertTriangle,
  Heading1, Bold, Italic, Link2, Quote, List, Code2, Image as ImageIcon,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { useAuthStore } from '@/stores/authStore';
import { readinessChecks } from '@/lib/blogReadiness';
import {
  createPost, updatePost, listAll, slugify, readingTime, renderMarkdown, postBodyClassName,
  type BlogPost, type BlogPostLayout,
} from '@/lib/blog';

const TAGS = ['Product', 'Engineering', 'Design', 'Company', 'Guides'];

const PROSE_WIDTHS: { value: NonNullable<BlogPostLayout['proseWidth']>; label: string }[] = [
  { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' },
];
const RHYTHMS: { value: NonNullable<BlogPostLayout['rhythm']>; label: string }[] = [
  { value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'relaxed', label: 'Relaxed' },
];
const IMAGE_STYLES: { value: NonNullable<BlogPostLayout['imageStyle']>; label: string }[] = [
  { value: 'inline', label: 'Inline' }, { value: 'full', label: 'Full-bleed' },
];

const STARTER = `Write your article here.

## A section heading

Use **bold**, *italic*, \`code\` and [links](https://www.thinkdecor.app).

- A bullet point
- Another point

> A pull quote that stands out.

![Caption](https://example.com/image.jpg)
`;

/** Wraps or inserts markdown syntax around the textarea's current selection, mouse/keyboard-editor style. */
function applyMarkdown(ta: HTMLTextAreaElement, before: string, after = before, placeholder = '') {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const selected = value.slice(s, e) || placeholder;
  const next = value.slice(0, s) + before + selected + after + value.slice(e);
  return { next, caretStart: s + before.length, caretEnd: s + before.length + selected.length };
}

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const nav = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
        setLastSaved(new Date(p.updated_at));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew, nav]);

  useEffect(() => { if (!slugTouched) setSlug(slugify(title)); }, [title, slugTouched]);

  const save = async (publish?: boolean) => {
    if (!title.trim()) { toast.error('Give the article a title'); return; }
    const willPublish = publish ?? published;
    setBusy(true);
    const payload: Partial<BlogPost> = {
      title: title.trim(), slug: slug || slugify(title), excerpt: excerpt.trim() || null,
      cover_url: cover.trim() || null, tag, content, read_minutes: readingTime(content),
      author_name: user?.user_metadata?.name || 'Think Decor', published: willPublish, layout,
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
      setLastSaved(new Date());
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg.includes('duplicate') ? 'That slug is already in use' : msg);
    } finally { setBusy(false); }
  };

  const insert = (before: string, after?: string, placeholder = '') => {
    const ta = contentRef.current;
    if (!ta) return;
    const { next, caretStart, caretEnd } = applyMarkdown(ta, before, after, placeholder);
    setContent(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(caretStart, caretEnd); });
  };

  if (loading) {
    return (
      <div className="admin-x flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--brass)' }} />
      </div>
    );
  }

  const checks = readinessChecks({ cover_url: cover || null, tag, content, excerpt, slug });
  const okCount = checks.filter((c) => c.ok).length;

  return (
    <div className="admin-x">
      <SEO title={`${isNew ? 'New article' : 'Edit article'} · Think Decor`} description="Write a Think Decor journal article." />

      <header className="ebar">
        <Link to="/admin/blog" className="back" aria-label="Back to articles"><ArrowLeft width={16} height={16} /> <span className="lbl">Articles</span></Link>
        <span className="vr" />
        <span className="doc">{title || 'Untitled article'}</span>
        <span className={`chip ${published ? 'live' : 'draft'}`}><i />{published ? 'Live' : 'Draft'}</span>
        {lastSaved && (
          <span className="saved"><Check width={14} height={14} /> Saved · {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
        <div className="right">
          <button type="button" className="btn btn-line" aria-label={preview ? 'Back to writing' : 'Preview article'} onClick={() => setPreview((p) => !p)}>
            <Eye width={15} height={15} /> <span className="lbl">{preview ? 'Write' : 'Preview'}</span>
          </button>
          <button type="button" className="btn btn-line" aria-label="Save draft" onClick={() => save(false)} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload width={15} height={15} />} <span className="lbl">Save</span> <kbd>⌘S</kbd>
          </button>
          <button type="button" className="btn btn-dark" onClick={() => save(true)} disabled={busy}>
            <Send width={15} height={15} /> Publish
          </button>
        </div>
      </header>

      {preview ? (
        <div className="wrap" style={{ gridTemplateColumns: '1fr' }}>
          <article className={`paper mx-auto w-full ${layout.proseWidth === 'wide' ? 'max-w-[900px]' : 'max-w-[720px]'}`}>
            {cover && <img src={cover} alt="" className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)' }} />}
            <p className="kicker">{tag}</p>
            <h1 className="title" style={{ outline: 'none' }}>{title || 'Untitled article'}</h1>
            {excerpt && <p className="excerpt">{excerpt}</p>}
            <div className={`${postBodyClassName(layout)} doc-body`} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          </article>
        </div>
      ) : (
        <div className="wrap">
          <article className="paper">
            <div className="kicker">
              <span>{tag}</span>
              <span style={{ color: 'var(--stone)' }}>/</span>
              <span>About {readingTime(content)} min read</span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="title"
            />
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="— add a one-line excerpt for the journal index"
              rows={2}
              className="excerpt"
            />

            <div className="tools">
              <button type="button" className="ico-btn" title="Heading" aria-label="Heading" onClick={() => insert('## ', '', 'Heading')}><Heading1 width={16} height={16} /></button>
              <button type="button" className="ico-btn" title="Bold" aria-label="Bold" onClick={() => insert('**', '**', 'bold text')}><Bold width={16} height={16} /></button>
              <button type="button" className="ico-btn" title="Italic" aria-label="Italic" onClick={() => insert('*', '*', 'italic text')}><Italic width={16} height={16} /></button>
              <button type="button" className="ico-btn" title="Link" aria-label="Link" onClick={() => insert('[', '](https://)', 'link text')}><Link2 width={16} height={16} /></button>
              <span className="vr" />
              <button type="button" className="ico-btn" title="Quote" aria-label="Quote" onClick={() => insert('\n> ', '', 'A pull quote')}><Quote width={16} height={16} /></button>
              <button type="button" className="ico-btn" title="List" aria-label="List" onClick={() => insert('\n- ', '', 'List item')}><List width={16} height={16} /></button>
              <button type="button" className="ico-btn" title="Code" aria-label="Code" onClick={() => insert('`', '`', 'code')}><Code2 width={16} height={16} /></button>
              <span className="vr" />
              <button
                type="button"
                className="ico-btn"
                title="Image"
                disabled={uploading !== null}
                onClick={() => bodyInput.current?.click()}
              >
                {uploading === 'body' ? <Loader2 width={16} height={16} className="animate-spin" /> : <ImageIcon width={16} height={16} />}
              </button>
              <input
                ref={bodyInput} type="file" accept="image/*" hidden
                onChange={(e) => { handleUpload(e.target.files?.[0], 'body'); e.target.value = ''; }}
              />
            </div>

            <div
              className="doc-body"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const f = e.dataTransfer.files?.[0];
                if (f?.type.startsWith('image/')) { e.preventDefault(); handleUpload(f, 'body'); }
              }}
            >
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={(e) => {
                  const f = [...e.clipboardData.files].find((x) => x.type.startsWith('image/'));
                  if (f) { e.preventDefault(); handleUpload(f, 'body'); }
                }}
                placeholder="Write in markdown…"
              />
            </div>

            <div className="status-line">
              <span>
                <span>{readingTime(content)} min read</span>
                <span>{(content.match(/!\[[^\]]*\]\(/g) ?? []).length} image{(content.match(/!\[[^\]]*\]\(/g) ?? []).length === 1 ? '' : 's'}</span>
              </span>
              <span>Markdown supported · drop an image, or press the toolbar buttons</span>
            </div>
          </article>

          <aside className="rail">
            <div className="box r" style={{ ['--i' as string]: 1 }}>
              <h5>READY TO PUBLISH <span style={{ color: 'var(--taupe-2)' }}>{okCount} / {checks.length}</span></h5>
              <div className="meter">
                {checks.map((c, i) => <i key={i} className={c.ok ? 'f' : ''} style={{ animationDelay: `${i * 0.1}s` }} />)}
              </div>
              {checks.map((c) => (
                <div key={c.label} className={`check ${c.ok ? 'ok' : 'no'}`}>
                  <span className="ci">{c.ok ? <Check width={12} height={12} /> : <AlertTriangle width={12} height={12} />}</span>
                  {c.label}
                  {c.fix && <small>{c.fix}</small>}
                </div>
              ))}
            </div>

            <div className="box r" style={{ ['--i' as string]: 2 }}>
              <h5>COVER IMAGE <button type="button" onClick={() => coverInput.current?.click()}>{cover ? 'Replace' : 'Add'}</button></h5>
              <div className="cover">
                {cover ? <img src={cover} alt="" /> : <div className="cover-empty"><ImageIcon width={20} height={20} /></div>}
                <div className="ov">
                  <button type="button" onClick={() => coverInput.current?.click()} disabled={uploading !== null}>
                    {uploading === 'cover' ? <Loader2 width={13} height={13} className="animate-spin" /> : <Upload width={13} height={13} />} Upload
                  </button>
                  {cover && (
                    <button type="button" className="d" onClick={() => setCover('')} title="Remove cover">
                      <Trash2 width={14} height={14} />
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={coverInput} type="file" accept="image/*" hidden
                onChange={(e) => { handleUpload(e.target.files?.[0], 'cover'); e.target.value = ''; }}
              />
              <input
                value={cover} onChange={(e) => setCover(e.target.value)}
                placeholder="…or paste an image URL"
                className="mt-2 w-full rounded-lg px-3 py-2 text-[12.5px] outline-none"
                style={{ boxShadow: 'inset 0 0 0 1px var(--stone)', color: 'var(--ink)' }}
              />
            </div>

            <div className="box r" style={{ ['--i' as string]: 3 }}>
              <h5>CATEGORY</h5>
              <div className="pills">
                {TAGS.map((t) => (
                  <button key={t} type="button" className={`pill${tag === t ? ' on' : ''}`} onClick={() => setTag(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div className="box r" style={{ ['--i' as string]: 4 }}>
              <h5>LAYOUT <span style={{ color: 'var(--taupe-2)', fontWeight: 600, fontSize: 11 }}>This article only</span></h5>
              <div className="opt">
                <label>Prose width</label>
                <div className="seg sm">
                  {PROSE_WIDTHS.map((o) => (
                    <button key={o.value} type="button" className={(layout.proseWidth ?? 'normal') === o.value ? 'on' : ''} onClick={() => setLayout((l) => ({ ...l, proseWidth: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div className="opt">
                <label>Paragraph rhythm</label>
                <div className="seg sm">
                  {RHYTHMS.map((o) => (
                    <button key={o.value} type="button" className={(layout.rhythm ?? 'normal') === o.value ? 'on' : ''} onClick={() => setLayout((l) => ({ ...l, rhythm: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
              <div className="opt">
                <label>Default image size</label>
                <div className="seg sm">
                  {IMAGE_STYLES.map((o) => (
                    <button key={o.value} type="button" className={(layout.imageStyle ?? 'inline') === o.value ? 'on' : ''} onClick={() => setLayout((l) => ({ ...l, imageStyle: o.value }))}>{o.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="box r" style={{ ['--i' as string]: 5 }}>
              <h5>URL &amp; SEARCH PREVIEW</h5>
              <div className="slug">
                <span>/blog/</span>
                <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
              </div>
              <div className="serp">
                <div className="u">
                  <i>T</i>
                  <div>Think Decor<br /><span style={{ color: '#6B7270' }}>thinkdecor.app › blog › {slug || '…'}</span></div>
                </div>
                <div className="t">{title || 'Untitled article'}</div>
                <div className="d">{excerpt || 'No excerpt yet — add one so search results show something useful.'}</div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
