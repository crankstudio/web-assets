import { defineConfig } from 'astro/config';

// Static output. Pages are endpoints that emit exact .html files
// (e.g. /directory -> directory.html) which Cloudflare Pages/Netlify serve as clean URLs.
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
});
