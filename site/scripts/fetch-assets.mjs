// Downloads every project image/video referenced in works.json into public/work/
// so the site no longer depends on Webflow's CDN. Safe to re-run (skips existing files).
//   npm run fetch-assets
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { works } = JSON.parse(fs.readFileSync(path.join(root, 'src/content-data/works.json'), 'utf8'));
const out = path.join(root, 'public/work');
fs.mkdirSync(out, { recursive: true });

const urls = new Set();
for (const w of works) {
  urls.add(w.mainImage);
  urls.add(w.thumbnail);
  w.images.forEach((u) => urls.add(u));
  w.videos.forEach((v) => { urls.add(v.mp4); urls.add(v.webm); });
}

let ok = 0, skipped = 0, failed = 0;
for (const url of [...urls].filter(Boolean)) {
  const name = decodeURIComponent(url).split('/').pop();
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) { skipped++; continue; }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    ok++;
    console.log('saved', name);
  } catch (e) {
    failed++;
    console.error('FAILED', url, e.message);
  }
}
console.log(`done: ${ok} downloaded, ${skipped} already present, ${failed} failed`);
process.exit(failed ? 1 : 0);
