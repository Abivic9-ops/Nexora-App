import { streamText } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getModel, getModelName, isAIConfigured } from "@/lib/ai/gateway"
import { buildUserContext } from "@/lib/ai/context"
import { buildSystemPrompt } from "@/lib/ai/prompts"
import {
  getMessages,
  addMessage,
  createThread,
  updateThreadTitle,
} from "@/services/threads"

export async function POST(req: NextRequest) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI is not configured. Set OPENAI_API_KEY in your environment." },
      { status: 503 },
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 })
  }

  const body = await req.json()
  const { message, threadId } = body as { message: string; threadId?: string }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  let activeThreadId = threadId

  if (!activeThreadId) {
    const title = message.length > 60 ? message.slice(0, 60) + "…" : message
    const thread = await createThread(title)
    if (!thread) {
      return NextResponse.json({ error: "Failed to create thread" }, { status: 500 })
    }
    activeThreadId = thread.id
  }

  await addMessage({
    thread_id: activeThreadId,
    workspace_id: membership.workspace_id,
    user_id: user.id,
    role: "user",
    content: message.trim(),
  })

  const ctx = await buildUserContext()
  if (!ctx) {
    return NextResponse.json({ error: "Failed to build context" }, { status: 500 })
  }

  const existingMessages = await getMessages(activeThreadId)
  const historyForModel = existingMessages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))

  const systemPrompt = buildSystemPrompt(ctx)

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages: historyForModel,
    onFinish: async (completion) => {
      const text = typeof completion === "string" ? completion : completion.text
      await addMessage({
        thread_id: activeThreadId!,
        workspace_id: membership.workspace_id,
        user_id: user.id,
        role: "assistant",
        content: text,
        model: getModelName(),
        token_count: typeof completion === "object" && "usage" in completion
          ? completion.usage?.totalTokens ?? undefined
          : undefined,
      })

      if (existingMessages.length <= 1) {
        const firstUserMsg = message.trim()
        const autoTitle = firstUserMsg.length > 60
          ? firstUserMsg.slice(0, 60) + "…"
          : firstUserMsg
        await updateThreadTitle(activeThreadId!, autoTitle)
      }
    },
  })

  return result.toTextStreamResponse()
}
