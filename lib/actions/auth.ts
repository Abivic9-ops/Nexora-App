"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"

function brief(error: string): string {
  if (error.includes("Invalid login credentials")) return "Invalid credentials"
  if (error.includes("Email not confirmed")) return "Verify your email first"
  if (error.includes("User already registered")) return "Email already in use"
  if (error.includes("Rate limit exceeded")) return "Too many attempts. Try again later."
  if (error.includes("Email link is invalid or has expired")) return "Link expired. Request a new one."
  if (error.includes("Password should be at least")) return "Password too short"
  return error
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: brief(error.message) }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("persona, default_home")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.persona) {
      const home = (profile.default_home as string) ?? "dashboard"
      revalidatePath("/", "layout")
      redirect(`/${home}`)
    }
  }

  revalidatePath("/", "layout")
  redirect("/onboarding")
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?next=/onboarding`,
    },
  })

  if (error) {
    return { error: brief(error.message) }
  }

  if (!data.session) {
    return {
      verificationRequired: true,
      email,
      message: "We sent a verification link to your email. Please check your inbox and click the link to continue.",
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && !user.email_confirmed_at) {
    await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding`,
      },
    })
  }

  revalidatePath("/", "layout")
  redirect("/onboarding")
}

export async function signInWithGoogle() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: brief(error.message) }
  }

  if (!data.url) {
    return { error: "Google Sign-In not configured" }
  }

  redirect(data.url)
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?next=/onboarding`,
    },
  })

  if (error) {
    return { error: brief(error.message) }
  }

  return { success: true }
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createServerClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/dashboard`,
  })

  if (error) {
    return { error: brief(error.message) }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  redirect("/sign-in")
}
