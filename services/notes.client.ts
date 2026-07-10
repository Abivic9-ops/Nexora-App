import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Note, NoteInsert, NoteUpdate, NoteFolder, NoteFolderInsert } from "@/lib/supabase/types"

export type { Note, NoteInsert, NoteUpdate, NoteFolder, NoteFolderInsert }

export async function getNotes(workspaceId: string): Promise<Note[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
  return (data ?? []) as Note[]
}

export async function getNoteById(id: string): Promise<Note | null> {
  const supabase = createBrowserClient()
  const { data } = await supabase.from("notes").select("*").eq("id", id).single()
  return (data ?? null) as Note | null
}

export async function createNote(input: Omit<NoteInsert, "id" | "created_at" | "updated_at">): Promise<Note | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("notes")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createNote error:", error)
    return null
  }
  return data as unknown as Note
}

export async function updateNote(id: string, updates: NoteUpdate): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("updateNote error:", error)
    return false
  }
  return true
}

export async function deleteNote(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("notes").delete().eq("id", id)
  if (error) {
    console.error("deleteNote error:", error)
    return false
  }
  return true
}

export async function getFolders(workspaceId: string): Promise<NoteFolder[]> {
  const supabase = createBrowserClient()
  const { data } = await supabase
    .from("note_folders")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true })
  return (data ?? []) as NoteFolder[]
}

export async function createFolder(input: Omit<NoteFolderInsert, "id" | "created_at" | "updated_at">): Promise<NoteFolder | null> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("note_folders")
    .insert(input)
    .select("*")
    .single()
  if (error) {
    console.error("createFolder error:", error)
    return null
  }
  return data as unknown as NoteFolder
}

export async function deleteFolder(id: string): Promise<boolean> {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("note_folders").delete().eq("id", id)
  if (error) {
    console.error("deleteFolder error:", error)
    return false
  }
  return true
}
