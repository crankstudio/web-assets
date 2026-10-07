import { renderAbout } from '../lib/render.mjs';
export const GET = () =>
  new Response(renderAbout(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
