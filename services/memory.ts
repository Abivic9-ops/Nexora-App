import { createClient as createServerClient } from "@/lib/supabase/server"

import type { DecisionMemory, DecisionMemoryInsert } from "@/lib/supabase/types"

export async function getDecisions(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("decision_memory")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as DecisionMemory[]
}

export async function getDecisionsForEntity(entityType: string, entityId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("decision_memory")
    .select("*")
    .eq("context_type", entityType)
    .eq("context_id", entityId)
    .order("created_at", { ascending: false })
  return (data ?? []) as DecisionMemory[]
}

export async function recordDecision(input: DecisionMemoryInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("decision_memory").insert(input).select().single()
  return data as DecisionMemory | null
}

export async function updateOutcome(id: string, outcome: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("decision_memory")
    .update({ outcome })
    .eq("id", id)
    .select()
    .single()
  return data as DecisionMemory | null
}
