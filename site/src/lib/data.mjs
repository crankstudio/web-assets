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
  return url;
}

export function nextWork(slug) {
  const i = allWorks.findIndex((w) => w.slug === slug);
  return allWorks[(i + 1) % allWorks.length];
}
