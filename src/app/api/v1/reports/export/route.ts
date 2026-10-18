import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSite } from '@/server/authz';
import { buildReport,reportCsv } from '@/server/reporting';
import { safely } from '@/server/http';
export const runtime='nodejs';
export async function GET(req:NextRequest){return safely(async()=>{
  const p=z.object({siteId:z.string().uuid(),from:z.iso.date(),to:z.iso.date(),
    model:z.enum(['first_touch','last_non_direct_touch']).default('first_touch'),
    windowDays:z.coerce.number().pipe(z.union([z.literal(1),z.literal(7),z.literal(30)])).default(7)})
    .parse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  await requireSite(p.siteId);
  const report=await buildReport(p);
  const rows=report.orders.map(o=>({orderId:o.orderId,occurredAt:o.occurredAt,status:o.status,
    netRevenueVnd:o.netRevenueVnd,sourceLabel:o.sourceLabel,attributionBasis:o.attribution.basis}));
  return new NextResponse(reportCsv(rows),{headers:{
    'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="mal-report.csv"',
    'Cache-Control':'no-store',
  }});
});}
