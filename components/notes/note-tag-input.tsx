"use client"

import { useState, useRef } from "react"
import { X } from "lucide-react"

export function NoteTagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = () => {
    const trimmed = input.trim()
    if (!trimmed || tags.includes(trimmed)) {
      setInput("")
      return
    }
    onChange([...tags, trimmed])
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addTag()
            }
            if (e.key === "Backspace" && !input && tags.length > 0) {
              removeTag(tags[tags.length - 1])
            }
          }}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="h-6 min-w-[80px] border-none bg-transparent px-1 text-xs text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
    </div>
  )
}
