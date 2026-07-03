import type { Metadata } from "next"
import { LandingNav } from "@/features/landing/landing-nav"
import { HeroSection } from "@/features/landing/hero-section"
import { FeaturesSection } from "@/features/landing/features-section"
import { RitualSection } from "@/features/landing/ritual-section"
import { AssistantSection } from "@/features/landing/assistant-section"
import { TestimonialSection } from "@/features/landing/testimonial-section"
import { CtaSection } from "@/features/landing/cta-section"

export const metadata: Metadata = {
  title: "NEXORA | AI-Powered Execution OS — Master Your Day. Build Your Legacy.",
  description:
    "NEXORA is the premium AI-powered execution operating system that unifies tasks, projects, goals, habits, focus, notes, research, news, and an AI assistant into one seamless workspace. Replace six tools with one system.",
  openGraph: {
    title: "NEXORA | AI-Powered Execution OS — Master Your Day. Build Your Legacy.",
    description:
      "One system for serious operators. Tasks, projects, goals, habits, focus, notes, research, and AI — unified. Replace six tools with NEXORA's execution operating system.",
    url: "https://nexora.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NEXORA Execution OS — Master your day. Build your legacy.",
      },
    ],
  },
  twitter: {
    title: "NEXORA | AI-Powered Execution OS",
    description:
      "One system for serious operators. Tasks, projects, goals, habits, focus, notes, research, and AI — unified.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://nexora.app",
  },
  keywords: [
    "AI execution OS",
    "productivity operating system",
    "task and project management",
    "goal and habit tracker",
    "AI productivity assistant",
    "focus timer Pomodoro",
    "personal productivity system",
    "execution score",
    "NEXORA app",
  ],
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "@id": "https://nexora.app/#software",
                name: "NEXORA",
                applicationCategory: "ProductivityApplication",
                operatingSystem: "Web",
                description:
                  "NEXORA is an AI-powered execution operating system that unifies tasks, projects, goals, habits, focus, notes, research, news, and an AI assistant into a single premium workspace.",
                url: "https://nexora.app",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free Personal plan with all core features. Pro plan available.",
                },
                author: {
                  "@type": "Organization",
                  name: "NEXORA",
                },
              },
              {
                "@type": "Organization",
                "@id": "https://nexora.app/#organization",
                name: "NEXORA",
                url: "https://nexora.app",
                description: "Premium AI-powered execution OS for serious operators.",
                slogan: "Master your day. Build your legacy.",
                foundingDate: "2025",
              },
              {
                "@type": "WebSite",
                "@id": "https://nexora.app/#website",
                url: "https://nexora.app",
                name: "NEXORA",
                description: "AI-Powered Execution Operating System",
                publisher: { "@id": "https://nexora.app/#organization" },
              },
              {
                "@type": "WebPage",
                "@id": "https://nexora.app/#webpage",
                url: "https://nexora.app",
                name: "NEXORA | AI-Powered Execution OS",
                description:
                  "NEXORA unifies tasks, projects, goals, habits, focus, notes, research, news, and an AI assistant into a single premium execution operating system.",
                isPartOf: { "@id": "https://nexora.app/#website" },
              },
            ],
          }),
        }}
      />
      <main>
        <LandingNav />
        <HeroSection />
        <FeaturesSection />
        <RitualSection />
        <AssistantSection />
        <TestimonialSection />
        <CtaSection />
      </main>
    </>
  )
}
