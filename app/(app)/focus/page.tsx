import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getTodaysSessions } from "@/services/focus"
import { FocusPageShell } from "@/components/focus/focus-page-shell"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Focus",
  description: "Deep work sessions with Pomodoro timer and stopwatch.",
}

export default async function FocusPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Workspace not ready
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete onboarding to set up your workspace.
          </p>
        </div>
      </div>
    )
  }

  const todaysSessions = await getTodaysSessions(membership.workspace_id)

  return (
    <FocusPageShell
      initialSessions={todaysSessions}
      workspaceId={membership.workspace_id}
      userId={user.id}
    />
  )
}
