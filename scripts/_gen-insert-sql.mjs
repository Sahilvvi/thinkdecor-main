// One-time helper: turns NEW_POSTS from seed-blog-content.mjs into a SQL
// file, for running through `supabase db query -f` (which uses the linked
// project's own DB connection and isn't subject to the anon key's RLS
// policy the app itself is correctly restricted by).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NEW_POSTS } from './seed-blog-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const esc = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);

const rows = NEW_POSTS.map((p) => `(
  ${esc(p.slug)}, ${esc(p.title)}, ${esc(p.excerpt)}, ${esc(p.content)},
  ${esc(p.cover_url)}, ${esc(p.tag)}, ${p.read_minutes}, ${esc('ThinkDecor')},
  true, ${esc(p.published_at)}
)`).join(',\n');

const sql = `insert into public.blog_posts
  (slug, title, excerpt, content, cover_url, tag, read_minutes, author_name, published, published_at)
values
${rows}
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  cover_url = excluded.cover_url, tag = excluded.tag, read_minutes = excluded.read_minutes,
  published = excluded.published, published_at = excluded.published_at, updated_at = now();
`;

const outPath = join(__dirname, '_insert-posts.sql');
writeFileSync(outPath, sql);
console.log(`wrote ${outPath}`);
