"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"

export async function signInWithEmail(formData: FormData) {
  // ── Demo mode: skip Supabase, go straight to onboarding ──
  if (!isSupabaseConfigured()) {
    redirect("/onboarding")
  }

  const supabase = await createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/onboarding")
}

export async function signUpWithEmail(formData: FormData) {
  // ── Demo mode: skip Supabase, go straight to onboarding ──
  if (!isSupabaseConfigured()) {
    redirect("/onboarding")
  }

  const supabase = await createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/onboarding")
}

export async function signInWithGoogle() {
  // ── Demo mode: skip Google OAuth, go straight to onboarding ──
  if (!isSupabaseConfigured()) {
    redirect("/onboarding")
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(data.url)
}

export async function signOut() {
  // ── Demo mode: just redirect to sign-in ──
  if (!isSupabaseConfigured()) {
    redirect("/sign-in")
  }

  const supabase = await createServerClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  redirect("/sign-in")
}
