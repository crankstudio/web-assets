import { renderDirectory } from '../lib/render.mjs';
export const GET = () =>
  new Response(renderDirectory(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
