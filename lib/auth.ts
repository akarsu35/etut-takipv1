import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/services/db'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

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
    async hashPassword(password: string) {
      // scrypt with 64 byte key, store salt:hash
      const salt = randomBytes(16).toString('hex')
      const derived = scryptSync(password, salt, 64) as Buffer
      return `${salt}:${derived.toString('hex')}`
    },
    async verifyPassword(hashedPassword: string, password: string) {
      const [salt, key] = hashedPassword.split(':')
      if (!salt || !key) return false
      const derived = scryptSync(password, salt, 64) as Buffer
      const keyBuf = Buffer.from(key, 'hex')
      try {
        return timingSafeEqual(derived, keyBuf)
      } catch {
        return false
      }
    },
  },

  logger: {
    disabled: false,
    level: 'debug',
  },
})
