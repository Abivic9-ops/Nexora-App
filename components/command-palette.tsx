"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useShortcuts } from "@/hooks/use-shortcuts"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  useShortcuts()

  React.useEffect(() => {
    const customEventDown = () => setOpen((o) => !o)
    document.addEventListener("open-command-palette", customEventDown)
    return () => {
      document.removeEventListener("open-command-palette", customEventDown)
    }
  }, [])

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to anything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate("/notes")}>
            <span>New Note</span>
            <CommandShortcut>Ctrl+N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/research")}>
            <span>Save Source</span>
            <CommandShortcut>Ctrl+Shift+R</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/news")}>
            <span>Add Briefing</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/dashboard")}>
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate("/tasks")}>
            Tasks
          </CommandItem>
          <CommandItem onSelect={() => navigate("/projects")}>
            Projects
          </CommandItem>
          <CommandItem onSelect={() => navigate("/goals")}>
            Goals
          </CommandItem>
          <CommandItem onSelect={() => navigate("/habits")}>
            Habits
          </CommandItem>
          <CommandItem onSelect={() => navigate("/calendar")}>
            Calendar
          </CommandItem>
          <CommandItem onSelect={() => navigate("/focus")}>
            Focus Mode
          </CommandItem>
          <CommandItem onSelect={() => navigate("/notes")}>
            Notes
          </CommandItem>
          <CommandItem onSelect={() => navigate("/research")}>
            Research
          </CommandItem>
          <CommandItem onSelect={() => navigate("/news")}>
            News
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
