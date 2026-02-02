import { type NextRequest, NextResponse } from 'next/server'

export default async function middleware(request: NextRequest) {
  try {
    const authUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin
    const sessionResponse = await fetch(`${authUrl}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        Origin: authUrl,
      },
    })

    const session = await sessionResponse.json()

    if (!session || session.error || !session.session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  } catch (e) {
    console.error('Middleware Auth Error (Fetch):', e)
    // If auth service is down or error, redirect to login as safety
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
