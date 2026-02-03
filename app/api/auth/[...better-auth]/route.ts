export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { hashPassword } from '@/lib/auth'
import prisma from '@/services/db'

const { GET, POST: betterAuthPost } = toNextJsHandler(auth)

export { GET }

// Custom POST handler to intercept signup and hash password
export async function POST(request: Request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Handle credential signup specially
  if (pathname.includes('/sign-up/email')) {
    const body = await request.clone().json()
    const { email, password, name } = body

    if (password) {
      try {
        // Call better-auth signup first
        const response = await betterAuthPost(request.clone())

        // If signup was successful, hash and update password
        if (response.ok) {
          const user = await prisma.user.findUnique({
            where: { email },
          })
          if (user) {
            const hashed = await hashPassword(password)
            await prisma.user.update({
              where: { id: user.id },
              data: { password: hashed },
            })
            console.debug(
              `[Auth Route] User ${user.id} password hashed after signup`,
            )
          }
        }
        return response
      } catch (error) {
        console.error('[Auth Route] Signup handler error:', error)
        return betterAuthPost(request)
      }
    }
  }

  // Pass through to better-auth for all other routes
  return betterAuthPost(request)
}
