"use client"

import { useMemo } from "react"
import type { AssistantMessage } from "@/lib/supabase/types"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

export function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === "user"

  const renderedContent = useMemo(() => {
    if (isUser) return <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
    return <MarkdownContent content={message.content} />
  }, [message.content, isUser])

  return (
    <div className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary/10" : "bg-secondary border border-border/40",
        )}
      >
        {isUser ? <User size={13} className="text-primary" /> : <Bot size={13} className="text-foreground" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary/10 text-foreground border border-primary/20"
            : "bg-secondary text-foreground border border-border/40",
        )}
      >
        {renderedContent}
      </div>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className="space-y-2 prose prose-sm prose-invert max-w-none">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = (`h${block.level}`) as "h1" | "h2" | "h3"
          return <Tag key={i} className="font-semibold text-foreground mt-3 mb-1">{block.text}</Tag>
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc pl-4 space-y-0.5">
              {block.items.map((item, j) => (
                <li key={j} className="text-sm"><InlineMarkdown text={item} /></li>
              ))}
            </ul>
          )
        }
        if (block.type === "ordered_list") {
          return (
            <ol key={i} className="list-decimal pl-4 space-y-0.5">
              {block.items.map((item, j) => (
                <li key={j} className="text-sm"><InlineMarkdown text={item} /></li>
              ))}
            </ol>
          )
        }
        if (block.type === "code") {
          return (
            <pre key={i} className="rounded-md bg-background/60 border border-border/40 p-3 overflow-x-auto">
              <code className="text-xs font-mono text-foreground">{block.code}</code>
            </pre>
          )
        }
        if (block.type === "table") {
          return <RenderTable key={i} rows={block.rows} />
        }
        if (block.type === "hr") {
          return <hr key={i} className="border-border/40 my-2" />
        }
        return (
          <p key={i} className="text-sm leading-relaxed">
            <InlineMarkdown text={block.text} />
          </p>
        )
      })}
    </div>
  )
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = useMemo(() => {
    const regex = /(\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g
    const result: { type: "text" | "bold" | "code" | "link"; content: string; href?: string }[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: "text", content: text.slice(lastIndex, match.index) })
      }
      if (match[2]) result.push({ type: "bold", content: match[2] })
      else if (match[3]) result.push({ type: "code", content: match[3] })
      else if (match[4] && match[5]) result.push({ type: "link", content: match[4], href: match[5] })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
      result.push({ type: "text", content: text.slice(lastIndex) })
    }
    return result
  }, [text])

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "bold") return <strong key={i} className="font-semibold">{part.content}</strong>
        if (part.type === "code") return <code key={i} className="rounded bg-background/60 px-1.5 py-0.5 text-xs font-mono">{part.content}</code>
        if (part.type === "link") return <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">{part.content}</a>
        return <span key={i}>{part.content}</span>
      })}
    </>
  )
}

function RenderTable({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null
  const [header, ...body] = rows
  return (
    <div className="overflow-x-auto rounded-md border border-border/40">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40 bg-background/40">
            {header.map((cell, i) => (
              <th key={i} className="px-3 py-1.5 text-left font-medium text-foreground">{cell.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-b border-border/20 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 text-muted-foreground"><InlineMarkdown text={cell.trim()} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered_list"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "table"; rows: string[][] }
  | { type: "hr" }

function parseMarkdown(content: string): Block[] {
  const lines = content.split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: line.slice(4) })
      i++
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: line.slice(3) })
      i++
    } else if (line.startsWith("# ")) {
      blocks.push({ type: "heading", level: 1, text: line.slice(2) })
      i++
    } else if (line.startsWith("```")) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push({ type: "code", language: lang, code: codeLines.join("\n") })
      i++
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: "list", items })
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      blocks.push({ type: "ordered_list", items })
    } else if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.includes("---")) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter((c) => c.trim() !== "").map((c) => c.trim()))
        i++
      }
      blocks.push({ type: "table", rows })
    } else if (line.trim() === "---" || line.trim() === "***") {
      blocks.push({ type: "hr" })
      i++
    } else if (line.trim() === "") {
      i++
    } else {
      blocks.push({ type: "paragraph", text: line })
      i++
    }
  }

  return blocks
}
