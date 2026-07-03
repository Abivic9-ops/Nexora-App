import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://nexora.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "NEXORA | AI-Powered Execution OS — Master Your Day. Build Your Legacy.",
    template: "%s | NEXORA",
  },
  description:
    "NEXORA unifies tasks, projects, goals, habits, focus, notes, research, news, and an AI assistant into a single premium execution operating system. Built for serious operators.",
  keywords: [
    "execution OS",
    "productivity system",
    "AI productivity assistant",
    "task management",
    "project management",
    "goal tracking",
    "habit tracker",
    "focus timer",
    "personal OS",
    "second brain",
    "NEXORA",
    "execution score",
  ],
  applicationName: "NEXORA",
  authors: [{ name: "NEXORA" }],
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: "NEXORA",
  publisher: "NEXORA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "NEXORA",
    title: "NEXORA | AI-Powered Execution OS",
    description:
      "One system for serious operators. Tasks, projects, goals, habits, focus, notes, research, and AI — unified in a single execution operating system.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NEXORA Execution OS — Twelve surfaces. One mind.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXORA | AI-Powered Execution OS",
    description:
      "One system for serious operators. Tasks, projects, goals, habits, focus, notes, research, and AI — unified.",
    images: ["/og-image.png"],
    creator: "@nexora",
    site: "@nexora",
  },
  alternates: {
    canonical: baseUrl,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXORA",
  },
  formatDetection: {
    telephone: false,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delay={300}>
            {children}
            <CommandPalette />
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
