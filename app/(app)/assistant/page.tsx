import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getThreads, getMessages } from "@/services/threads"
import { isAIConfigured } from "@/lib/ai/gateway"
import { AssistantPageShell } from "@/components/assistant/assistant-page-shell"

export const metadata: Metadata = {
  title: "Assistant",
  description: "AI-powered execution co-pilot with full workspace context.",
}

export default async function AssistantPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Workspace not ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">Complete onboarding to set up your workspace.</p>
        </div>
      </div>
    )
  }

  const threads = await getThreads()
  const firstThreadId = threads[0]?.id ?? null
  const initialMessages = firstThreadId ? await getMessages(firstThreadId) : []

  return (
    <AssistantPageShell
      initialThreads={threads}
      initialMessages={initialMessages}
      initialThreadId={firstThreadId}
      contextLoaded={isAIConfigured()}
    />
  )
}
