import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/services/db'

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000'

export const auth = betterAuth({
  database: prismaAdapter(prisma),

  baseURL,

  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    baseURL,
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],

  emailAndPassword: {
    enabled: true,
  },

  logger: {
    disabled: false,
    level: 'debug',
  },
})
