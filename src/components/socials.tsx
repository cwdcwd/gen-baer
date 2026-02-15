"use client"

import type { GeneratedTheme } from "@/lib/theme-schema"
import type { resumeData } from "@/lib/resume-data"
import { Github, Twitter, Linkedin, BookOpen, ExternalLink } from "lucide-react"

interface SocialsProps {
  theme: GeneratedTheme
  variant: GeneratedTheme["style"]["layoutVariant"]
  socials: typeof resumeData.socials
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  book: BookOpen,
}

export function Socials({ theme, variant, socials }: SocialsProps) {
  if (variant === "terminal") {
    return (
      <section
        className="flex flex-col gap-4 py-8"
        style={{
          fontFamily: "var(--theme-mono-font)",
          borderBottom: `1px solid var(--theme-border)`,
        }}
      >
        <div className="text-sm" style={{ color: "var(--theme-fg-muted)" }}>
          {'> cat links.txt'}
        </div>
        <div className="flex flex-col gap-2">
          {socials.map((social, i) => {
            return (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-sm hover:underline"
              >
                <span style={{ color: "var(--theme-accent)" }}>{'> '}</span>
                <span style={{ color: "var(--theme-fg)" }}>{social.platform}</span>
                <span style={{ color: "var(--theme-fg-muted)" }}> :: {social.url}</span>
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  if (variant === "brutalist") {
    return (
      <section className="py-10" style={{ borderBottom: `4px solid var(--theme-fg)` }}>
        <h2
          className="mb-8 text-2xl font-black uppercase"
          style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
        >
          {theme.copy.socialsSectionTitle}
        </h2>
        <div className="flex flex-wrap gap-4">
          {socials.map((social, i) => {
            const Icon = ICON_MAP[social.icon] || ExternalLink
            return (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 border-2 px-4 py-3 font-bold uppercase transition-colors"
                style={{
                  borderColor: "var(--theme-fg)",
                  color: "var(--theme-fg)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.backgroundColor = "var(--theme-fg)"
                  el.style.color = "var(--theme-bg)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.backgroundColor = "transparent"
                  el.style.color = "var(--theme-fg)"
                }}
              >
                <Icon className="h-5 w-5" />
                {social.platform}
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  if (variant === "magazine") {
    return (
      <section className="py-16">
        <div
          className="mb-2 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--theme-accent)" }}
        >
          {theme.copy.socialsSectionTitle}
        </div>
        <div className="mb-8 h-px" style={{ backgroundColor: "var(--theme-border)" }} />
        <div className="flex flex-wrap gap-8">
          {socials.map((social, i) => {
            const Icon = ICON_MAP[social.icon] || ExternalLink
            return (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 transition-opacity hover:opacity-70"
              >
                <Icon className="h-4 w-4" style={{ color: "var(--theme-fg-muted)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--theme-fg)" }}>
                  {social.platform}
                </span>
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  if (variant === "cards") {
    return (
      <section className="py-12">
        <h2
          className="mb-8 text-2xl font-bold"
          style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
        >
          {theme.copy.socialsSectionTitle}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {socials.map((social, i) => {
            const Icon = ICON_MAP[social.icon] || ExternalLink
            return (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-animate group flex flex-col items-center gap-3 p-6 text-center transition-transform hover:scale-105"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: "var(--theme-bg-secondary)",
                  borderRadius: "var(--theme-radius)",
                  border: `1px solid var(--theme-border)`,
                }}
              >
                <Icon className="h-6 w-6" style={{ color: "var(--theme-accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--theme-fg)" }}>
                  {social.platform}
                </span>
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  // Classic
  return (
    <section className="py-12">
      <h2
        className="mb-6 text-2xl font-bold"
        style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
      >
        {theme.copy.socialsSectionTitle}
      </h2>
      <div className="flex flex-wrap gap-6">
        {socials.map((social, i) => {
          const Icon = ICON_MAP[social.icon] || ExternalLink
          return (
            <a
              key={i}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-animate flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Icon className="h-5 w-5" style={{ color: "var(--theme-accent)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--theme-fg)" }}>
                {social.platform}
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
