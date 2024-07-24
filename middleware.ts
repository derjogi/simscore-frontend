import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')
  console.log("Checking Auth")
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')
  
    const authUsers = new Map(
      Object.entries(JSON.parse(process.env.AUTH_USERS || '{}'))
    )

    if (authUsers.get(user) && authUsers.get(user) === pwd) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: '/manage/:path*',
}