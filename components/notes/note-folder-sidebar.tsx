"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Folder, FolderPlus, Trash2 } from "lucide-react"

export function NoteFolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  noteCounts,
}: {
  folders: { id: string; name: string }[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
  noteCounts: Record<string, number>
}) {
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  const handleCreate = () => {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    onCreateFolder(trimmed)
    setNewFolderName("")
    setNewFolderOpen(false)
  }

  return (
    <div className="flex h-full w-52 flex-col border-r border-border/40 bg-card/50">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Folders
        </h3>
        <button
          type="button"
          onClick={() => setNewFolderOpen(true)}
          className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <FolderPlus size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            selectedFolderId === null
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
          )}
        >
          <Folder size={13} />
          <span className="flex-1 text-left">All Notes</span>
          <span className="text-[10px] text-muted-foreground/70">
            {Object.values(noteCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {folders.map((folder) => (
          <div key={folder.id} className="group flex items-center">
            <button
              type="button"
              onClick={() => onSelectFolder(folder.id)}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                selectedFolderId === folder.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <Folder size={13} />
              <span className="flex-1 text-left truncate">{folder.name}</span>
              <span className="text-[10px] text-muted-foreground/70">
                {noteCounts[folder.id] ?? 0}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteFolder(folder.id)
              }}
              className="mr-1 flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:text-muted-foreground"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}

        {newFolderOpen && (
          <div className="mt-1 flex items-center gap-1 px-1">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
                if (e.key === "Escape") {
                  setNewFolderOpen(false)
                  setNewFolderName("")
                }
              }}
              placeholder="Folder name"
              autoFocus
              className="h-7 flex-1 rounded-md border border-border/40 bg-secondary/50 px-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <Button size="xs" onClick={handleCreate} className="h-7 px-2">
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
