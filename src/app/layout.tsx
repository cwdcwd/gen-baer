import type { Metadata, Viewport } from "next"
import Script from "next/script"
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
      <body className="min-h-screen antialiased">
        {children}
        <Script
          data-goatcounter="https://lazybaer.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        />
      </body>
    </html>
  )
}
