import type { GeneratedTheme } from "@/lib/theme-schema"

interface FooterProps {
  theme: GeneratedTheme
  variant: GeneratedTheme["style"]["layoutVariant"]
}

export function SiteFooter({ theme, variant }: FooterProps) {
  const generatedDate = new Date(theme.generatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  if (variant === "terminal") {
    return (
      <footer
        className="flex flex-col gap-2 py-8"
        style={{ fontFamily: "var(--theme-mono-font)" }}
      >
        <div className="text-xs" style={{ color: "var(--theme-fg-muted)" }}>
          {'---'}
        </div>
        <div className="text-xs" style={{ color: "var(--theme-fg-muted)" }}>
          {theme.copy.footerText}
        </div>
        <div className="text-xs" style={{ color: "var(--theme-border)" }}>
          theme: {theme.themeName} | generated: {generatedDate}
        </div>
        <div className="text-xs" style={{ color: "var(--theme-border)" }}>
          {'> _'}
        </div>
      </footer>
    )
  }

  if (variant === "brutalist") {
    return (
      <footer className="py-10">
        <p className="text-sm font-bold uppercase" style={{ color: "var(--theme-fg-muted)" }}>
          {theme.copy.footerText}
        </p>
        <p className="mt-2 text-xs uppercase" style={{ color: "var(--theme-border)" }}>
          Theme: {theme.themeName} / Generated: {generatedDate}
        </p>
      </footer>
    )
  }

  if (variant === "magazine") {
    return (
      <footer className="py-16 text-center">
        <div className="mb-4 h-px" style={{ backgroundColor: "var(--theme-border)" }} />
        <p className="text-sm" style={{ color: "var(--theme-fg-muted)" }}>
          {theme.copy.footerText}
        </p>
        <p className="mt-2 text-xs" style={{ color: "var(--theme-border)" }}>
          Current theme: {theme.themeName} &middot; Generated {generatedDate}
        </p>
      </footer>
    )
  }

  // Classic and Cards
  return (
    <footer className="py-12 text-center">
      <p className="text-sm" style={{ color: "var(--theme-fg-muted)" }}>
        {theme.copy.footerText}
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--theme-border)" }}>
        Theme: {theme.themeName} &middot; Last generated {generatedDate}
      </p>
    </footer>
  )
}
