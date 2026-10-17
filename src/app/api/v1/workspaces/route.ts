import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memberships, workspaces } from '@/db/schema';
import { db } from '@/db/client';
import { requireUser } from '@/server/authz';
import { requireSameOrigin, safely } from '@/server/http';
export const runtime = 'nodejs';

const create = z.object({ name: z.string().trim().min(2).max(120) });
export async function GET() { return safely(async () => {
  const user = await requireUser();
  const rows = await db().select({ id: workspaces.id, name:workspaces.name, timezone:workspaces.timezone, currency:workspaces.currency, role:memberships.role })
    .from(memberships).innerJoin(workspaces,eq(workspaces.id,memberships.workspaceId))
    .where(eq(memberships.userId,user.id));
  return NextResponse.json({ workspaces: rows });
});}
export async function POST(req:NextRequest) { return safely(async () => {
  requireSameOrigin(req);
  const user = await requireUser();
  const input = create.parse(await req.json());
  const workspace = await db().transaction(async (tx) => {
    const [created] = await tx.insert(workspaces).values({name:input.name}).returning();
    await tx.insert(memberships).values({ workspaceId:created.id, userId:user.id, role:'admin' });
    return created;
  });
  return NextResponse.json({ workspace }, {status:201});
});}
