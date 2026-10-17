import {and,eq} from 'drizzle-orm';
import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {db} from '@/db/client';
import {user} from '@/db/auth-schema';
import {memberships} from '@/db/schema';
import {requireMembership} from '@/server/authz';
import {requireSameOrigin,safely} from '@/server/http';
export const runtime='nodejs';
const schema=z.object({workspaceId:z.string().uuid(),email:z.string().email(),role:z.enum(['admin','analyst'])});
export async function GET(req:NextRequest){return safely(async()=>{
  const id=z.string().uuid().parse(req.nextUrl.searchParams.get('workspaceId'));
  await requireMembership(id,true);
  const rows=await db().select({userId:user.id,email:user.email,name:user.name,role:memberships.role})
    .from(memberships).innerJoin(user,eq(user.id,memberships.userId)).where(eq(memberships.workspaceId,id));
  return NextResponse.json({members:rows});
});}
export async function POST(req:NextRequest){return safely(async()=>{
  requireSameOrigin(req);
  const data=schema.parse(await req.json());
  await requireMembership(data.workspaceId,true);
  const [u]=await db().select({id:user.id}).from(user).where(eq(user.email,data.email.toLowerCase())).limit(1);
  if(!u)return NextResponse.json({code:'USER_NOT_FOUND',message:'This email must sign up locally before being added'},{status:404});
  const [existing]=await db().select().from(memberships)
    .where(and(eq(memberships.workspaceId,data.workspaceId),eq(memberships.userId,u.id))).limit(1);
  if(existing)return NextResponse.json({code:'ALREADY_MEMBER',message:'User already has membership'},{status:409});
  await db().insert(memberships).values({workspaceId:data.workspaceId,userId:u.id,role:data.role});
  return NextResponse.json({added:true},{status:201});
});}
