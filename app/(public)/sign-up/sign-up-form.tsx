"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUpWithEmail, signInWithGoogle, resendVerificationEmail } from "@/lib/actions/auth"
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"

const signUpSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pending, setPending] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState("")

  const onSubmit = handleSubmit(async (values) => {
    setPending(true)
    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("password", values.password)
    const result = await signUpWithEmail(formData)
    if (result?.error) {
      setError("root", { message: result.error })
      setPending(false)
    } else if (result && "verificationRequired" in result) {
      setVerificationEmail(result.email as string)
      setVerificationMessage(result.message as string)
      setPending(false)
    } else {
      toast.success("Account created!")
    }
  })

  const handleResend = async () => {
    if (!verificationEmail) return
    setResent(false)
    setResendError("")
    const result = await resendVerificationEmail(verificationEmail)
    if (result?.error) {
      setResendError(result.error)
    } else {
      setResent(true)
    }
  }

  if (verificationEmail) {
    return (
      <>
        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <CheckCircle size={24} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {verificationMessage ?? "We sent a verification link. Please check your inbox and click the link to continue."}
          </p>
          {resent ? (
            <p className="text-xs text-primary">Verification email resent!</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-primary hover:text-primary/80 underline underline-offset-2"
            >
              Didn&apos;t get it? Resend
            </button>
          )}
          {resendError && (
            <p className="text-xs text-destructive">{resendError}</p>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {errors.root && (
        <div className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3" noValidate>
        <div>
          <label htmlFor="email" className="text-xs font-medium text-foreground">
            Email
          </label>
          <div className="relative mt-1.5">
            <Mail
              size={14}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-8"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-medium text-foreground">
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={14}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className="pl-8 pr-8"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((o) => !o)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
            Confirm password
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={14}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="pl-8 pr-8"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((o) => !o)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-xs text-muted-foreground">or continue with</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={async () => {
            clearErrors("root")
            const result = await signInWithGoogle()
            if (result?.error) {
              setError("root", { message: result.error })
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>

      </div>
    </>
  )
}
