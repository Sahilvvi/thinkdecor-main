// The anon key can't UPDATE blog_posts (RLS, correctly) so the expansions
// need to go through `supabase db query` the same way the inserts did.
// Reads each post's CURRENT content fresh (in case it's changed) and
// appends the planned section, rather than assuming the value already
// baked into EXPANSIONS is still current.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { EXPANSIONS } from './seed-blog-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const statements = [];
for (const [slug, addition] of Object.entries(EXPANSIONS)) {
  const { data, error } = await supabase.from('blog_posts').select('content').eq('slug', slug).single();
  if (error || !data) { console.error(`skip ${slug}:`, error?.message); continue; }
  if (data.content.includes(addition.trim().split('\n')[0])) { console.log(`already expanded: ${slug}`); continue; }
  const newContent = data.content + addition;
  statements.push(`update public.blog_posts set content = ${esc(newContent)}, updated_at = now() where slug = ${esc(slug)};`);
}

writeFileSync(join(__dirname, '_expand-posts.sql'), statements.join('\n\n') + '\n');
console.log(`wrote ${statements.length} update statement(s)`);
