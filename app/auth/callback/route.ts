import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // Supabase sends an auth code in the URL after OAuth sign-in
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/onboarding"

  if (code) {
    // Create a server client using the request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      },
    )

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful — redirect to onboarding (or wherever next points)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, redirect to sign-in with an error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
