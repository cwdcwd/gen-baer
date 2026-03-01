import type { GeneratedTheme } from "@/lib/theme-schema"

interface HeroProps {
  theme: GeneratedTheme
  variant: GeneratedTheme["style"]["layoutVariant"]
}

export function Hero({ theme, variant }: HeroProps) {
  const baseClasses = "flex flex-col items-center text-center"

  const variantStyles: Record<string, string> = {
    classic: "py-24 gap-6",
    brutalist: "py-16 gap-4 items-start text-left border-b-4",
    cards: "py-20 gap-6",
    terminal: "py-12 gap-3 items-start text-left font-mono",
    magazine: "py-28 gap-8",
  }

  if (variant === "terminal") {
    return (
      <section
        className="flex flex-col gap-3 py-12"
        style={{
          fontFamily: "var(--theme-mono-font)",
          borderBottom: `1px solid var(--theme-border)`,
        }}
      >
        <div
          className="text-sm"
          style={{ color: "var(--theme-fg-muted)" }}
        >
          {'> whoami'}
        </div>
        <h1
          className="text-3xl font-bold md:text-5xl"
          style={{
            fontFamily: "var(--theme-mono-font)",
            color: "var(--theme-accent)",
          }}
        >
          {theme.copy.heroHeadline}
        </h1>
        <p
          className="text-lg"
          style={{ color: "var(--theme-fg-muted)" }}
        >
          {'> '}{theme.copy.heroSubtext}
        </p>
        <div
          className="mt-2 h-3 w-3 animate-pulse"
          style={{ backgroundColor: "var(--theme-accent)" }}
        />
      </section>
    )
  }

  if (variant === "brutalist") {
    return (
      <section
        className="flex flex-col items-start gap-4 py-16 text-left"
        style={{ borderBottom: `4px solid var(--theme-fg)` }}
      >
        <h1
          className="text-5xl font-black uppercase tracking-tight md:text-8xl"
          style={{
            fontFamily: "var(--theme-heading-font)",
            color: "var(--theme-fg)",
            lineHeight: 0.9,
          }}
        >
          {theme.copy.heroHeadline}
        </h1>
        <p
          className="text-xl font-bold uppercase md:text-2xl"
          style={{ color: "var(--theme-accent)" }}
        >
          {theme.copy.heroSubtext}
        </p>
      </section>
    )
  }

  if (variant === "magazine") {
    return (
      <section className="flex flex-col items-center gap-8 py-28 text-center">
        <p
          className="text-sm font-medium uppercase tracking-[0.3em]"
          style={{ color: "var(--theme-accent)" }}
        >
          {theme.copy.siteTitle}
        </p>
        <h1
          className="max-w-4xl text-5xl font-light leading-tight md:text-7xl"
          style={{
            fontFamily: "var(--theme-heading-font)",
            color: "var(--theme-fg)",
          }}
        >
          {theme.copy.heroHeadline}
        </h1>
        <div
          className="h-px w-24"
          style={{ backgroundColor: "var(--theme-accent)" }}
        />
        <p
          className="max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--theme-fg-muted)" }}
        >
          {theme.copy.heroSubtext}
        </p>
      </section>
    )
  }

  // Classic and Cards
  return (
    <section className={`${baseClasses} ${variantStyles[variant] || variantStyles.classic}`}>
      <p
        className="text-sm font-medium uppercase tracking-widest"
        style={{ color: "var(--theme-accent)" }}
      >
        {theme.copy.siteTitle}
      </p>
      <h1
        className="text-4xl font-bold tracking-tight md:text-6xl"
        style={{
          fontFamily: "var(--theme-heading-font)",
          color: "var(--theme-fg)",
        }}
      >
        {theme.copy.heroHeadline}
      </h1>
      <p
        className="max-w-2xl text-lg leading-relaxed"
        style={{ color: "var(--theme-fg-muted)" }}
      >
        {theme.copy.heroSubtext}
      </p>
    </section>
  )
}
