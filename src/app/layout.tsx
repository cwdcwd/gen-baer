import type { Metadata, Viewport } from "next"
import { resumeData } from "@/lib/resume-data"
import "./globals.css"

export const metadata: Metadata = {
  title: `${resumeData.name} | Portfolio`,
  description: resumeData.tagline,
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
