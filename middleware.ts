import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// Which routes require authentication?
// `(app)` is the protected group — dashboard, tasks, etc.
const protectedRoutes = ["/(app)"]

// Which routes should redirect to dashboard if already signed in?
const authRoutes = ["/sign-in", "/sign-up"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let auth callback and confirm routes through — they handle their own auth
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)
  const isAuthenticated = !!user

  // If user is signed in and tries to visit sign-in/sign-up, redirect to dashboard
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If user is NOT signed in and tries to visit a protected route, redirect to sign-in
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except static files, _next, and api
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
