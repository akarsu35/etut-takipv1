import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/services/db'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // ⬇️ MUTLAKA env’den gelsin
  baseURL: process.env.BETTER_AUTH_URL!,

  secret: process.env.BETTER_AUTH_SECRET!,

  // ⬇️ Vercel domain’i trusted origin yapıyoruz
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_APP_URL!,
  ],

  emailAndPassword: {
    enabled: true,
  },

  logger: {
    disabled: false,
    level: 'debug',
  },
})
