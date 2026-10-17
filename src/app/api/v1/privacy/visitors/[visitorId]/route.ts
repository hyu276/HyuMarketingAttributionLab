import { and,eq } from 'drizzle-orm';
import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import { events, touchpoints, sessions, visitors, checkoutLinks, orders, auditLogs, deletionRequests } from '@/db/schema';
import { requireSite } from '@/server/authz';
import { requireSameOrigin,safely,ApiError } from '@/server/http';
export const runtime='nodejs';
export async function DELETE(req:NextRequest,{params}:{params:Promise<{visitorId:string}>}){return safely(async()=>{
  requireSameOrigin(req);
  const visitorId=z.string().uuid().parse((await params).visitorId);
  const siteId=z.string().uuid().parse(req.nextUrl.searchParams.get('siteId'));
  const site=await requireSite(siteId,true);
  const [visitor]=await db().select().from(visitors).where(and(eq(visitors.id,visitorId),eq(visitors.siteId,siteId))).limit(1);
  if(!visitor)throw new ApiError(404,'VISITOR_NOT_FOUND','No such consented visitor in site');
  await db().transaction(async tx=>{
    const links=await tx.select({id:checkoutLinks.id}).from(checkoutLinks).where(and(eq(checkoutLinks.siteId,siteId),eq(checkoutLinks.visitorId,visitorId)));
    for(const link of links)await tx.update(orders).set({checkoutLinkId:null}).where(and(eq(orders.siteId,siteId),eq(orders.checkoutLinkId,link.id)));
    await tx.delete(checkoutLinks).where(and(eq(checkoutLinks.siteId,siteId),eq(checkoutLinks.visitorId,visitorId)));
    await tx.delete(events).where(and(eq(events.siteId,siteId),eq(events.visitorId,visitorId)));
    await tx.delete(touchpoints).where(and(eq(touchpoints.siteId,siteId),eq(touchpoints.visitorId,visitorId)));
    await tx.delete(sessions).where(and(eq(sessions.siteId,siteId),eq(sessions.visitorId,visitorId)));
    await tx.delete(visitors).where(and(eq(visitors.siteId,siteId),eq(visitors.id,visitorId)));
    await tx.insert(deletionRequests).values({siteId,status:'complete',completedAt:new Date()});
    await tx.insert(auditLogs).values({workspaceId:site.workspaceId,action:'privacy.delete_visitor',
      metadata:{siteId,method:'admin_request'}});
  });
  return NextResponse.json({deleted:true,ordersPreserved:true,attributionLinkageRemoved:true});
});}
