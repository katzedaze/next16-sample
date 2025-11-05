import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12, // 8文字から12文字に強化
    maxPasswordLength: 128,
    requireEmailVerification: false, // MVP段階ではfalse、本番ではtrueに
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session every day)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  // CSRF保護はBetter Authがデフォルトで有効
  // セキュアなCookie設定
  advanced: {
    cookiePrefix: 'taskflow',
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
  // レート制限（Better Auth組み込み）
  rateLimit: {
    enabled: true,
    window: 60, // 60秒のウィンドウ
    max: 10, // 60秒間に最大10リクエスト
  },
});
