import { createClient as createServerClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/check"
import type { Note, NoteInsert, NoteUpdate, NoteFolder, NoteFolderInsert } from "@/lib/supabase/types"

// ── Folders ──

export async function getFolders(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("note_folders")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true })
  return (data ?? []) as NoteFolder[]
}

export async function createFolder(input: NoteFolderInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("note_folders").insert(input).select().single()
  return data as NoteFolder | null
}

export async function deleteFolder(id: string) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("note_folders").delete().eq("id", id)
}

// ── Notes ──

export async function getNotes(workspaceId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
  return (data ?? []) as Note[]
}

export async function getNoteById(id: string) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("notes").select("*").eq("id", id).single()
  return data as Note | null
}

export async function getNotesByFolder(folderId: string) {
  if (!isSupabaseConfigured()) return []
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("folder_id", folderId)
    .order("updated_at", { ascending: false })
  return (data ?? []) as Note[]
}

export async function createNote(input: NoteInsert) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("notes").insert(input).select().single()
  return data as Note | null
}

export async function updateNote(id: string, input: NoteUpdate) {
  if (!isSupabaseConfigured()) return null
  const supabase = await createServerClient()
  const { data } = await supabase.from("notes").update(input).eq("id", id).select().single()
  return data as Note | null
}

export async function deleteNote(id: string) {
  if (!isSupabaseConfigured()) return
  const supabase = await createServerClient()
  await supabase.from("notes").delete().eq("id", id)
}
