import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/client';
import * as authSchema from '@/db/auth-schema';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db(), { provider: 'pg', schema: authSchema }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
});
