import { createClient as createServerClient } from "@/lib/supabase/server"

import type { GraphEdge, GraphEdgeInsert, EdgeType, EntityType } from "@/lib/supabase/types"

export async function getEdges(workspaceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("graph_edges")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
  return (data ?? []) as GraphEdge[]
}

export async function getOutgoingEdges(sourceType: EntityType, sourceId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("graph_edges")
    .select("*")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
  return (data ?? []) as GraphEdge[]
}

export async function getIncomingEdges(targetType: EntityType, targetId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from("graph_edges")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
  return (data ?? []) as GraphEdge[]
}

export async function createEdge(input: GraphEdgeInsert) {
  const supabase = await createServerClient()
  const { data } = await supabase.from("graph_edges").insert(input).select().single()
  return data as GraphEdge | null
}

export async function deleteEdge(id: string) {
  const supabase = await createServerClient()
  await supabase.from("graph_edges").delete().eq("id", id)
}

export async function linkTaskToGoal(params: {
  workspaceId: string
  taskId: string
  goalId: string
  edgeType?: EdgeType
}) {
  return createEdge({
    workspace_id: params.workspaceId,
    source_type: "task",
    source_id: params.taskId,
    target_type: "goal",
    target_id: params.goalId,
    edge_type: params.edgeType ?? "contributes_to",
  })
}
