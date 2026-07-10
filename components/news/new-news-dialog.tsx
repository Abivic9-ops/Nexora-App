"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Newspaper } from "lucide-react"

const TOPIC_SUGGESTIONS = [
  "Technology",
  "AI & ML",
  "Startups",
  "Finance",
  "Health",
  "Science",
  "Productivity",
  "Design",
]

export function NewNewsDialog({
  children,
  onCreateNewsItem,
}: {
  children: React.ReactNode
  onCreateNewsItem: (data: {
    title: string
    url?: string
    source?: string
    summary?: string
    topic?: string
  }) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [source, setSource] = useState("")
  const [summary, setSummary] = useState("")
  const [topic, setTopic] = useState("")

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreateNewsItem({
      title: trimmed,
      url: url.trim() || undefined,
      source: source.trim() || undefined,
      summary: summary.trim() || undefined,
      topic: topic.trim() || undefined,
    })
    setTitle("")
    setUrl("")
    setSource("")
    setSummary("")
    setTopic("")
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
              <Newspaper size={16} className="text-primary" />
              Add news briefing
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label htmlFor="news-title" className="text-xs font-medium text-foreground">
                Title
              </label>
              <Input
                id="news-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Briefing title"
                autoFocus
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="news-url" className="text-xs font-medium text-foreground">
                  URL (optional)
                </label>
                <Input
                  id="news-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="news-source" className="text-xs font-medium text-foreground">
                  Source
                </label>
                <Input
                  id="news-source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. TechCrunch"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Topic</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TOPIC_SUGGESTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(topic === t ? "" : t)}
                    className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${
                      topic === t
                        ? "border-primary/50 bg-primary/5 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Or type a custom topic..."
                className="mt-2"
              />
            </div>

            <div>
              <label htmlFor="news-summary" className="text-xs font-medium text-foreground">
                Summary (optional)
              </label>
              <Textarea
                id="news-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="AI-generated summary or key points..."
                className="mt-1 min-h-16"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!title.trim()}>
              Add briefing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
