// Snapshots the marketing routes (home, pricing, blog list, every published
// post) into static HTML after the build, so crawlers that don't run
// JavaScript — GPTBot, ClaudeBot, PerplexityBot, and Googlebot's first pass —
// see real content instead of an empty <div id="root">.
//
// Deliberately NOT server-side rendering (no react-dom/server, no window/
// document guards added to any component): this drives a real headless
// Chrome against the already-built dist/ output and captures what a normal
// browser renders, so nothing about how the app runs has to change. The
// app's own client-side JS still boots normally afterwards and takes over —
// this only changes what's in the HTML *before* that happens.
//
// Every route below gets its OWN index.html (dist/pricing/index.html, etc.)
// — never dist/index.html itself for anything but "/", since that file is
// also the SPA fallback every other route (/app/*, /login, /admin/*, a 404)
// depends on. Vercel serves a matching static file before it ever applies
// the SPA rewrite, so each of these is picked up automatically with no
// vercel.json change.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 45231;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm', '.txt': 'text/plain', '.xml': 'application/xml',
};

function serveDist() {
  return createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    let filePath = join(DIST, decodeURIComponent(urlPath));
    if (!existsSync(filePath) || urlPath.endsWith('/')) filePath = join(DIST, 'index.html');
    if (!existsSync(filePath)) filePath = join(DIST, 'index.html');
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(readFileSync(filePath));
  }).listen(PORT);
}

async function fetchPublishedPosts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('blog_posts').select('slug').eq('published', true);
  if (error) {
    console.warn('[prerender] could not read blog_posts, skipping post routes:', error.message);
    return [];
  }
  return (data ?? []).map((p) => p.slug);
}

/**
 * Writes a prerendered route. For "/" this merges into the existing
 * dist/index.html (keeps it as a valid SPA fallback for every other route).
 * For everything else it writes a full standalone dist/<route>/index.html,
 * built from the *original* index.html shell so GTM/pixels/font links and
 * the app's own <script type="module"> all still load normally.
 */
function writeRoute(route, snapshot, shellHtml) {
  let out = shellHtml;
  out = out.replace(/<div id="root"><\/div>/, snapshot.rootHtml);
  if (snapshot.title) out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${snapshot.title}</title>`);
  if (snapshot.description) {
    out = out.replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${snapshot.description.replace(/"/g, '&quot;')}">`,
    );
  }
  if (snapshot.schemaJson) {
    out = out.replace('</head>', `<script id="seo-schema-ld" type="application/ld+json">${snapshot.schemaJson}</script>\n</head>`);
  }

  if (route === '/') {
    writeFileSync(join(DIST, 'index.html'), out);
    return;
  }
  const dir = join(DIST, route.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), out);
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found — run `vite build` first. Skipping.');
    return;
  }
  const shellHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');
  const server = serveDist();

  const slugs = await fetchPublishedPosts();
  const routes = ['/', '/pricing', '/blog', ...slugs.map((s) => `/blog/${s}`)];

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    for (const route of routes) {
      const page = await browser.newPage();
      try {
        await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
        // The app's own content (blog posts, FAQ schema) arrives via a
        // useEffect after mount — give it a beat past networkidle.
        await new Promise((r) => setTimeout(r, 600));
        const snapshot = await page.evaluate(() => ({
          rootHtml: document.getElementById('root')?.outerHTML ?? '',
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
          schemaJson: document.getElementById('seo-schema-ld')?.textContent ?? '',
        }));
        if (!snapshot.rootHtml) throw new Error('no #root content captured');
        writeRoute(route, snapshot, shellHtml);
        console.log(`[prerender] ${route} -> ${route === '/' ? 'dist/index.html' : `dist${route}/index.html`}`);
      } catch (err) {
        console.warn(`[prerender] failed on ${route}, leaving the SPA shell for it:`, err.message);
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch((err) => {
  // Never fail the build over prerendering — worst case every route falls
  // back to the plain client-rendered shell, same as before this existed.
  console.warn('[prerender] failed, dist/ still has a working client-rendered build:', err);
});
