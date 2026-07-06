"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPassword } from "@/lib/actions/auth"
import { Mail, CheckCircle } from "lucide-react"

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setPending(true)

    const formData = new FormData(e.currentTarget)

    const result = await forgotPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
    setPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Forgot password?
          </button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Mail size={18} className="text-primary" />
          </div>
          <DialogTitle className="mt-2">
            {sent ? "Check your email" : "Reset your password"}
          </DialogTitle>
          <DialogDescription>
            {sent
              ? "If an account exists with that email, we have sent a password reset link."
              : "Enter your email address and we will send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle size={32} className="text-primary" />
            <p className="text-xs text-muted-foreground">
              No email yet? Check your spam folder or try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-xs font-medium text-foreground">
                Email
              </label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
