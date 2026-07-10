"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NoteTagInput } from "@/components/notes/note-tag-input"
import { BookmarkPlus } from "lucide-react"
import type { NewsItem } from "@/services/news.client"

const SOURCE_TYPES = ["article", "video", "paper", "book", "other"]

export function SaveToResearchDialog({
  newsItem,
  open,
  onOpenChange,
  onSave,
}: {
  newsItem: NewsItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    title: string
    url?: string
    source_type?: string
    content_summary?: string
    tags?: string[]
  }) => void
}) {
  const [title, setTitle] = useState(newsItem?.title ?? "")
  const [url, setUrl] = useState(newsItem?.url ?? "")
  const [sourceType, setSourceType] = useState("article")
  const [summary, setSummary] = useState(newsItem?.summary ?? "")
  const [tags, setTags] = useState<string[]>([])

  // Sync when newsItem changes
  if (newsItem && newsItem.title !== title) {
    setTitle(newsItem.title)
    setUrl(newsItem.url ?? "")
    setSummary(newsItem.summary ?? "")
    setTags([])
  }

  const handleSave = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSave({
      title: trimmed,
      url: url.trim() || undefined,
      source_type: sourceType,
      content_summary: summary.trim() || undefined,
      tags,
    })
    setTitle("")
    setUrl("")
    setSourceType("article")
    setSummary("")
    setTags([])
  }

  if (!newsItem) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus size={16} className="text-amber-500" />
            Save to Research
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div>
            <label htmlFor="save-title" className="text-xs font-medium text-foreground">
              Title
            </label>
            <Input
              id="save-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="save-url" className="text-xs font-medium text-foreground">
              URL
            </label>
            <Input
              id="save-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Source type</label>
            <div className="mt-1.5 flex gap-1.5">
              {SOURCE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSourceType(type)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                    sourceType === type
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="save-summary" className="text-xs font-medium text-foreground">
              Summary
            </label>
            <Textarea
              id="save-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key takeaways..."
              className="mt-1 min-h-16"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Tags</label>
            <div className="mt-1.5">
              <NoteTagInput tags={tags} onChange={setTags} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
            Save to research
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
