"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"

interface OnboardingData {
  persona: string
  visibleModules: string[]
  defaultHome: string
  planningCadence: "daily" | "weekly"
  scoreWeights: { tasks: number; focus: number; habits: number }
}

export async function saveOnboarding(data: OnboardingData) {
  if (!isSupabaseConfigured()) {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      persona: data.persona,
      visible_modules: data.visibleModules,
      default_home: data.defaultHome,
      planning_cadence: data.planningCadence,
      score_weights: data.scoreWeights,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Failed to save onboarding:", error)
    return { error: "Failed to save your preferences. Please try again." }
  }

  revalidatePath("/", "layout")
  redirect(`/${data.defaultHome}`)
}
