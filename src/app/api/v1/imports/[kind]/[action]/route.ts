import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSite } from '@/server/authz';
import { ApiError, requireSameOrigin, safely } from '@/server/http';
import { commitImport, previewImport, type ImportKind } from '@/server/imports';
export const runtime='nodejs';
const payload=z.object({siteId:z.string().uuid(),csv:z.string().min(1).max(1000000),digest:z.string().length(64).optional()});
export async function POST(req:NextRequest,{params}:{params:Promise<{kind:string;action:string}>}){return safely(async()=>{
  requireSameOrigin(req);
  const {kind,action}=await params;
  if(kind!=='orders'&&kind!=='spend')throw new ApiError(404,'NOT_FOUND','Unknown import');
  if(action!=='preview'&&action!=='commit')throw new ApiError(404,'NOT_FOUND','Unknown operation');
  const input=payload.parse(await req.json());await requireSite(input.siteId,true);
  if(action==='preview')return NextResponse.json(previewImport(kind as ImportKind,input.csv));
  if(!input.digest)throw new ApiError(400,'MISSING_DIGEST','Preview the CSV first');
  return NextResponse.json(await commitImport(input.siteId,kind as ImportKind,input.csv,input.digest));
});}
