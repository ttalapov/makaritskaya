#!/usr/bin/env node
// Local preview of dist/. Plain Node, no dependencies.
// "/" maps to the default locale here only for convenience — in production that
// redirect is a single 301 at the Cloudflare edge, not a rewrite.

import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 8777;
const ROOT = 'dist';
const DEFAULT_SEGMENT = 'ua';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);

  if (path === '/') {
    res.writeHead(301, { Location: `/${DEFAULT_SEGMENT}/` });
    return res.end();
  }

  let file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    statSync(file);
  } catch {
    // same as GitHub Pages: unmatched paths get 404.html with a 404 status
    try {
      const body = readFileSync(join(ROOT, '404.html'));
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404');
    }
  }

  res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`  http://localhost:${PORT}/${DEFAULT_SEGMENT}/`);
});
