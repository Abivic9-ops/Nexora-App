import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getTasks } from "@/services/tasks.server"
import { TaskPageShell } from "@/components/tasks/task-page-shell"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage your tasks with Kanban and List views.",
}

export default async function TasksPage() {
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

  const tasks = await getTasks(membership.workspace_id, user.id)

  return (
    <TaskPageShell
      initialTasks={tasks}
      workspaceId={membership.workspace_id}
      userId={user.id}
    />
  )
}
