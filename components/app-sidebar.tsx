"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Target,
  Repeat2,
  Timer,
  FileText,
  BookOpen,
  Newspaper,
  Calendar,
  BarChart2,
  Bot,
  Settings,
  Shield,
  LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habits", icon: Repeat2 },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  if (pathname.startsWith("/onboarding")) return null

  return (
    <aside className="fixed top-0 left-0 z-30 flex h-screen w-56 flex-col border-r border-border/40 bg-background">
      <div className="flex h-14 items-center gap-2 border-b border-border/40 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <span className="text-xs font-bold text-primary-foreground">N</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">NEXORA</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-border/40 p-2">
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/admin"
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            <Shield size={15} />
            Admin
          </Link>
        )}
      </div>
    </aside>
  )
}
