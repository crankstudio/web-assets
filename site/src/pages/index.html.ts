import { renderHome } from '../lib/render.mjs';
export const GET = () =>
  new Response(renderHome(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
