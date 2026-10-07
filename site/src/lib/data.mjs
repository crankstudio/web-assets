import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

export const works = JSON.parse(
  fs.readFileSync(path.join(root, 'src/content-data/works.json'), 'utf8'),
);
export const site = JSON.parse(
  fs.readFileSync(path.join(root, 'src/content-data/site.json'), 'utf8'),
);

export const categoryNames = works.categories;
export const allWorks = [...works.works].sort((a, b) => a.number - b.number);

/** Local filename a remote Webflow CDN asset is saved under (see scripts/fetch-assets.mjs). */
export function localName(url) {
  const last = decodeURIComponent(url).split('/').pop();
  return last;
}

/**
 * Returns /work/<file> if the asset has been downloaded into public/work,
 * otherwise the original CDN url (so the site still renders before fetch-assets is run).
 */
export function asset(url) {
  if (!url) return url;
  const name = localName(url);
  if (fs.existsSync(path.join(root, 'public/work', name))) {
    return '/work/' + encodeURIComponent(name).replace(/%2F/g, '/');
  }
  if (process.env.PLACEHOLDER_IMAGES && !/\.(mp4|webm)$/i.test(name)) {
    // Preview-only: neutral tile when the real image isn't available locally.
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const g = 150 + (h % 70);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Crect width='4' height='5' fill='rgb(${g},${g},${g})'/%3E%3C/svg%3E`;
  }
  return url;
}

export function nextWork(slug) {
  const i = allWorks.findIndex((w) => w.slug === slug);
  return allWorks[(i + 1) % allWorks.length];
}
