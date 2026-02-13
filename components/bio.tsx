import type { GeneratedTheme } from "@/lib/theme-schema"

interface BioProps {
  theme: GeneratedTheme
  variant: GeneratedTheme["style"]["layoutVariant"]
}

export function Bio({ theme, variant }: BioProps) {
  const paragraphs = theme.copy.bioText.split("\n").filter(Boolean)

  if (variant === "terminal") {
    return (
      <section
        className="flex flex-col gap-4 py-8"
        style={{
          fontFamily: "var(--theme-mono-font)",
          borderBottom: `1px solid var(--theme-border)`,
        }}
      >
        <div
          className="text-sm"
          style={{ color: "var(--theme-fg-muted)" }}
        >
          {'> cat about.txt'}
        </div>
        <div className="flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed"
              style={{ color: "var(--theme-fg)" }}
            >
              {p}
            </p>
          ))}
        </div>
      </section>
    )
  }

  if (variant === "brutalist") {
    return (
      <section
        className="py-10"
        style={{ borderBottom: `4px solid var(--theme-fg)` }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:gap-12">
          <h2
            className="shrink-0 text-2xl font-black uppercase md:w-48"
            style={{
              fontFamily: "var(--theme-heading-font)",
              color: "var(--theme-fg)",
            }}
          >
            About
          </h2>
          <div className="flex flex-col gap-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base leading-relaxed"
                style={{ color: "var(--theme-fg)" }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === "magazine") {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-2xl">
          <div
            className="mb-2 text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--theme-accent)" }}
          >
            About
          </div>
          <div
            className="mb-8 h-px"
            style={{ backgroundColor: "var(--theme-border)" }}
          />
          <div className="flex flex-col gap-6">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`leading-relaxed ${i === 0 ? "text-xl" : "text-base"}`}
                style={{
                  color: i === 0 ? "var(--theme-fg)" : "var(--theme-fg-muted)",
                  fontFamily: i === 0 ? "var(--theme-heading-font)" : "var(--theme-body-font)",
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Classic and Cards
  return (
    <section className="py-12">
      <h2
        className="mb-6 text-2xl font-bold"
        style={{
          fontFamily: "var(--theme-heading-font)",
          color: "var(--theme-fg)",
        }}
      >
        About
      </h2>
      <div
        className={`flex flex-col gap-4 ${variant === "cards" ? "rounded-lg p-6" : ""}`}
        style={
          variant === "cards"
            ? {
                backgroundColor: "var(--theme-bg-secondary)",
                borderRadius: "var(--theme-radius)",
                border: `1px solid var(--theme-border)`,
              }
            : {}
        }
      >
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-base leading-relaxed"
            style={{ color: "var(--theme-fg-muted)" }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  )
}
