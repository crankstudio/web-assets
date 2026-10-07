// Renders the pages exported from Webflow (src/templates/*.html), filling the CMS-driven
// parts from src/content-data/works.json. Everything outside the CMS slots (markup, CSS
// classes, data-w-id interaction hooks) is left exactly as Webflow exported it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { allWorks, categoryNames, asset, nextWork, site } from './data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (name) =>
  cheerio.load(fs.readFileSync(path.join(root, 'src/templates', name), 'utf8'));

const workHref = (w) => `/work/${w.slug}`;
const linkable = (w) => !w.comingSoon;

/** Fix up paths/links that Webflow exports as relative file paths. */
function common($, { title } = {}) {
  $('link[href]').each((_, el) => {
    const h = $(el).attr('href');
    if (/^(css|images)\//.test(h)) $(el).attr('href', '/' + h);
  });
  $('script[src]').each((_, el) => {
    const s = $(el).attr('src');
    if (/^js\//.test(s)) $(el).attr('src', '/' + s);
    if (/jsdelivr\.net\/npm\/gsap@[^/]+\/dist\/(gsap|ScrambleTextPlugin)\.min\.js/.test(s)) {
      $(el).attr('src', '/js/' + s.split('/').pop());
    }
    if (/cloudfront\.net\/js\/jquery/.test(s)) {
      $(el).attr('src', '/js/jquery.min.js').removeAttr('integrity').removeAttr('crossorigin');
    }
  });
  $('img[src^="images/"]').each((_, el) => $(el).attr('src', '/' + $(el).attr('src')));
  $('img[srcset]').each((_, el) =>
    $(el).attr('srcset', $(el).attr('srcset').replace(/(^|,\s*)images\//g, '$1/images/')),
  );
  $('source[src^="videos/"]').each((_, el) => $(el).attr('src', '/' + $(el).attr('src')));
  $('video[poster^="videos/"]').each((_, el) => $(el).attr('poster', '/' + $(el).attr('poster')));
  $('[data-poster-url^="videos/"]').each((_, el) =>
    $(el).attr('data-poster-url', '/' + $(el).attr('data-poster-url')),
  );
  $('[data-video-urls]').each((_, el) =>
    $(el).attr(
      'data-video-urls',
      $(el).attr('data-video-urls').replace(/(^|,)videos\//g, '$1/videos/'),
    ),
  );

  $('a[href="index.html"]').attr('href', '/');
  $('a[href="about.html"]').attr('href', '/about');
  $('a[href="directory.html"]').attr('href', '/directory');
  $('link[rel="prefetch"][href="/"]').remove();
  // Template leftovers: footer credit pointed at the template author's store.
  $('a[href="https://specimen.studio/store"]').attr('href', '/');
  // Unused when there are no CMS items to show.
  $('.w-dyn-empty').remove();
  if (title) {
    $('title').text(title);
    $('meta[property="og:title"], meta[name="twitter:title"]').attr('content', title);
  }
  $.root().contents().filter((_, n) => n.type === 'comment').remove();
  return $;
}

const html = ($) => $.html();

/** Fill an <img> that Webflow exported as an empty CMS binding. */
function fillImg($img, src, alt) {
  $img.attr('src', asset(src)).attr('alt', alt || '').removeClass('w-dyn-bind-empty');
  $img.removeAttr('srcset').removeAttr('sizes');
}
function fillText($el, text) {
  $el.text(text).removeClass('w-dyn-bind-empty');
}

// ---------- Home ----------
export function renderHome() {
  const $ = common(load('index.html'), { title: site.home.seoTitle });
  let g = 0;
  $('.track > .home-overview-wrapper').each((_, row) => {
    $(row)
      .find('.overview-collection-list-wrapper')
      .each((_, list) => {
        const w = allWorks[g % allWorks.length];
        g++;
        const $card = $(list).find('.overview-card').first();
        fillImg($card.find('img').first(), w.thumbnail, w.name);
        fillText($card.find('.card-label p').first(), w.numberLabel);
        const titles = $card.find('.hover-title h2');
        fillText(titles.eq(0), w.name);
        fillText(titles.eq(1), w.description);
        if (linkable(w)) {
          $card.append(
            `<a href="${workHref(w)}" aria-label="${w.name}" style="position:absolute;inset:0;z-index:5"></a>`,
          );
        }
      });
  });
  return html($);
}

// ---------- Directory ----------
export function renderDirectory() {
  const $ = common(load('directory.html'), { title: 'Directory | Crank Studio' });
  // nav: "Overview / Index" — Index is this page; Journal has no entries so drop it.
  $('.nav-wrapper .w-dyn-item a').attr('href', '/directory');
  $('.nav-link-wrapper.is-nav').remove();
  $('a[href^="mailto:"]').attr('href', `mailto:${site.contactEmail}`);

  const $list = $('.project-wrapper');
  const $tpl = $list.children('.w-dyn-item').first();
  $list.empty();
  allWorks.forEach((w, i) => {
    const $item = $tpl.clone();
    // Webflow grid-node ids must be unique per item
    $item.attr('id', `w-node-work-${i}`);
    const $a = $item.find('a.scramble-text');
    $a.attr('href', linkable(w) ? workHref(w) : '#');
    fillImg($a.find('img'), w.thumbnail, w.name);
    const hover = $a.find('.archive-hover > div');
    fillText(hover.eq(0), w.numberLabel);
    fillText(hover.eq(1), w.name);
    $list.append($item);
  });
  return html($);
}

// ---------- Work (project) ----------
export function renderWork(slug) {
  const w = allWorks.find((x) => x.slug === slug);
  const $ = common(load('detail_work.html'), { title: `${w.name} | Crank Studio` });

  const gallery = w.images.length ? w.images : [w.mainImage, w.thumbnail];

  // Hero carousel: each strip holds 8 blocks; rotate the gallery so strips differ.
  $('.carrousel').each((ci, strip) => {
    $(strip)
      .find('.carrousel-block img')
      .each((bi, img) => {
        fillImg($(img), gallery[(bi + ci * 3) % gallery.length], w.name);
      });
  });

  $('.fit-title').text(w.name);
  $('.next-lightbox a').attr('href', workHref(nextWork(slug)));
  $('.nav-close-lightbox a').attr('href', '/');

  const cats = w.categories.map((c) => categoryNames[c]).join(', ');
  const info = $('.use-case-body .is-use-case p');
  fillText(info.eq(0), w.description);
  fillText(info.eq(1), cats || w.numberLabel);

  // Slider: rebuild slides from this project's media.
  const $slides = $('.w-slider-mask > .w-slide');
  const $videoTpl = $slides.eq(0).clone();
  const $imageTpl = $slides.eq(2).clone();
  const media = [
    ...w.videos.map((v) => ({ video: v })),
    ...gallery.map((src) => ({ src })),
  ];
  const mask = $('.w-slider-mask').empty();
  media.forEach((m, i) => {
    const $s = (m.video ? $videoTpl : $imageTpl).clone();
    const counter = $s.find('.link-padding.is-flex p');
    counter.eq(0).text(`${i + 1}/`);
    fillText(counter.eq(1), String(media.length));
    if (m.video) {
      const srcs = $s.find('video source');
      srcs.filter('[type="video/webm"]').attr('src', asset(m.video.webm));
      srcs.filter('[type="video/mp4"]').attr('src', asset(m.video.mp4));
    } else {
      fillImg($s.find('img'), m.src, `${w.name} ${i + 1}`);
    }
    mask.append($s);
  });
  return html($);
}

// ---------- Static pages ----------
export function renderAbout() {
  const $ = common(load('about.html'), { title: 'About | Crank Studio' });
  // Drop template-only blocks (Éponyme licence/style-guide/store links, empty CMS "Services",
  // and the placeholder "Selected Client" list of big brands — not Crank's clients).
  $('.studio-block').each((_, el) => {
    const label = $(el).find('.studio-label').text();
    if (/\(Template\)|\(Services\)|\(Selected Client\)/.test(label)) $(el).remove();
  });
  // Placeholder Instagram handle from the template; add the real one back when known.
  $('a[href*="instagram.com/specimen"]').closest('p').remove();
  $('a[href^="admin/"]').remove();
  $('a[href^="mailto:"]').attr('href', `mailto:${site.contactEmail}`).text(site.contactEmail);
  return html($);
}

export function render404() {
  return html(common(load('404.html'), { title: 'Not Found | Crank Studio' }));
}
export function renderVideos() {
  return html(common(load('videos.html'), { title: 'Videos | Crank Studio' }));
}
export { allWorks };
