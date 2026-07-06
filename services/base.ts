import { randomUUID } from "crypto"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getActiveWorkspace(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", userId)
    .maybeSingle()
  return (data?.workspace_id as string | undefined) ?? null
}

export async function ensureWorkspace(userId: string) {
  const existing = await getActiveWorkspace(userId)
  if (existing) return existing

  const supabase = await createServerClient()
  const wid = randomUUID()

  const { error: wsError } = await supabase
    .from("workspaces")
    .insert({ id: wid, name: "My Workspace" })

  if (wsError) {
    console.error("Failed to create workspace:", wsError)
    return null
  }

  const { error: memberError } = await supabase.from("memberships").insert({
    workspace_id: wid,
    user_id: userId,
    role: "owner",
  })

  if (memberError) {
    console.error("Failed to create membership:", memberError)
    return null
  }

  return wid
}
