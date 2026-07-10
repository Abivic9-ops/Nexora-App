"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NoteTagInput } from "@/components/notes/note-tag-input"
import { BookOpen } from "lucide-react"

const SOURCE_TYPES = ["article", "video", "paper", "book", "other"]

export function NewResearchDialog({
  children,
  onCreateResearch,
}: {
  children: React.ReactNode
  onCreateResearch: (data: {
    title: string
    url?: string
    source_type?: string
    content_summary?: string
    tags?: string[]
  }) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [sourceType, setSourceType] = useState("")
  const [summary, setSummary] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreateResearch({
      title: trimmed,
      url: url.trim() || undefined,
      source_type: sourceType || undefined,
      content_summary: summary.trim() || undefined,
      tags,
    })
    setTitle("")
    setUrl("")
    setSourceType("")
    setSummary("")
    setTags([])
    setOpen(false)
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              Save source
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label htmlFor="research-title" className="text-xs font-medium text-foreground">
                Title
              </label>
              <Input
                id="research-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Source title"
                autoFocus
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="research-url" className="text-xs font-medium text-foreground">
                URL (optional)
              </label>
              <Input
                id="research-url"
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
                    onClick={() => setSourceType(sourceType === type ? "" : type)}
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
              <label htmlFor="research-summary" className="text-xs font-medium text-foreground">
                Summary (optional)
              </label>
              <Textarea
                id="research-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key takeaways or summary..."
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
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!title.trim()}>
              Save source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
