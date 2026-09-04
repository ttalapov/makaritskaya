#!/usr/bin/env node
// Static build: template + partials + content/<segment>.json -> dist/<segment>/index.html
// Plain Node, no dependencies, no framework, no i18n library.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://makaritskaya.pp.ua';

// ---------------------------------------------------------------------------
// The one place a language is declared. Everything below is derived from it:
// output folder, <html lang>, hreflang, the switcher, sitemap.xml.
//
// `segment` is the URL path and `lang` is the ISO 639-1 code. For Ukrainian
// they deliberately differ: the path reads /ua/ because that is what visitors
// recognise, while the language code is and must stay `uk`.
//
// Adding English = drop content/en.json next to the others and append
//   { segment: 'en', lang: 'en', label: 'ENG' }
// No template touched.
// ---------------------------------------------------------------------------
const LOCALES = [
  { segment: 'ua', lang: 'uk', label: 'УКР' },
  { segment: 'ru', lang: 'ru', label: 'РУС' },
];
const DEFAULT_LOCALE = LOCALES[0];   // also the x-default target

// Presentation, not copy: identical in every language, so it lives here and
// the content files only carry the group's icon key.
const ICONS = {
  g1: '<circle cx="12" cy="12" r="2"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>',
  g2: '<path d="M4 19c0-4.5 3.5-6 7-6s7-1.5 7-6"/><circle cx="4" cy="19" r="1.8"/><circle cx="18" cy="7" r="1.8"/>',
  g3: '<path d="M3 8h9M17 8h4M3 16h5M13 16h8"/><circle cx="14.5" cy="8" r="2.2"/><circle cx="10.5" cy="16" r="2.2"/>',
  g4: '<path d="M8.5 4 5 6l-2 4 3 1.6V20h12v-8.4L21 10l-2-4-3.5-2a3.5 3.5 0 0 1-7 0Z"/>',
  g5: '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10.2V20h12v-9.8"/><path d="M10 20v-5h4v5"/>',
  g6: '<path d="M9 17V5.5l10-2V15"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  g7: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14H6.5A2.5 2.5 0 0 0 4 19.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H19v4H6.5A2.5 2.5 0 0 1 4 19.5Z"/><path d="M9 7.5h6"/>',
};
const ARROW = (s) =>
  `<svg width="${s}" height="${s}" fill="none" viewBox="0 0 24 24" aria-hidden="true">` +
  `<path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>`;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const todos = [];
/** Values may be prefixed "TODO: " to mark copy awaiting the author's wording.
 *  The prefix never reaches the page - it is stripped here and reported. */
function clean(value, keyPath, segment) {
  if (typeof value !== 'string') return value;
  if (value.startsWith('TODO: ')) {
    todos.push(`${segment}.json  ${keyPath}`);
    return value.slice(6);
  }
  return value;
}
function walk(node, segment, path = '') {
  if (typeof node === 'string') return clean(node, path, segment);
  if (Array.isArray(node)) return node.map((v, i) => walk(v, segment, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v, segment, path ? `${path}.${k}` : k);
    return out;
  }
  return node;
}

function readPartials() {
  const dir = join(ROOT, 'src', 'partials');
  const map = {};
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.html')) map[f.replace(/\.html$/, '')] = readFileSync(join(dir, f), 'utf8');
  }
  return map;
}

/** {{> name}} includes, resolved before value substitution so partials may
 *  contain placeholders of their own. */
function inlinePartials(html, partials) {
  for (let i = 0; i < 10; i++) {
    const next = html.replace(/^([ \t]*)\{\{>\s*([\w-]+)\s*\}\}[ \t]*$/gm, (m, indent, name) => {
      if (!(name in partials)) throw new Error(`unknown partial: ${name}`);
      return partials[name].replace(/\n$/, '').split('\n').map((l) => (l ? indent + l : l)).join('\n');
    });
    if (next === html) return html;
    html = next;
  }
  throw new Error('partial include nested too deep (cycle?)');
}

/** {{a.b.c}}  -> value, HTML-escaped (safe in text and in attributes)
 *  {{{a.b.c}}} -> value inserted raw, for the few strings that carry markup
 *                 such as the <em> inside section headings.
 *  Unresolved keys are a build error, so a typo cannot silently ship an
 *  empty page. */
function fill(html, values) {
  const missing = new Set();
  const lookup = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), values);

  let out = html.replace(/\{\{\{([\w.]+)\}\}\}/g, (m, path) => {
    const v = lookup(path);
    if (v === undefined || v === null) { missing.add(path); return m; }
    return String(v);
  });
  out = out.replace(/\{\{([\w.]+)\}\}/g, (m, path) => {
    const v = lookup(path);
    if (v === undefined || v === null) { missing.add(path); return m; }
    // pre-rendered blocks are already valid HTML built by the renderers above
    return path.endsWith('Html') || RAW.has(path) ? String(v) : esc(v);
  });

  if (missing.size) throw new Error(`unresolved placeholders: ${[...missing].join(', ')}`);
  return out;
}

/** Generated markup, not authored copy. */
const RAW = new Set(['hreflangLinks', 'langSwitcher', 'langSwitcherMobile', 'arrowLg', 'arrowSm']);

// ---------------------------------------------------------------------------
// blocks built from structured content
// ---------------------------------------------------------------------------
const renderStats = (stats) => stats.map((s) =>
  `      <div class="stat-item"><div class="stat-num">${esc(s.num)}</div><div class="stat-desc">${esc(s.desc)}</div></div>`
).join('\n');

const renderCreds = (creds) => creds.map((c) =>
  `      <div class="cred-item"><div class="cred-icon" aria-hidden="true">${c.icon}</div>` +
  `<div class="cred-text"><strong>${esc(c.title)}</strong>${esc(c.desc)}</div></div>`
).join('\n');

const renderMethodGroups = (groups) => groups.map((g, i) => {
  const delay = i % 3 === 0 ? '' : ` reveal-delay-${i % 3}`;
  const items = g.items.map((x) => {
    const note = x.note ? ` <span class="method-note">${esc(x.note)}</span>` : '';
    const desc = x.desc ? `<span class="method-item-desc">${esc(x.desc)}</span>` : '';
    return `        <li><span class="method-item-name">${esc(x.name)}${note}</span>${desc}</li>`;
  }).join('\n');
  const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ` +
    `stroke-linecap="round" stroke-linejoin="round">${ICONS[g.icon]}</svg>`;
  return `    <article class="method-card reveal${delay}">
      <span class="method-icon" aria-hidden="true">${svg}</span>
      <h3 class="method-title">${esc(g.title)}</h3>
      <p class="method-lead">${esc(g.lead)}</p>
      <ul class="method-list">
${items}
      </ul>
    </article>`;
}).join('\n');

const renderSteps = (steps) => steps.map((s, i) =>
  `        <div class="step-item">
          <div class="step-num">${String(i + 1).padStart(2, '0')}</div>
          <div class="step-content"><div class="step-title">${esc(s.title)}</div><div class="step-desc">${esc(s.desc)}</div></div>
        </div>`
).join('\n');

const renderFeatures = (features) => features.map((f) =>
  `      <div class="feat-block"><div class="feat-icon" aria-hidden="true">${f.icon}</div>` +
  `<div class="feat-title">${esc(f.title)}</div><div class="feat-desc">${esc(f.desc)}</div></div>`
).join('\n');

const renderWhoCards = (cards) => cards.map((c, i) => {
  const delay = i === 0 ? '' : ` reveal-delay-${i % 4}`;
  return `    <div class="who-card reveal${delay}"><div class="who-icon" aria-hidden="true">${c.icon}</div>` +
    `<div class="who-title">${esc(c.title)}</div><div class="who-desc">${esc(c.desc)}</div></div>`;
}).join('\n');

// ---------------------------------------------------------------------------
// per-locale link plumbing, all derived from LOCALES
// ---------------------------------------------------------------------------
const urlFor = (loc) => `${SITE}/${loc.segment}/`;

const hreflangLinks = (current) => [
  ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.lang}" href="${urlFor(l)}">`),
  `<link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE)}">`,
].join('\n');

/** Plain anchors. No navigator.language sniffing, no IP redirect - that breaks
 *  indexing and reads as cloaking. */
const langSwitcher = (current, extraClass = '') =>
  `<div class="lang-switcher${extraClass}">\n` +
  LOCALES.map((l) => {
    const active = l.segment === current.segment;
    return `      <a class="lang-btn${active ? ' active' : ''}" href="/${l.segment}/" hreflang="${l.lang}" lang="${l.lang}"` +
      `${active ? ' aria-current="page"' : ''}>${l.label}</a>`;
  }).join('\n') + '\n    </div>';

function sitemap() {
  const alternates = [
    ...LOCALES.map((l) => `      <xhtml:link rel="alternate" hreflang="${l.lang}" href="${urlFor(l)}"/>`),
    `      <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE)}"/>`,
  ].join('\n');
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LOCALES.map((l) => `  <url>
    <loc>${urlFor(l)}</loc>
${alternates}
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
}

const robots = () => `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

// ---------------------------------------------------------------------------
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const entry of readdirSync(src)) {
    const s = join(src, entry), d = join(dest, entry);
    if (statSync(s).isDirectory()) n += copyDir(s, d);
    else { copyFileSync(s, d); n++; }
  }
  return n;
}

function build() {
  const dist = join(ROOT, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  const template = readFileSync(join(ROOT, 'src', 'template.html'), 'utf8');
  const partials = readPartials();
  const skeleton = inlinePartials(template, partials);

  for (const loc of LOCALES) {
    const file = join(ROOT, 'content', `${loc.segment}.json`);
    if (!existsSync(file)) {
      console.warn(`  skip /${loc.segment}/  (content/${loc.segment}.json not found)`);
      continue;
    }
    const c = walk(JSON.parse(readFileSync(file, 'utf8')), loc.segment);

    const values = {
      ...c,
      lang: loc.lang,
      segment: loc.segment,
      canonical: urlFor(loc),
      hreflangLinks: hreflangLinks(loc),
      langSwitcher: langSwitcher(loc),
      langSwitcherMobile: langSwitcher(loc, ' mobile-lang'),
      arrowLg: ARROW(16),
      arrowSm: ARROW(14),
      statsHtml: renderStats(c.about.stats),
      credsHtml: renderCreds(c.about.creds),
      methodGroupsHtml: renderMethodGroups(c.methods.groups),
      stepsHtml: renderSteps(c.approach.steps),
      featuresHtml: renderFeatures(c.approach.features),
      whoCardsHtml: renderWhoCards(c.who.cards),
      phoneHref: c.contact.phone.replace(/[^\d+]/g, ''),
    };

    const html = fill(skeleton, values);
    const outDir = join(dist, loc.segment);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html, 'utf8');
    console.log(`  /${loc.segment}/  lang="${loc.lang}"  ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
  }

  const assets = copyDir(join(ROOT, 'assets'), join(dist, 'assets'));
  writeFileSync(join(dist, 'sitemap.xml'), sitemap(), 'utf8');
  writeFileSync(join(dist, 'robots.txt'), robots(), 'utf8');
  writeFileSync(join(dist, 'CNAME'), 'makaritskaya.pp.ua\n', 'utf8');
  writeFileSync(join(dist, '.nojekyll'), '', 'utf8');
  console.log(`  assets: ${assets} files`);
  console.log(`  sitemap.xml, robots.txt, CNAME, .nojekyll`);

  if (todos.length) {
    console.log(`\n  ${todos.length} string(s) still marked TODO - drafts are published as-is:`);
    for (const t of todos) console.log(`    ${t}`);
  }
  // No dist/index.html on purpose: "/" is a single 301 to /ua/ at the Cloudflare
  // edge. A root page here would either add a hop or duplicate the Ukrainian one.
}

build();
