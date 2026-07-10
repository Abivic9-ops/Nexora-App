"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NoteTagInput } from "@/components/notes/note-tag-input"
import { updateResearch, deleteResearch } from "@/services/research.client"
import type { Research } from "@/services/research.client"
import { X, Trash2, ExternalLink } from "lucide-react"

const SOURCE_TYPES = ["article", "video", "paper", "book", "other"]

export function ResearchDetailDrawer({
  item,
  open,
  onOpenChange,
  onItemUpdated,
  onItemDeleted,
}: {
  item: Research | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemUpdated: () => void
  onItemDeleted: (id: string) => void
}) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [sourceType, setSourceType] = useState<string | null>(null)
  const [summary, setSummary] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [pending, setPending] = useState(false)

  // Reset form when item changes
  useState(() => {
    if (item) {
      setTitle(item.title)
      setUrl(item.url || "")
      setSourceType(item.source_type)
      setSummary(item.content_summary || "")
      setTags(item.tags)
    }
  })

  // Sync on item change
  if (item && item.title !== title) {
    setTitle(item.title)
    setUrl(item.url || "")
    setSourceType(item.source_type)
    setSummary(item.content_summary || "")
    setTags(item.tags)
  }

  const handleSave = useCallback(async () => {
    if (!item) return
    setPending(true)
    const ok = await updateResearch(item.id, {
      title,
      url: url || null,
      source_type: sourceType,
      content_summary: summary || null,
      tags,
    })
    setPending(false)
    if (ok) {
      toast.success("Source updated")
      onItemUpdated()
    } else {
      toast.error("Failed to update source")
    }
  }, [item, title, url, sourceType, summary, tags, onItemUpdated])

  const handleDelete = useCallback(async () => {
    if (!item) return
    const ok = await deleteResearch(item.id)
    if (ok) {
      toast.success("Source deleted")
      onOpenChange(false)
      onItemDeleted(item.id)
    } else {
      toast.error("Failed to delete source")
    }
  }, [item, onOpenChange, onItemDeleted])

  if (!item) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="w-full sm:max-w-lg">
        <DrawerHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold">Source details</DrawerTitle>
            <DrawerClose render={<button type="button" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" />}>
              <X size={14} />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="detail-title" className="text-xs font-medium text-foreground">
                Title
              </label>
              <Input
                id="detail-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="detail-url" className="text-xs font-medium text-foreground">
                URL
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="detail-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Source type</label>
              <div className="mt-1.5 flex gap-1.5">
                {SOURCE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSourceType(sourceType === type ? null : type)}
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
              <label htmlFor="detail-summary" className="text-xs font-medium text-foreground">
                AI Summary
              </label>
              <Textarea
                id="detail-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key takeaways, distilled by AI..."
                className="mt-1 min-h-24"
              />
              <p className="mt-1 text-[10px] text-muted-foreground/60">
                Edit or let AI distill the content automatically.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Tags</label>
              <div className="mt-1.5">
                <NoteTagInput tags={tags} onChange={setTags} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2 size={13} />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
