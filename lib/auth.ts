import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/services/db'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

// Exported password hash utilities for use in hooks
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(
  hashedPassword: string,
  password: string,
): Promise<boolean> {
  const [salt, key] = hashedPassword.split(':')
  if (!salt || !key) return false
  const derived = scryptSync(password, salt, 64) as Buffer
  const keyBuf = Buffer.from(key, 'hex')
  try {
    return timingSafeEqual(derived, keyBuf)
  } catch {
    return false
  }
}

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  baseURL,

  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    baseURL,
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],

  emailAndPassword: {
    enabled: true,
  },

  // Map Better Auth account fields to current Prisma schema.
  // This makes credential passwords stored in `account.password`.
  account: {
    fields: {
      providerId: 'provider',
      accountId: 'providerAccountId',
    },
  },

  logger: {
    disabled: false,
    level: 'debug',
  },
})
