import type { Metadata } from "next"
import Link from "next/link"
import { SignInForm } from "./sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to NEXORA — your AI-powered execution operating system.",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            NEXORA
          </span>
        </Link>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h1 className="text-lg font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your execution OS.
          </p>

          <SignInForm />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
