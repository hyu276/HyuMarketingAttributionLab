import { NextRequest, NextResponse } from 'next/server';
import { and, eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { sites, visitors, sessions, events, touchpoints, campaigns } from '@/db/schema';
import { jsonError, ApiError } from '@/server/http';
export const runtime='nodejs';
const allowedNames=['page_view','view_item','add_to_cart','begin_checkout'] as const;
const schema=z.object({
  site_key:z.string().min(10).max(120),event_id:z.string().uuid(),
  visitor_id:z.string().uuid(), session_id:z.string().uuid(),
  event_name:z.enum(allowedNames), occurred_at:z.string().datetime({offset:true}),
  page_path:z.string().max(512).regex(/^\/(?!\/)/),
  consent:z.object({analytics:z.literal(true),policy_version:z.string().max(40)}),
  utm:z.object({source:z.string().max(120).optional(),medium:z.string().max(120).optional(),
    campaign:z.string().max(120).optional(),id:z.string().max(120).optional()}).optional(),
  properties:z.record(z.string().max(50),z.union([z.string().max(150),z.number(),z.boolean()])).optional(),
});
const recent=new Map<string,{count:number;reset:number}>();
function throttle(key:string){
  const now=Date.now();const value=recent.get(key);
  if(!value||value.reset<now){recent.set(key,{count:1,reset:now+60000});return;}
  value.count++;
  if(value.count>180)throw new ApiError(429,'RATE_LIMIT','Too many events');
  if(recent.size>5000)recent.clear();
}
function allowOrigin(origin:string|null,domains:string[]) {
  if(!origin) return false;
  try {
    const parsed=new URL(origin);
    return (parsed.protocol==='https:'||parsed.hostname==='localhost')
      && domains.includes(parsed.hostname);
  }catch{return false;}
}
async function lookup(siteKey:string) {
  return (await db().select().from(sites).where(eq(sites.publicKey,siteKey)).limit(1))[0];
}
export async function OPTIONS(req:NextRequest){
  try {
    const key=req.nextUrl.searchParams.get('site_key')||'';
    const site=await lookup(key);
    const origin=req.headers.get('origin');
    if(!site?.active||!allowOrigin(origin,site.domains))return new NextResponse(null,{status:403});
    return new NextResponse(null,{status:204,headers:{
      'Access-Control-Allow-Origin':origin!,
      'Access-Control-Allow-Methods':'POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type',
      'Vary':'Origin',
      'Access-Control-Max-Age':'600',
    }});
  }catch{return new NextResponse(null,{status:503});}
}
export async function POST(req:NextRequest){
  try{
    if(Number(req.headers.get('content-length')||0)>8192)throw new ApiError(413,'TOO_LARGE','Event exceeds size limit');
    const body=await req.text();
    if(body.length>8192)throw new ApiError(413,'TOO_LARGE','Event exceeds size limit');
    let parsed:unknown;
    try{parsed=JSON.parse(body);}catch{throw new ApiError(400,'INVALID_JSON','Malformed event payload');}
    const input=schema.parse(parsed);
    const site=await lookup(input.site_key);
    const origin=req.headers.get('origin');
    if(!site?.active||!allowOrigin(origin,site.domains))throw new ApiError(403,'SITE_ORIGIN','Site or allowed origin not found');
    throttle(site.id);
    if(Math.abs(Date.now()-Date.parse(input.occurred_at))>5*60*1000)throw new ApiError(400,'CLOCK_SKEW','Event timestamp exceeds allowed skew');
    // Browser consent assertion is not independently verified: caller is untrusted telemetry only.
    const result=await db().transaction(async(tx)=>{
      const [duplicate]=await tx.select({id:events.id}).from(events).where(and(eq(events.siteId,site.id),eq(events.eventId,input.event_id))).limit(1);
      if(duplicate)return {duplicate:true};
      let [visitor]=await tx.select().from(visitors).where(and(eq(visitors.siteId,site.id),eq(visitors.anonId,input.visitor_id))).limit(1);
      if(!visitor) [visitor]=await tx.insert(visitors).values({siteId:site.id,anonId:input.visitor_id}).onConflictDoNothing().returning();
      if(!visitor)[visitor]=await tx.select().from(visitors).where(and(eq(visitors.siteId,site.id),eq(visitors.anonId,input.visitor_id))).limit(1);
      let [session]=await tx.select().from(sessions).where(eq(sessions.id,input.session_id)).limit(1);
      if(session && (session.siteId!==site.id || session.visitorId!==visitor.id))throw new ApiError(400,'SESSION_MISMATCH','Invalid session reference');
      const when=new Date(input.occurred_at);
      if(session && (when.getTime()-session.lastSeenAt.getTime()>30*60*1000 || when<session.startedAt))
        throw new ApiError(400,'SESSION_EXPIRED','Create a new session after inactivity');
      if(!session)[session]=await tx.insert(sessions).values({id:input.session_id,siteId:site.id,visitorId:visitor.id,startedAt:when,lastSeenAt:when}).returning();
      else if(when>session.lastSeenAt)await tx.update(sessions).set({lastSeenAt:when}).where(eq(sessions.id,session.id));
      const inserted=await tx.insert(events).values({siteId:site.id,eventId:input.event_id,visitorId:visitor.id,
        sessionId:session.id,eventName:input.event_name,occurredAt:when,path:input.page_path,
        properties:input.properties??{}}).onConflictDoNothing().returning({id:events.id});
      if(!inserted.length)return {duplicate:true};
      if(input.event_name==='page_view'){
        const utm=input.utm;
        const [campaign]=utm?.id ? await tx.select().from(campaigns).where(and(eq(campaigns.siteId,site.id),eq(campaigns.utmId,utm.id))).limit(1) : [];
        await tx.insert(touchpoints).values({siteId:site.id,visitorId:visitor.id,sessionId:session.id,
          campaignId:campaign?.id??null,source:utm?.source??null,medium:utm?.medium??null,
          isDirect:!utm?.source,occurredAt:when});
      }
      return {duplicate:false};
    });
    return NextResponse.json({accepted:true,...result},{headers:{'Access-Control-Allow-Origin':origin!,'Vary':'Origin','Cache-Control':'no-store'}});
  }catch(error){
    const response=jsonError(error);
    return response;
  }
}
