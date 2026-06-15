// Minimal dependency-free static server for the HookOS Pro handoff prototype.
// Usage: node scripts/serve-handoff.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = 'C:/Users/avone/Downloads/Launchpad v4 (18)/handoff-pro/prototype';
const PORT = Number(process.argv[2]) || 4178;
const INDEX = 'HookOS Pro.html';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = url === '/' ? INDEX : url.replace(/^\/+/, '');
    const filePath = normalize(join(ROOT, rel));
    if (!filePath.startsWith(normalize(ROOT))) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => {
  console.log(`HookOS Pro prototype → http://localhost:${PORT}/`);
});
