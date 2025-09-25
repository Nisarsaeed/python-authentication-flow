import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  try {
    // Forward cookies from the incoming request
    const res = await fetch(`http://localhost:3000/api/user/profile`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
      credentials: 'include',
    })

    if (!res.ok) {
      // Not authenticated
      if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const user = await res.json()

    // Block login/register if already logged in
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Restrict dashboard to admins only
    if (pathname.startsWith('/dashboard') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('Middleware fetch error:', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*'],
}
