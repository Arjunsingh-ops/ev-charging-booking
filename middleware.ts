import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "chargeconnect-super-secure-jwt-secret-key-production-2026"
const encodedKey = new TextEncoder().encode(JWT_SECRET)
const AUTH_COOKIE_NAME = "chargeconnect_session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  let session: { userId: string; role: string; email: string } | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
      })
      session = {
        userId: payload.userId as string,
        role: payload.role as string,
        email: payload.email as string,
      }
    } catch {
      session = null
    }
  }

  // Redirect authenticated users away from login/signup
  if (session && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    const target = session.role === "STATION_OWNER" || session.role === "ADMIN" 
      ? "/lister/dashboard" 
      : "/user/dashboard"
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Protected User routes
  if (pathname.startsWith("/user")) {
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protected Lister / Partner routes
  if (pathname.startsWith("/lister")) {
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (session.role !== "STATION_OWNER" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images:
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
