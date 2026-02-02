export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('GET_SESSION_DEBUG_ERROR:', error)

    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
        hint: 'Check BETTER_AUTH_SECRET and BETTER_AUTH_URL',
      },
      { status: 500 },
    )
  }
}
