import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { campaigns } from '@/db/schema';
import { db } from '@/db/client';
import { requireSite } from '@/server/authz';
import { qs, requireSameOrigin, safely } from '@/server/http';
import { normalizeUtm } from '@/domain/utm';
export const runtime='nodejs';
const campaignInput=z.object({
  siteId:z.string().uuid(),
  utmId:z.string().min(1).max(120),
  name:z.string().trim().min(2).max(160),
  source:z.string().min(1).max(120),
  medium:z.string().min(1).max(120),
});
export async function GET(req:NextRequest){return safely(async()=>{
  const siteId=z.string().uuid().parse(qs(req,'siteId'));
  await requireSite(siteId);
  return NextResponse.json({campaigns:await db().select().from(campaigns).where(eq(campaigns.siteId,siteId))});
});}
export async function POST(req:NextRequest){return safely(async()=>{
  requireSameOrigin(req);
  const input=campaignInput.parse(await req.json());
  await requireSite(input.siteId,true);
  const utmId=normalizeUtm(input.utmId),source=normalizeUtm(input.source),medium=normalizeUtm(input.medium);
  if(!utmId||!source||!medium) return NextResponse.json({code:'INVALID_UTM',message:'Invalid UTM name'},{status:400});
  const [already]=await db().select({id:campaigns.id}).from(campaigns).where(and(eq(campaigns.siteId,input.siteId),eq(campaigns.utmId,utmId))).limit(1);
  if(already) return NextResponse.json({code:'DUPLICATE_UTM',message:'Campaign ID already exists on this site'},{status:409});
  const [campaign]=await db().insert(campaigns).values({...input,utmId,source,medium}).returning();
  return NextResponse.json({campaign},{status:201});
});}
