import { render404 } from '../lib/render.mjs';
export const GET = () =>
  new Response(render404(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
