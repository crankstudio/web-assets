import { allWorks } from '../../lib/data.mjs';
import { renderWork } from '../../lib/render.mjs';

export const getStaticPaths = () => allWorks.map((w) => ({ params: { slug: w.slug } }));
export const GET = ({ params }: { params: { slug: string } }) =>
  new Response(renderWork(params.slug), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
