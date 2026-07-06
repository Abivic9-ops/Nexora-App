"use client"

import { useState } from "react"
import { Shield, ShieldOff, User, Mail } from "lucide-react"
import { promoteToAdmin, demoteToMember } from "@/lib/actions/admin"
import type { MembershipWithProfile } from "@/services/memberships"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
  owner: "Owner",
}

export function AdminPanel({
  members,
  currentUserId,
}: {
  members: MembershipWithProfile[]
  currentUserId: string
}) {
  const [error, setError] = useState("")

  const handlePromote = async (membershipId: string) => {
    setError("")
    const result = await promoteToAdmin(membershipId)
    if (result?.error) setError(result.error)
  }

  const handleDemote = async (membershipId: string) => {
    setError("")
    const result = await demoteToMember(membershipId)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users and roles in your workspace.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const profile = (m as any).profiles as {
                email: string
                full_name: string | null
                avatar_url: string | null
              }
              const isSelf = m.user_id === currentUserId
              const isAdmin = m.role === "admin"
              const isOwner = m.role === "owner"

              return (
                <tr key={m.id} className="border-b border-border/20 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                        {profile.full_name?.charAt(0)?.toUpperCase() ?? profile.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {profile.full_name ?? "Unnamed"}
                          {isSelf && (
                            <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={10} />
                          {profile.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isOwner
                          ? "bg-amber-500/10 text-amber-400"
                          : isAdmin
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isOwner || isAdmin ? <Shield size={10} /> : <User size={10} />}
                      {ROLE_LABELS[m.role] ?? m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isOwner ? (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    ) : isAdmin ? (
                      <button
                        onClick={() => handleDemote(m.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-border/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                      >
                        <ShieldOff size={11} />
                        Demote to member
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePromote(m.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-border/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        <Shield size={11} />
                        Promote to admin
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground/60">
        Admins can manage users, roles, and workspace settings. Owners cannot be demoted.
      </p>
    </div>
  )
}
