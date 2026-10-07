import { renderVideos } from '../lib/render.mjs';
export const GET = () =>
  new Response(renderVideos(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
