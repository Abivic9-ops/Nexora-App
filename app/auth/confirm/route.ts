import { createServerClient } from "@supabase/ssr"
import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // ── Demo mode: skip verification, go straight to onboarding ──
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/onboarding"

  if (token_hash && type) {
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

    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=verification_failed`)
}
