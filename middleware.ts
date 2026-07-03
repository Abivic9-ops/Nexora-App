import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { isSupabaseConfigured } from "@/lib/supabase/check"

// Which routes require authentication?
const protectedRoutes = [
  "/dashboard", "/onboarding",
  "/tasks", "/projects", "/goals", "/habits",
  "/focus", "/notes", "/research", "/news",
  "/calendar", "/analytics", "/assistant", "/settings",
]

// Which routes should redirect to dashboard if already signed in?
const authRoutes = ["/sign-in", "/sign-up"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Demo mode: let everyone through ──
  // Until you configure real Supabase credentials in .env.local,
  // the middleware skips all auth checks so you can navigate freely.
  if (!isSupabaseConfigured()) {
    return NextResponse.next()
  }

  // Let auth callback and confirm routes through
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next()
  }

  const { supabaseResponse, user } = await updateSession(request)
  const isAuthenticated = !!user

  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
