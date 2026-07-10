"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { NoteFolder } from "@/services/notes.client"
import { FileText } from "lucide-react"

export function NewNoteDialog({
  children,
  folders,
  onCreateNote,
}: {
  children: React.ReactNode
  folders: NoteFolder[]
  onCreateNote: (data: { title: string; folder_id?: string | null }) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [folderId, setFolderId] = useState<string>("")

  const handleCreate = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onCreateNote({
      title: trimmed,
      folder_id: folderId || null,
    })
    setTitle("")
    setFolderId("")
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
              <FileText size={16} className="text-primary" />
              New note
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label htmlFor="note-title" className="text-xs font-medium text-foreground">
                Title
              </label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate()
                }}
                placeholder="Note title"
                autoFocus
                className="mt-1"
              />
            </div>

            {folders.length > 0 && (
              <div>
                <label htmlFor="note-folder" className="text-xs font-medium text-foreground">
                  Folder (optional)
                </label>
                <select
                  id="note-folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-border/40 bg-transparent px-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!title.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
