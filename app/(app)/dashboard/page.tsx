import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your NEXORA execution dashboard.",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-2xl font-bold text-primary">N</span>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your execution hub is loading. Phase 6 will build this surface.
        </p>
      </div>
    </div>
  )
}
