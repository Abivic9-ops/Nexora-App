"use client"

import { useState, useRef, useCallback } from "react"
import { Send, Loader2 } from "lucide-react"
import type { AssistantMessage } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export function ChatInput({
  threadId,
  isStreaming,
  onStreamingChange,
  onMessagesUpdated,
  onThreadCreated,
  onThreadListUpdate,
}: {
  threadId: string | null
  isStreaming: boolean
  onStreamingChange: (v: boolean) => void
  onMessagesUpdated: (threadId: string, messages: AssistantMessage[]) => void
  onThreadCreated: (threadId: string) => void
  onThreadListUpdate: (thread: { id: string; title: string; lastMessage: string | null; updated_at: string }) => void
}) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return

    setInput("")
    onStreamingChange(true)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }))
        console.error("Assistant error:", err)
        onStreamingChange(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { onStreamingChange(false); return }

      const decoder = new TextDecoder()
      let assistantText = ""
      let newThreadId = threadId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const textPart = line.slice(2)
            try {
              const parsed = JSON.parse(textPart)
              if (typeof parsed === "string") {
                assistantText += parsed
              }
            } catch {
              assistantText += textPart.replace(/^"|"$/g, "")
            }
          } else if (line.startsWith("e:")) {
            try {
              const event = JSON.parse(line.slice(2))
              if (event.threadId) newThreadId = event.threadId
            } catch { /* ignore */ }
          }
        }
      }

      if (newThreadId && newThreadId !== threadId) {
        onThreadCreated(newThreadId)
        onThreadListUpdate({
          id: newThreadId,
          title: text.length > 60 ? text.slice(0, 60) + "…" : text,
          lastMessage: assistantText.slice(0, 120),
          updated_at: new Date().toISOString(),
        })
      }

      const userMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        thread_id: newThreadId ?? threadId ?? "",
        workspace_id: "",
        user_id: "",
        role: "user",
        content: text,
        model: null,
        token_count: null,
        decision_id: null,
        metadata: null,
        created_at: new Date().toISOString(),
      }

      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        thread_id: newThreadId ?? threadId ?? "",
        workspace_id: "",
        user_id: "",
        role: "assistant",
        content: assistantText,
        model: null,
        token_count: null,
        decision_id: null,
        metadata: null,
        created_at: new Date().toISOString(),
      }

      onMessagesUpdated(newThreadId ?? threadId ?? "", [userMsg, assistantMsg])
    } catch (err) {
      console.error("Stream error:", err)
    } finally {
      onStreamingChange(false)
    }
  }, [input, isStreaming, threadId, onStreamingChange, onMessagesUpdated, onThreadCreated, onThreadListUpdate])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="border-t border-border/40 px-4 py-3">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-xl border border-border/40 bg-secondary/50 px-3 py-2 focus-within:border-primary/40 transition-colors">
          <textarea
            ref={textareaRef}
            data-chat-input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your tasks, goals, or schedule…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none min-h-[24px] max-h-[120px]"
            style={{ height: "auto" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className={cn(
              "rounded-lg p-2 transition-colors",
              input.trim() && !isStreaming
                ? "bg-primary text-white hover:bg-primary/90"
                : "text-muted-foreground/40",
            )}
          >
            {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
    </div>
  )
}
