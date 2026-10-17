import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import {checkoutLinks,sites,visitors} from '@/db/schema';
import { ApiError,safely } from '@/server/http';
export const runtime='nodejs';
const inputSchema=z.object({siteId:z.string().uuid(),visitorId:z.string().uuid()});
export async function POST(req:NextRequest){return safely(async()=>{
  const secret=process.env.CHECKOUT_SERVER_KEY;
  const given=req.headers.get('authorization')?.replace(/^Bearer /,'') ?? '';
  if(!secret || secret.length<32 || given.length!==secret.length || !timingSafeEqual(Buffer.from(given),Buffer.from(secret)))
    throw new ApiError(401,'SERVER_AUTH_REQUIRED','Trusted checkout backend credential required');
  const input=inputSchema.parse(await req.json());
  const [site]=await db().select({id:sites.id}).from(sites).where(eq(sites.id,input.siteId)).limit(1);
  const [visitor]=await db().select({id:visitors.id}).from(visitors).where(and(eq(visitors.id,input.visitorId),eq(visitors.siteId,input.siteId))).limit(1);
  if(!site||!visitor)throw new ApiError(404,'NOT_FOUND','Site or consenting visitor not found');
  const token=randomBytes(32).toString('base64url');
  const [record]=await db().insert(checkoutLinks).values({siteId:input.siteId,visitorId:input.visitorId,tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+15*60*1000)}).returning({id:checkoutLinks.id});
  return NextResponse.json({checkoutToken:token,linkId:record.id,expiresInSeconds:900},{status:201,headers:{'Cache-Control':'no-store'}});
});}
