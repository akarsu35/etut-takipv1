import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/services/db'
import { hash, verify } from 'better-auth/crypto'

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
      return await hash(password)
    },
    async verifyPassword(hashedPassword: string, password: string) {
      return await verify(password, hashedPassword)
    },
  },

  logger: {
    disabled: false,
    level: 'debug',
  },
})
