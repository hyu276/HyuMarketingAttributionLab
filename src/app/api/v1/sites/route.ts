import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sites } from '@/db/schema';
import { db } from '@/db/client';
import { requireMembership } from '@/server/authz';
import { qs, requireSameOrigin, safely } from '@/server/http';
export const runtime = 'nodejs';

const payload = z.object({
  workspaceId:z.string().uuid(),
  name:z.string().trim().min(2).max(120),
  domain:z.string().trim().max(255).refine(x=>!x || (/^[a-z0-9.-]+$/i.test(x) && !x.includes('..')), 'Invalid hostname'),
});
export async function GET(req:NextRequest) {return safely(async()=>{
  const workspaceId=z.string().uuid().parse(qs(req,'workspaceId'));
  await requireMembership(workspaceId);
  const rows=await db().select().from(sites).where(eq(sites.workspaceId,workspaceId));
  return NextResponse.json({sites:rows});
});}
export async function POST(req:NextRequest){return safely(async()=>{
  requireSameOrigin(req);const input=payload.parse(await req.json());
  await requireMembership(input.workspaceId,true);
  const [site]=await db().insert(sites).values({
    workspaceId:input.workspaceId,name:input.name,publicKey:'site_'+randomBytes(24).toString('hex'),
    domains: input.domain?[input.domain]:[],
  }).returning();
  return NextResponse.json({site},{status:201});
});}
