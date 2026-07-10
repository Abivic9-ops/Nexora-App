import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getNotes, getFolders } from "@/services/notes"
import { NotePageShell } from "@/components/notes/note-page-shell"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Notes",
  description: "Rich-text notes with folders, tags, and auto-save.",
}

export default async function NotesPage() {
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

  const [notes, folders] = await Promise.all([
    getNotes(membership.workspace_id),
    getFolders(membership.workspace_id),
  ])

  return (
    <NotePageShell
      initialNotes={notes}
      initialFolders={folders}
      workspaceId={membership.workspace_id}
      userId={user.id}
    />
  )
}
