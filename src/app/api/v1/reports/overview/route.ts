import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSite } from '@/server/authz';
import { buildReport } from '@/server/reporting';
import { safely } from '@/server/http';
export const runtime='nodejs';
const options=z.object({
  siteId:z.string().uuid(),from:z.iso.date(),to:z.iso.date(),
  model:z.enum(['first_touch','last_non_direct_touch']).default('first_touch'),
  windowDays:z.coerce.number().pipe(z.union([z.literal(1),z.literal(7),z.literal(30)])).default(7),
});
export async function GET(req:NextRequest){return safely(async()=>{
  const p=options.parse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  await requireSite(p.siteId);
  return NextResponse.json(await buildReport(p),{headers:{'Cache-Control':'no-store'}});
});}
