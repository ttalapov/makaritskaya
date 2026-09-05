#!/usr/bin/env node
// Static build: template + partials + content/<segment>.json -> dist/<segment>/index.html
// Plain Node, no dependencies, no framework, no i18n library.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

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

// Every icon on the site, in one place. Presentation, not copy: identical in
// every language, so content files carry only the key. 24x24, 1.5 stroke,
// currentColor - the container decides the colour.
const ICONS = {
  g1: '<circle cx="12" cy="12" r="2"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>',
  g2: '<path d="M4 19c0-4.5 3.5-6 7-6s7-1.5 7-6"/><circle cx="4" cy="19" r="1.8"/><circle cx="18" cy="7" r="1.8"/>',
  g3: '<path d="M3 8h9M17 8h4M3 16h5M13 16h8"/><circle cx="14.5" cy="8" r="2.2"/><circle cx="10.5" cy="16" r="2.2"/>',
  g4: '<path d="M8.5 4 5 6l-2 4 3 1.6V20h12v-8.4L21 10l-2-4-3.5-2a3.5 3.5 0 0 1-7 0Z"/>',
  g5: '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10.2V20h12v-9.8"/><path d="M10 20v-5h4v5"/>',
  g6: '<path d="M9 17V5.5l10-2V15"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  g7: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14H6.5A2.5 2.5 0 0 0 4 19.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H19v4H6.5A2.5 2.5 0 0 1 4 19.5Z"/><path d="M9 7.5h6"/>',
  cap:        '<path d="M12 4 2.5 8.5 12 13l9.5-4.5z"/><path d="M6 10.5v4.8c0 .5.3 1 .8 1.2 1.6.8 3.4 1.2 5.2 1.2s3.6-.4 5.2-1.2c.5-.2.8-.7.8-1.2v-4.8"/><path d="M21.5 8.5v5.2"/>',
  evidence:   '<path d="M6.5 3h8L19 7.5V21H6.5z"/><path d="M14.5 3v4.5H19"/><path d="m9.5 13.8 2 2 3.6-4.4"/>',
  family:     '<circle cx="8.4" cy="7.4" r="3"/><path d="M3.4 20v-1.6a5 5 0 0 1 10 0V20"/><circle cx="17.2" cy="11.2" r="2.2"/><path d="M13.8 20v-1.1a3.4 3.4 0 0 1 6.8 0V20"/>',
  chart:      '<path d="M4 20h16"/><path d="M7.5 20v-5.5M12 20v-9.5M16.5 20v-7.5"/><path d="m6 8.5 4.5-4 3.5 3L19 3"/>',
  globe:      '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5Z"/>',
  team:       '<circle cx="6.5" cy="6.8" r="2.5"/><circle cx="17.5" cy="6.8" r="2.5"/><circle cx="12" cy="17.2" r="2.5"/><path d="m8.6 8.7 2 6M15.4 8.7l-2 6M9 6.8h6"/>',
  shield:     '<path d="M12 3 5 5.9v5.6c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V5.9z"/>',
  pacifier:   '<circle cx="12" cy="5.6" r="2.7"/><path d="M12 8.3v2.4"/><path d="M5.6 10.7h12.8"/><circle cx="12" cy="15.7" r="4.4"/>',
  blocks:     '<rect x="8" y="3.3" width="8" height="8" rx="1.6"/><rect x="3.3" y="12.7" width="8" height="8" rx="1.6"/><rect x="12.7" y="12.7" width="8" height="8" rx="1.6"/>',
  backpack:   '<path d="M5.5 10A4.5 4.5 0 0 1 10 5.5h4A4.5 4.5 0 0 1 18.5 10v10.5h-13z"/><path d="M9.5 5.5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5"/><path d="M9.5 14h5"/>',
  adult:      '<circle cx="12" cy="7.4" r="3.6"/><path d="M5 20.6v-1a7 7 0 0 1 14 0v1"/>',
  phone:      '<path d="M6.4 3.5h3.1l1.5 3.9-2 1.5a11.2 11.2 0 0 0 5.1 5.1l1.5-2 3.9 1.5v3.1a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2Z"/>',
  instagram:  '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="16.9" cy="7.1" r=".9"/>',
  pin:        '<path d="M12 21s6.8-5.7 6.8-11A6.8 6.8 0 0 0 5.2 10c0 5.3 6.8 11 6.8 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock:      '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.9v5.4l3.3 2"/>',
  close:       '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
};
const ICON = (key) => {
  if (!(key in ICONS)) throw new Error(`unknown icon: ${key}`);
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ` +
    `stroke-linecap="round" stroke-linejoin="round">${ICONS[key]}</svg>`;
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
const RAW = new Set(['hreflangLinks', 'langSwitcher', 'langSwitcherMobile', 'arrowLg', 'arrowSm',
  'iconPhone', 'iconInstagram', 'iconPin', 'iconClock', 'iconClose']);

// ---------------------------------------------------------------------------
// blocks built from structured content
// ---------------------------------------------------------------------------
const renderStats = (stats) => stats.map((s) =>
  `      <div class="stat-item"><div class="stat-num">${esc(s.num)}</div><div class="stat-desc">${esc(s.desc)}</div></div>`
).join('\n');

const renderCreds = (creds) => creds.map((c) =>
  `      <div class="cred-item"><div class="cred-icon" aria-hidden="true">${ICON(c.icon)}</div>` +
  `<div class="cred-text"><strong>${esc(c.title)}</strong>${esc(c.desc)}</div></div>`
).join('\n');

const renderMethodGroups = (groups) => groups.map((g, i) => {
  const delay = i % 3 === 0 ? '' : ` reveal-delay-${i % 3}`;
  const items = g.items.map((x) => {
    const note = x.note ? ` <span class="method-note">${esc(x.note)}</span>` : '';
    const desc = x.desc ? `<span class="method-item-desc">${esc(x.desc)}</span>` : '';
    return `        <li><span class="method-item-name">${esc(x.name)}${note}</span>${desc}</li>`;
  }).join('\n');
  const svg = ICON(g.icon);
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
  `      <div class="feat-block"><div class="feat-icon" aria-hidden="true">${ICON(f.icon)}</div>` +
  `<div class="feat-title">${esc(f.title)}</div><div class="feat-desc">${esc(f.desc)}</div></div>`
).join('\n');

const renderWhoCards = (cards) => cards.map((c, i) => {
  const delay = i === 0 ? '' : ` reveal-delay-${i % 4}`;
  return `    <div class="who-card reveal${delay}"><div class="who-icon" aria-hidden="true">${ICON(c.icon)}</div>` +
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

/** One error page for the site, in the default language. */
/** Content hash in the filename: a changed asset is always a new URL, so a
 *  cached copy can never shadow a fix, and an unchanged one stays cached. */
function fingerprint(dist, relPath) {
  const abs = join(dist, relPath);
  const body = readFileSync(abs);
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 8);
  const dot = relPath.lastIndexOf('.');
  const hashed = `${relPath.slice(0, dot)}.${hash}${relPath.slice(dot)}`;
  // copy rather than move: pages cached before this deploy still reference the
  // unhashed path, and an unstyled page is worse than a stale one
  copyFileSync(abs, join(dist, hashed));
  return '/' + hashed.split(sep).join('/');
}

function renderNotFound(skeleton, partials, cssHref, jsHref) {
  const loc = DEFAULT_LOCALE;
  const c = walk(JSON.parse(readFileSync(join(ROOT, 'content', `${loc.segment}.json`), 'utf8')), loc.segment);
  return fill(skeleton, {
    ...c,
    cssHref,
    jsHref,
    lang: loc.lang,
    homeUrl: `/${loc.segment}/`,
    langSwitcher: langSwitcher(loc),
    arrowLg: ARROW(16),
    arrowSm: ARROW(14),
    phoneHref: c.contact.phone.replace(/[^\d+]/g, ''),
  });
}

function build() {
  const dist = join(ROOT, 'dist');
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  const template = readFileSync(join(ROOT, 'src', 'template.html'), 'utf8');
  const partials = readPartials();
  const skeleton = inlinePartials(template, partials);
  const skeleton_404 = inlinePartials(readFileSync(join(ROOT, 'src', '404.html'), 'utf8'), partials);

  const assets = copyDir(join(ROOT, 'assets'), join(dist, 'assets'));
  const cssHref = fingerprint(dist, join('assets', 'css', 'style.css'));
  const jsHref = fingerprint(dist, join('assets', 'js', 'main.js'));

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
      cssHref,
      jsHref,
      canonical: urlFor(loc),
      homeUrl: `/${DEFAULT_LOCALE.segment}/`,
      hreflangLinks: hreflangLinks(loc),
      langSwitcher: langSwitcher(loc),
      langSwitcherMobile: langSwitcher(loc, ' mobile-lang'),
      iconClose: ICON('close'),
      iconPhone: ICON('phone'),
      iconInstagram: ICON('instagram'),
      iconPin: ICON('pin'),
      iconClock: ICON('clock'),
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

  // GitHub Pages serves /404.html for any unmatched path, at any depth, so it
  // lives at the root and every asset path in it must be absolute. Rendered
  // from the default locale: there is only one error page for the whole site.
  const nf = renderNotFound(skeleton_404, partials, cssHref, jsHref);
  writeFileSync(join(dist, '404.html'), nf, 'utf8');
  console.log(`  /404.html          ${(Buffer.byteLength(nf) / 1024).toFixed(1)} KB`);

  writeFileSync(join(dist, 'sitemap.xml'), sitemap(), 'utf8');
  writeFileSync(join(dist, 'robots.txt'), robots(), 'utf8');
  writeFileSync(join(dist, 'CNAME'), 'makaritskaya.pp.ua\n', 'utf8');
  writeFileSync(join(dist, '.nojekyll'), '', 'utf8');
  console.log(`  assets: ${assets} files`);
  console.log(`  ${cssHref}`);
  console.log(`  ${jsHref}`);
  console.log(`  sitemap.xml, robots.txt, CNAME, .nojekyll`);

  if (todos.length) {
    console.log(`\n  ${todos.length} string(s) still marked TODO - drafts are published as-is:`);
    for (const t of todos) console.log(`    ${t}`);
  }
  // No dist/index.html on purpose: "/" is a single 301 to /ua/ at the Cloudflare
  // edge. A root page here would either add a hop or duplicate the Ukrainian one.
}

build();
