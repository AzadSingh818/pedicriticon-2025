// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(req: NextRequest) {
  // we only care about routes that begin with /admin
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const token = req.cookies.get('admin-token')?.value

  // 1. No cookie  -> kick to login
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // 2. Bad / expired token -> kick to login
  try {
    const payload = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET as string
    ) as { role?: string }

    if (payload.role !== 'admin') {
      // logged‑in but not an admin
      return NextResponse.redirect(new URL('/', req.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // 3. Happy path – let the request continue
  return NextResponse.next()
}

/**
 * Limit the middleware **only** to /admin and anything under it
 */
export const config = {
  matcher: ['/admin/:path*']
}
