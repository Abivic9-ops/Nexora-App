"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"

export function AppLayoutShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode
  isAdmin: boolean
}) {
  const pathname = usePathname()
  const showSidebar = !pathname.startsWith("/onboarding")

  return (
    <div className="flex min-h-screen">
      {showSidebar && <AppSidebar isAdmin={isAdmin} />}
      <main className={`flex-1${showSidebar ? " pl-56" : ""}`}>{children}</main>
    </div>
  )
}
