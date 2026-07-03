import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getActiveWorkspace(userId: string) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", userId)
    .maybeSingle()
  return (data?.workspace_id as string | undefined) ?? null
}

export async function ensureWorkspace(userId: string) {
  if (!isSupabaseConfigured()) return null
  const existing = await getActiveWorkspace(userId)
  if (existing) return existing

  const supabase = await createServerClient()
  const { data: workspace } = await supabase
    .from("workspaces")
    .insert({ name: "My Workspace" })
    .select("id")
    .single()

  if (!workspace) return null

  const wid = workspace.id as string
  await supabase.from("memberships").insert({
    workspace_id: wid,
    user_id: userId,
    role: "owner",
  })

  return wid
}
