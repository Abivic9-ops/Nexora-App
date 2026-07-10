"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Note, NoteFolder } from "@/services/notes.client"
import {
  getNotes,
  getFolders,
  createNote,
  updateNote,
  deleteNote,
  createFolder,
  deleteFolder,
} from "@/services/notes.client"
import { NoteFolderSidebar } from "./note-folder-sidebar"
import { NoteCard } from "./note-card"
import { NoteDetailDrawer } from "./note-detail-drawer"
import { NewNoteDialog } from "./new-note-dialog"
import { Search, Plus, Pin, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

type NoteView = "all" | "pinned" | "tagged"

export function NotePageShell({
  initialNotes,
  initialFolders,
  workspaceId,
  userId,
}: {
  initialNotes: Note[]
  initialFolders: NoteFolder[]
  workspaceId: string
  userId: string
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [folders, setFolders] = useState<NoteFolder[]>(initialFolders)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [view, setView] = useState<NoteView>("all")
  const [search, setSearch] = useState("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const refreshNotes = useCallback(async () => {
    const updated = await getNotes(workspaceId)
    setNotes(updated)
  }, [workspaceId])

  const refreshFolders = useCallback(async () => {
    const updated = await getFolders(workspaceId)
    setFolders(updated)
  }, [workspaceId])

  const handleCreateNote = useCallback(
    async (data: { title: string; folder_id?: string | null }) => {
      const note = await createNote({
        workspace_id: workspaceId,
        user_id: userId,
        title: data.title,
        folder_id: data.folder_id ?? selectedFolderId,
        content: null,
        pinned: false,
        tags: [],
      })
      if (note) {
        await refreshNotes()
        setSelectedNote(note)
        setDrawerOpen(true)
        toast.success("Note created")
      } else {
        toast.error("Failed to create note")
      }
    },
    [workspaceId, userId, selectedFolderId, refreshNotes],
  )

  const handleCreateFolder = useCallback(
    async (name: string) => {
      const folder = await createFolder({
        workspace_id: workspaceId,
        user_id: userId,
        name,
      })
      if (folder) {
        await refreshFolders()
        toast.success("Folder created")
      } else {
        toast.error("Failed to create folder")
      }
    },
    [workspaceId, userId, refreshFolders],
  )

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      const ok = await deleteFolder(id)
      if (ok) {
        if (selectedFolderId === id) setSelectedFolderId(null)
        await refreshFolders()
        await refreshNotes()
        toast.success("Folder deleted")
      } else {
        toast.error("Failed to delete folder")
      }
    },
    [selectedFolderId, refreshFolders, refreshNotes],
  )

  const handleDeleteNote = useCallback(
    async (id: string) => {
      const ok = await deleteNote(id)
      if (ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id))
        toast.success("Note deleted")
      } else {
        toast.error("Failed to delete note")
      }
    },
    [],
  )

  const handleTogglePin = useCallback(
    async (id: string, pinned: boolean) => {
      const ok = await updateNote(id, { pinned: !pinned })
      if (ok) {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !pinned } : n)))
      }
    },
    [],
  )

  const handleNoteUpdated = useCallback(async () => {
    await refreshNotes()
  }, [refreshNotes])

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  const filteredNotes = notes.filter((note) => {
    if (selectedFolderId && note.folder_id !== selectedFolderId) return false
    if (view === "pinned" && !note.pinned) return false
    if (view === "tagged" && note.tags.length === 0) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        note.title.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q)) ||
        (note.content && note.content.toLowerCase().includes(q))
      )
    }
    return true
  })

  const pinnedNotes = filteredNotes.filter((n) => n.pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned)

  return (
    <div className="flex min-h-screen bg-background">
      <NoteFolderSidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        noteCounts={notes.reduce<Record<string, number>>((acc, n) => {
          const key = n.folder_id ?? "__unfiled"
          acc[key] = (acc[key] ?? 0) + 1
          return acc
        }, {})}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {selectedFolderId
                ? folders.find((f) => f.id === selectedFolderId)?.name ?? "Notes"
                : "All Notes"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="h-8 w-48 rounded-lg border border-border/40 bg-secondary/50 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <NewNoteDialog folders={folders} onCreateNote={handleCreateNote}>
              <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90">
                <Plus size={14} />
                New note
              </span>
            </NewNoteDialog>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border/40 px-6 py-2">
          {([
            { value: "all" as const, label: "All", icon: null },
            { value: "pinned" as const, label: "Pinned", icon: Pin },
            { value: "tagged" as const, label: "Tagged", icon: Tag },
          ]).map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setView(f.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                view === f.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.icon && <f.icon size={12} />}
              {f.label}
            </button>
          ))}
          {allTags.length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              {allTags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearch(tag)}
                  className="rounded-md border border-border/40 bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">
                {search ? "No notes found" : "No notes yet"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first note to get started."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pinnedNotes.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pinned
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        folders={folders}
                        onClick={() => {
                          setSelectedNote(note)
                          setDrawerOpen(true)
                        }}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </div>
              )}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Recent
                    </h3>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        folders={folders}
                        onClick={() => {
                          setSelectedNote(note)
                          setDrawerOpen(true)
                        }}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NoteDetailDrawer
        note={selectedNote}
        folders={folders}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onNoteUpdated={handleNoteUpdated}
        onNoteDeleted={handleDeleteNote}
      />
    </div>
  )
}
