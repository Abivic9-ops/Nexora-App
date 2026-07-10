import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getNewsItems } from "@/services/news"
import { NewsPageShell } from "@/components/news/news-page-shell"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "News",
  description: "Topic-based AI briefings and save-to-research flow.",
}

export default async function NewsPage() {
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

  const items = await getNewsItems(membership.workspace_id)

  return (
    <NewsPageShell
      initialItems={items}
      workspaceId={membership.workspace_id}
      userId={user.id}
    />
  )
}
