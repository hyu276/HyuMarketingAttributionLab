import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import * as authSchema from '@/db/auth-schema';

const url = process.env.DATABASE_URL;
if (!url && process.env.NEXT_PHASE !== 'phase-production-build') {
  // Fail closed if an endpoint accesses the database without configuration.
}

let dbInstance: ReturnType<typeof makeDb> | undefined;
function makeDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for database operations');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30000 });
  return drizzle(pool, { schema: { ...schema, ...authSchema } });
}
export function db() {
  return (dbInstance ??= makeDb());
}
