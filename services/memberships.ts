import { createClient as createServerClient } from "@/lib/supabase/server"
import type { Membership, MembershipInsert } from "@/lib/supabase/types"

export type MembershipWithProfile = Membership & {
  profiles: { email: string; full_name: string | null; avatar_url: string | null }
}

export async function getMembershipByUser(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  return data as Membership | null
}

export async function ensureMembership(userId: string, workspaceId: string) {
  const supabase = await createServerClient()

  const existing = await getMembershipByUser(userId)
  if (existing) return existing

  const isFirstUser = await isFirstMember(workspaceId)
  const role = isFirstUser ? "admin" : "member"

  const { data } = await supabase
    .from("memberships")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  return data as Membership | null
}

async function isFirstMember(workspaceId: string) {
  const supabase = await createServerClient()
  const { count } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
  return count === 0
}

export async function getAllMembers(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("memberships")
    .select("*, profiles(email, full_name, avatar_url)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
  return (data ?? []) as MembershipWithProfile[]
}

export async function updateMemberRole(membershipId: string, role: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("memberships")
    .update({ role })
    .eq("id", membershipId)
    .select()
    .single()
  return data as Membership | null
}

export async function getCurrentUserRole() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const membership = await getMembershipByUser(user.id)
  return membership?.role ?? null
}
