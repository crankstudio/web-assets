# Crank Studio site (Astro)

Static recreation of the Webflow site `crankstudio-montreal-design-agency`, exported from Webflow
and driven by plain JSON instead of the Webflow CMS.

## How it works
- `src/templates/*.html` — pages exactly as exported from Webflow (markup, classes, `data-w-id`
  interaction hooks). Webflow's CSS/JS lives in `public/css`, `public/js`.
- `src/content-data/works.json` — all projects (replaces the Works CMS collection).
- `src/content-data/site.json` — site-wide text (contact email, home copy).
- `src/lib/render.mjs` — fills the CMS slots in the templates at build time.
- `src/pages/*.html.ts` — one endpoint per page; output is `dist/<page>.html`
  (`/directory`, `/work/<slug>`, `/about`, …).

## Commands (run inside `site/`)
```
npm install
npm run fetch-assets   # one-time: download project images/videos from Webflow's CDN into public/work/
npm run dev            # or: npm run build && npm run preview
```
Run `fetch-assets` **before** launching: until then, images are hot-linked from Webflow's CDN.

## Add / edit a project
Add an object to `works.json` (copy an existing one), run `npm run fetch-assets`, build.

## Deploy (Cloudflare Pages)
Root directory `site`, build command `npm run build`, output directory `dist`.
