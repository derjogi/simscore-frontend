import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')
    const authUsers = new Map(
      Object.entries(JSON.parse(process.env.AUTH_USERS || '{}'))
    )
    console.log(`Trying to log in with ${user.slice(0, 2)}${'*'.repeat(user.length - 2)}:${pwd.slice(0, 2)}${'*'.repeat(pwd.length - 2)}`)
    if (authUsers.get(user) && authUsers.get(user) === pwd) {
      return NextResponse.next()
    }
  }

  const uniqueId = Date.now().toString();
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="Secure Area ${uniqueId}", charset="UTF-8"`,
    },
  })
}

export const config = {
  matcher: '/manage/:path*',
}