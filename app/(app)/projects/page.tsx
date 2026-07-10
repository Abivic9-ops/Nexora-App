import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getProjects } from "@/services/projects"
import { ProjectPageShell } from "@/components/projects/project-page-shell"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage your projects and track progress.",
}

export default async function ProjectsPage() {
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

  const projects = await getProjects(membership.workspace_id)

  const projectIds = projects.map((p) => p.id)
  const taskCounts: Record<string, { total: number; completed: number }> = {}

  if (projectIds.length > 0) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("project_id, status")
      .in("project_id", projectIds)

    for (const id of projectIds) {
      taskCounts[id] = { total: 0, completed: 0 }
    }
    for (const task of tasks ?? []) {
      const pid = task.project_id as string
      if (!taskCounts[pid]) taskCounts[pid] = { total: 0, completed: 0 }
      taskCounts[pid].total++
      if (task.status === "completed") taskCounts[pid].completed++
    }
  }

  return (
    <ProjectPageShell
      initialProjects={projects}
      workspaceId={membership.workspace_id}
      userId={user.id}
      initialTaskCounts={taskCounts}
    />
  )
}
