import { createClient as createServerClient } from "@/lib/supabase/server"
import { getAllMembers, getMembershipByUser } from "@/services/memberships"
import { getActiveWorkspace } from "@/services/base"
import { AdminPanel } from "./admin-panel"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage NEXORA users and roles.",
}

export default async function AdminPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const membership = await getMembershipByUser(user.id)
  if (!membership || membership.role !== "admin") {
    redirect("/dashboard")
  }

  const workspaceId = await getActiveWorkspace(user.id)
  if (!workspaceId) {
    redirect("/dashboard")
  }

  const members = await getAllMembers(workspaceId)

  return <AdminPanel members={members} currentUserId={user.id} />
}
