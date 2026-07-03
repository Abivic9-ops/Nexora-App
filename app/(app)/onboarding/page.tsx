import type { Metadata } from "next"
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard"

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your NEXORA execution operating system.",
  robots: { index: false, follow: false },
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
