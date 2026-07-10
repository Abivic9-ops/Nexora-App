"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { toast } from "sonner"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { NoteTagInput } from "./note-tag-input"
import { updateNote, deleteNote } from "@/services/notes.client"
import type { Note, NoteFolder } from "@/services/notes.client"
import { X, Trash2, Pin, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

function NoteEditor({
  note,
  folders,
  onNoteUpdated,
  onNoteDeleted,
  onOpenChange,
}: {
  note: Note
  folders: NoteFolder[]
  onNoteUpdated: () => void
  onNoteDeleted: (id: string) => void
  onOpenChange: (open: boolean) => void
}) {
  const [title, setTitle] = useState(note.title)
  const [content] = useState(note.content || "")
  const [tags, setTags] = useState<string[]>(note.tags)
  const [folderId, setFolderId] = useState<string | null>(note.folder_id)
  const [pinned, setPinned] = useState(note.pinned)
  const [pending, setPending] = useState(false)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (updates: Partial<{ title: string; content: string; tags: string[]; folder_id: string | null; pinned: boolean }>) => {
      setPending(true)
      const ok = await updateNote(note.id, updates)
      setPending(false)
      if (ok) {
        onNoteUpdated()
      } else {
        toast.error("Failed to save note")
      }
    },
    [note.id, onNoteUpdated],
  )

  const scheduleAutosave = useCallback(
    (updates: Partial<{ title: string; content: string; tags: string[]; folder_id: string | null; pinned: boolean }>) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
      autosaveTimer.current = setTimeout(() => save(updates), 1000)
    },
    [save],
  )

  const handleContentChange = useCallback(
    (newContent: string) => {
      scheduleAutosave({ content: newContent })
    },
    [scheduleAutosave],
  )

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setTitle(newTitle)
      scheduleAutosave({ title: newTitle })
    },
    [scheduleAutosave],
  )

  const handleTogglePin = useCallback(() => {
    const newPinned = !pinned
    setPinned(newPinned)
    save({ pinned: newPinned })
  }, [pinned, save])

  const handleTagsChange = useCallback(
    (newTags: string[]) => {
      setTags(newTags)
      save({ tags: newTags })
    },
    [save],
  )

  const handleFolderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newFolderId = e.target.value || null
      setFolderId(newFolderId)
      save({ folder_id: newFolderId })
    },
    [save],
  )

  const handleDelete = useCallback(async () => {
    const ok = await deleteNote(note.id)
    if (ok) {
      toast.success("Note deleted")
      onOpenChange(false)
      onNoteDeleted(note.id)
    } else {
      toast.error("Failed to delete note")
    }
  }, [note.id, onOpenChange, onNoteDeleted])

  return (
    <>
      <DrawerHeader className="border-b border-border/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-base font-semibold">
              {title || "Untitled"}
            </DrawerTitle>
            {pending && (
              <span className="text-[10px] text-muted-foreground">Saving...</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleTogglePin}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                pinned ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Pin size={14} fill={pinned ? "currentColor" : "none"} />
            </button>
            <DrawerClose render={<button type="button" className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" />}>
              <X size={14} />
            </DrawerClose>
          </div>
        </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4">
          <Input
            value={title}
            onChange={handleTitleChange}
            className="border-0 bg-transparent px-0 text-lg font-semibold text-foreground shadow-none focus-visible:ring-0"
            placeholder="Note title"
          />
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Folder size={12} className="text-muted-foreground" />
            <select
              value={folderId ?? ""}
              onChange={handleFolderChange}
              className="h-6 rounded-md border border-border/40 bg-secondary/50 px-2 text-xs text-foreground outline-none focus:border-primary/50"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <NoteTagInput tags={tags} onChange={handleTagsChange} />
        </div>

        <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
          <TipTapEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Start writing..."
          />
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
        <div className="text-[10px] text-muted-foreground/50">
          Created {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>
    </>
  )
}

export function NoteDetailDrawer({
  note,
  folders,
  open,
  onOpenChange,
  onNoteUpdated,
  onNoteDeleted,
}: {
  note: Note | null
  folders: NoteFolder[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onNoteUpdated: () => void
  onNoteDeleted: (id: string) => void
}) {
  const editorKey = useMemo(() => note?.id ?? "none", [note?.id])

  if (!note) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="w-full sm:max-w-2xl">
        <NoteEditor
          key={editorKey}
          note={note}
          folders={folders}
          onNoteUpdated={onNoteUpdated}
          onNoteDeleted={onNoteDeleted}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}
