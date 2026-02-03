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
        console.debug('[Auth Route] Intercepting signup for', email)

        // Call better-auth signup first
        const response = await betterAuthPost(request.clone())
        let respText = ''
        try {
          respText = await response.clone().text()
        } catch (e) {
          respText = '<no-body>'
        }
        console.debug('[Auth Route] better-auth response', {
          status: response.status,
          body: respText,
        })

        // If signup was successful, hash and update password
        if (response.ok) {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            console.debug('[Auth Route] User not found after signup', { email })
          } else {
            try {
              const hashed = await hashPassword(password)
              const updated = await prisma.user.update({
                where: { id: user.id },
                data: { password: hashed },
              })
              console.debug('[Auth Route] User password updated', {
                id: updated.id,
              })
            } catch (err) {
              console.error('[Auth Route] Failed to update user password', err)
            }
          }
        } else {
          console.debug(
            '[Auth Route] Signup response not OK, skipping password update',
          )
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
