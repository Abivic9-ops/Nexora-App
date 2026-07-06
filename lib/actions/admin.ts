"use server"

import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { updateMemberRole, getMembershipByUser } from "@/services/memberships"

export async function promoteToAdmin(membershipId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const caller = await getMembershipByUser(user.id)
  if (!caller || caller.role !== "admin") {
    return { error: "Only admins can promote users." }
  }

  await updateMemberRole(membershipId, "admin")
  revalidatePath("/admin")
}

export async function demoteToMember(membershipId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const caller = await getMembershipByUser(user.id)
  if (!caller || caller.role !== "admin") {
    return { error: "Only admins can demote users." }
  }

  await updateMemberRole(membershipId, "member")
  revalidatePath("/admin")
}
