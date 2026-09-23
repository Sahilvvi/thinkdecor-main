import type { BlogPost } from '@/lib/blog';

export interface ReadinessCheck {
  label: string;
  ok: boolean;
  fix?: string;
}

/** The same 5 checks the reference editor's "READY TO PUBLISH" widget and the Articles list's progress bar both use. */
export function readinessChecks(p: Pick<BlogPost, 'cover_url' | 'tag' | 'content' | 'excerpt' | 'slug'>): ReadinessCheck[] {
  const words = (p.content ?? '').trim().split(/\s+/).filter(Boolean).length;
  const excerptLen = (p.excerpt ?? '').trim().length;
  const genericSlug = !p.slug || ['new', 'untitled', 'draft', 'demo', 'post'].includes(p.slug.toLowerCase());

  return [
    { label: 'Cover image added', ok: !!p.cover_url },
    { label: 'Category chosen', ok: !!p.tag },
    { label: 'Body over 300 words', ok: words >= 300 },
    {
      label: excerptLen === 0 ? 'Excerpt is empty' : excerptLen < 40 ? `Excerpt is only ${excerptLen} characters` : 'Excerpt looks good',
      ok: excerptLen >= 40,
      fix: excerptLen < 40 ? 'Fix' : undefined,
    },
    {
      label: genericSlug ? `Slug "${p.slug || '…'}" doesn't describe the post` : 'Slug describes the post',
      ok: !genericSlug,
      fix: genericSlug ? 'Fix' : undefined,
    },
  ];
}
