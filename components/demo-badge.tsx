"use client"

import { isSupabaseConfigured } from "@/lib/supabase/check"
import { ShieldAlert } from "lucide-react"

export function DemoBadge() {
  if (isSupabaseConfigured()) return null

  return (
    <div className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 backdrop-blur-sm">
      <ShieldAlert size={12} />
      Demo Mode
    </div>
  )
}
