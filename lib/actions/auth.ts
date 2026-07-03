"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function signInWithEmail(formData: FormData) {
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

  // If email confirmation is disabled, user is signed in automatically.
  // If enabled, show a "check your email" message.
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
    return { error: error.message }
  }

  // Redirect to Google's OAuth consent screen
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  redirect("/sign-in")
}
