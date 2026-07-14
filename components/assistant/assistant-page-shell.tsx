"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { AssistantThread, AssistantMessage } from "@/lib/supabase/types"
import { ThreadList } from "./thread-list"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { ContextBadge } from "./context-badge"
import { QuickActions } from "./quick-actions"
import { PanelLeftClose, PanelLeft, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type ThreadWithPreview = AssistantThread & { lastMessage?: string | null }

export function AssistantPageShell({
  initialThreads,
  initialMessages,
  initialThreadId,
  contextLoaded,
}: {
  initialThreads: ThreadWithPreview[]
  initialMessages: AssistantMessage[]
  initialThreadId: string | null
  contextLoaded: boolean
}) {
  const [threads, setThreads] = useState(initialThreads)
  const [messages, setMessages] = useState(initialMessages)
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleNewThread = useCallback(() => {
    setActiveThreadId(null)
    setMessages([])
  }, [])

  const handleSelectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId)
  }, [])

  const handleMessagesUpdated = useCallback((threadId: string, newMessages: AssistantMessage[]) => {
    setActiveThreadId(threadId)
    setMessages(newMessages)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-border/40 transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <ThreadList
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <button
            type="button"
            onClick={handleNewThread}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Plus size={16} />
          </button>
          <div className="flex-1" />
          <ContextBadge loaded={contextLoaded} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">NEXORA Assistant</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                  Ask anything about your tasks, goals, or schedule. I have full context of your workspace.
                </p>
              </div>
              <QuickActions
                onSend={(text) => {
                  const input = document.querySelector<HTMLInputElement>("[data-chat-input]")
                  if (input) {
                    input.value = text
                    input.dispatchEvent(new Event("input", { bubbles: true }))
                    input.closest("form")?.requestSubmit()
                  }
                }}
              />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isStreaming && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="rounded-lg bg-secondary border border-border/40 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          threadId={activeThreadId}
          isStreaming={isStreaming}
          onStreamingChange={setIsStreaming}
          onMessagesUpdated={handleMessagesUpdated}
          onThreadCreated={(threadId) => {
            setActiveThreadId(threadId)
          }}
          onThreadListUpdate={(thread) => {
            setThreads((prev) => {
              const exists = prev.find((t) => t.id === thread.id)
              if (exists) {
                return prev.map((t) => t.id === thread.id ? { ...t, title: thread.title, lastMessage: thread.lastMessage, updated_at: thread.updated_at } : t)
              }
              const newThread: ThreadWithPreview = { ...thread, workspace_id: "", pinned: false, created_at: thread.updated_at, user_id: "" }
              return [newThread, ...prev]
            })
          }}
        />
      </div>
    </div>
  )
}
