"use client"

import * as React from "react"
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
  useShortcuts()

  React.useEffect(() => {
    const customEventDown = () => setOpen((o) => !o)
    document.addEventListener("open-command-palette", customEventDown)
    return () => {
      document.removeEventListener("open-command-palette", customEventDown)
    }
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Jump to anything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => console.log('Quick Capture Task')}>
            <span>Quick Capture Task</span>
            <CommandShortcut>⌘+Shift+C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => console.log('New Note')}>
            <span>New Note</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem>Dashboard</CommandItem>
          <CommandItem>Tasks</CommandItem>
          <CommandItem>Projects</CommandItem>
          <CommandItem>Focus Mode</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
