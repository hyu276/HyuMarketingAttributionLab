import { headers } from 'next/headers';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/server/auth';
import { db } from '@/db/client';
import { memberships, sites } from '@/db/schema';
import { ApiError } from '@/server/http';

export async function requireUser() {
  const current = await auth.api.getSession({ headers: await headers() });
  if (!current?.user) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in required');
  return current.user;
}
export async function requireMembership(workspaceId: string, write = false) {
  const user = await requireUser();
  const [member] = await db().select().from(memberships)
    .where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, user.id))).limit(1);
  if (!member) throw new ApiError(403, 'WORKSPACE_DENIED', 'Workspace access denied');
  if (write && member.role !== 'admin') throw new ApiError(403, 'READ_ONLY', 'Admin role required');
  return member;
}
export async function requireSite(siteId: string, write = false) {
  const [site] = await db().select().from(sites).where(eq(sites.id, siteId)).limit(1);
  if (!site) throw new ApiError(404, 'SITE_NOT_FOUND', 'Site not found');
  await requireMembership(site.workspaceId, write);
  return site;
}
