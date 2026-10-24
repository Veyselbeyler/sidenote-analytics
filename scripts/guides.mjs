#!/usr/bin/env node
// Keeps the guides hub and sitemap.xml in step with guides/<slug>/index.html,
// and checks each guide against the editorial brief.
//
//   node scripts/guides.mjs           rewrite guides/index.html and sitemap.xml
//   node scripts/guides.mjs --check   fail if either is out of date or a guide breaks a rule
//
// No dependencies: runs on any Node 18+.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SITE = 'https://sidenoteanalytics.com';
const HUB = join(ROOT, 'guides/index.html');
const SITEMAP = join(ROOT, 'sitemap.xml');
const check = process.argv.includes('--check');

const meta = (html, attr, name) =>
  (html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`)) || [])[1];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function readGuide(slug) {
  const html = readFileSync(join(ROOT, 'guides', slug, 'index.html'), 'utf8');
  const article = (html.match(/<article>([\s\S]*?)<aside class="try"/) || [])[1] || '';
  return {
    slug,
    html,
    url: `${SITE}/guides/${slug}/`,
    title: decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''),
    h1: (html.match(/<h1>([^<]*)<\/h1>/) || [])[1] || '',
    h1Count: (html.match(/<h1[\s>]/g) || []).length,
    description: decode(meta(html, 'name', 'description') || ''),
    canonical: (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1],
    published: meta(html, 'property', 'article:published_time'),
    modified: meta(html, 'property', 'article:modified_time'),
    words: article.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
  };
}

const guides = readdirSync(join(ROOT, 'guides'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, 'guides', d.name, 'index.html')))
  .map((d) => readGuide(d.name))
  .sort((a, b) => (b.published || '').localeCompare(a.published || '') || a.slug.localeCompare(b.slug));

// Rules from docs/seo-engine/style-guide.md that a script can check.
const problems = [];
const slugs = new Set(guides.map((g) => g.slug));
for (const g of guides) {
  const say = (msg) => problems.push(`${g.slug}: ${msg}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.slug)) say('slug must be lowercase words joined by hyphens');
  if (g.html.includes('{{')) say('template placeholder left in the page');
  if (!g.title || g.title.length > 60) say(`title must be 1–60 characters (is ${g.title.length})`);
  if (g.description.length < 120 || g.description.length > 160) say(`meta description must be 120–160 characters (is ${g.description.length})`);
  if (g.h1Count !== 1) say(`needs exactly one <h1> (has ${g.h1Count})`);
  if (g.canonical !== g.url) say(`canonical should be ${g.url}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g.published || '') || !/^\d{4}-\d{2}-\d{2}$/.test(g.modified || '')) say('published and modified dates must be YYYY-MM-DD');
  else if (g.modified < g.published) say('modified date is before the published date');
  if (g.words < 900 || g.words > 1500) say(`body should be 900–1,500 words (is ${g.words})`);
  if (!g.html.includes(`utm_campaign=${g.slug}"`)) say('store link needs utm_campaign set to the slug');
  if (!g.html.includes("content_group: 'Guides'")) say('missing the content_group dataLayer push');
  const ld = (g.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  try { if (!ld || !JSON.parse(ld)['@graph'].some((n) => n['@type'] === 'Article')) say('JSON-LD needs an Article node'); }
  catch { say('JSON-LD is not valid JSON'); }
  for (const [, target] of g.html.matchAll(/href="\/guides\/([^"/]+)\/"/g)) {
    if (!slugs.has(target)) say(`links to a guide that does not exist: /guides/${target}/`);
  }
}

// The hub: one card per guide, newest first.
const cards = guides.map((g) => `    <li><a href="/guides/${g.slug}/"><b>${g.h1}</b><span>${escape(g.description)}</span></a></li>`).join('\n');
const hubOld = readFileSync(HUB, 'utf8');
const hubNew = hubOld.replace(/<!-- guides:start -->[\s\S]*<!-- guides:end -->/, `<!-- guides:start -->\n${cards}\n<!-- guides:end -->`);

// The sitemap: pages outside /guides/ are kept as they are, guides are rebuilt.
const sitemapOld = readFileSync(SITEMAP, 'utf8');
const kept = [...sitemapOld.matchAll(/  <url>.*<\/url>/g)].map((m) => m[0]).filter((l) => !l.includes(`${SITE}/guides/`));
const newest = guides.map((g) => g.modified).sort().pop();
const guideUrls = [
  ...(newest ? [`  <url><loc>${SITE}/guides/</loc><lastmod>${newest}</lastmod></url>`] : []),
  ...guides.map((g) => `  <url><loc>${g.url}</loc><lastmod>${g.modified}</lastmod></url>`),
];
const sitemapNew = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...kept, ...guideUrls].join('\n')}
</urlset>
`;

if (check) {
  if (hubNew !== hubOld) problems.push('guides/index.html is out of date: run node scripts/guides.mjs');
  if (sitemapNew !== sitemapOld) problems.push('sitemap.xml is out of date: run node scripts/guides.mjs');
  if (problems.length) {
    console.error(problems.map((p) => `✗ ${p}`).join('\n'));
    process.exit(1);
  }
  console.log(`✓ ${guides.length} guide(s) pass`);
} else {
  writeFileSync(HUB, hubNew);
  writeFileSync(SITEMAP, sitemapNew);
  console.log(`Updated the hub and sitemap for ${guides.length} guide(s).`);
  if (problems.length) console.warn(problems.map((p) => `! ${p}`).join('\n'));
}
