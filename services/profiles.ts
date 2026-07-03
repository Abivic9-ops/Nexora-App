import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { Profile, ProfileUpdate } from "@/lib/supabase/types"

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return data as Profile | null
}

export async function updateProfile(userId: string, input: ProfileUpdate) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("profiles").update(input).eq("id", userId)
}
