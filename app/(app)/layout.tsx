import type { Metadata } from "next"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getMembershipByUser } from "@/services/memberships"
import { AppLayoutShell } from "@/components/app-layout-shell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const membership = await getMembershipByUser(user.id)
    isAdmin = membership?.role === "admin"
  }

  return <AppLayoutShell isAdmin={isAdmin}>{children}</AppLayoutShell>
}
