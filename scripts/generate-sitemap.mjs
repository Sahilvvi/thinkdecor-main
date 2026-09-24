// Regenerates public/sitemap.xml before every build, so published blog
// posts are always in it — the old file was hand-written and never knew
// about a post that only exists in Supabase. Runs as `prebuild`, so the
// result lands in dist/ automatically when Vite copies public/.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://thinkdecor.app';
const today = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/pricing', changefreq: 'monthly', priority: '0.9' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.6' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.2' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { loc: '/refunds', changefreq: 'yearly', priority: '0.2' },
];

async function fetchPublishedSlugs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn('[sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY not set — sitemap will only have static pages.');
    return [];
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true);
  if (error) {
    console.warn('[sitemap] could not read blog_posts, skipping post URLs:', error.message);
    return [];
  }
  return data ?? [];
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const posts = await fetchPublishedSlugs();

  const entries = [
    ...STATIC_PAGES.map((p) => urlEntry({ ...p, lastmod: today })),
    ...posts.map((p) => urlEntry({
      loc: `/blog/${p.slug}`,
      lastmod: (p.updated_at ?? today).slice(0, 10),
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  const outPath = join(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outPath, xml);
  console.log(`[sitemap] wrote ${STATIC_PAGES.length} static + ${posts.length} post URL(s) to ${outPath}`);
}

main().catch((err) => {
  // Never fail the build over the sitemap — worst case it's stale, not broken.
  console.warn('[sitemap] generation failed, leaving existing public/sitemap.xml in place:', err);
});
