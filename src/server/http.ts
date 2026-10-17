import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}
export function jsonError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ code: 'INVALID_INPUT', message: 'Request validation failed', details: error.issues.map(x => ({ path: x.path, message: x.message })) }, { status: 400 });
  return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Internal service error' }, { status: 500 });
}
export async function safely<T>(fn: () => Promise<T>) {
  try { return await fn(); } catch (err) { return jsonError(err); }
}
export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowed = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  if (!origin || origin !== new URL(allowed).origin) throw new ApiError(403, 'ORIGIN_REJECTED', 'Request origin is not allowed');
}
export function qs(request: NextRequest, key: string) { return request.nextUrl.searchParams.get(key); }
