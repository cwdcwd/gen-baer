import type { GeneratedTheme } from "@/lib/theme-schema"
import type { resumeData } from "@/lib/resume-data"

interface ProjectsProps {
  theme: GeneratedTheme
  variant: GeneratedTheme["style"]["layoutVariant"]
  projects: typeof resumeData.projects
}

function getThemedProject(
  project: ProjectsProps["projects"][0],
  themedDescriptions: GeneratedTheme["projectDescriptions"]
) {
  const match = themedDescriptions.find(
    (td) => td.originalName.toLowerCase() === project.name.toLowerCase()
  )
  return {
    name: match?.themedName ?? project.name,
    description: match?.themedDescription ?? project.description,
    url: project.url,
    tags: project.tags,
  }
}

export function Projects({ theme, variant, projects }: ProjectsProps) {
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
          {'> ls ./projects'}
        </div>
        <div className="flex flex-col gap-6">
          {projects.map((project, i) => {
            const themed = getThemedProject(project, theme.projectDescriptions)
            return (
              <div key={i} className="theme-animate" style={{ animationDelay: `${i * 0.1}s` }}>
                <a
                  href={themed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1"
                >
                  <span className="text-sm">
                    <span style={{ color: "var(--theme-accent)" }}>{'> '}</span>
                    <span
                      className="underline decoration-dotted underline-offset-4 group-hover:decoration-solid"
                      style={{ color: "var(--theme-fg)" }}
                    >
                      {themed.name}
                    </span>
                  </span>
                  <span className="pl-4 text-sm" style={{ color: "var(--theme-fg-muted)" }}>
                    {themed.description}
                  </span>
                  <span className="pl-4 text-xs" style={{ color: "var(--theme-accent-secondary)" }}>
                    [{themed.tags.join(", ")}]
                  </span>
                </a>
              </div>
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
          {theme.copy.projectsSectionTitle}
        </h2>
        <div className="flex flex-col gap-0">
          {projects.map((project, i) => {
            const themed = getThemedProject(project, theme.projectDescriptions)
            return (
              <a
                key={i}
                href={themed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-animate group flex items-baseline justify-between gap-4 py-4"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  borderTop: `2px solid var(--theme-border)`,
                }}
              >
                <div>
                  <span
                    className="text-lg font-bold uppercase group-hover:underline"
                    style={{ color: "var(--theme-fg)" }}
                  >
                    {themed.name}
                  </span>
                  <p className="mt-1 text-sm" style={{ color: "var(--theme-fg-muted)" }}>
                    {themed.description}
                  </p>
                </div>
                <span
                  className="shrink-0 text-2xl font-black"
                  style={{ color: "var(--theme-accent)" }}
                  aria-hidden="true"
                >
                  {'\u2192'}
                </span>
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
          {theme.copy.projectsSectionTitle}
        </div>
        <div className="mb-8 h-px" style={{ backgroundColor: "var(--theme-border)" }} />
        <div className="grid gap-12 md:grid-cols-2">
          {projects.map((project, i) => {
            const themed = getThemedProject(project, theme.projectDescriptions)
            return (
              <a
                key={i}
                href={themed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-animate group flex flex-col gap-3"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "var(--theme-accent-secondary)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="text-xl font-semibold group-hover:underline"
                  style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
                >
                  {themed.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-fg-muted)" }}>
                  {themed.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {themed.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs"
                      style={{ color: "var(--theme-accent)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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
          {theme.copy.projectsSectionTitle}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project, i) => {
            const themed = getThemedProject(project, theme.projectDescriptions)
            return (
              <a
                key={i}
                href={themed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-animate group flex flex-col gap-3 p-6 transition-transform hover:scale-[1.02]"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: "var(--theme-bg-secondary)",
                  borderRadius: "var(--theme-radius)",
                  border: `1px solid var(--theme-border)`,
                }}
              >
                <h3
                  className="text-lg font-semibold group-hover:underline"
                  style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
                >
                  {themed.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-fg-muted)" }}>
                  {themed.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {themed.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs"
                      style={{
                        backgroundColor: "var(--theme-bg)",
                        color: "var(--theme-accent)",
                        borderRadius: "var(--theme-radius)",
                        border: `1px solid var(--theme-border)`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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
        className="mb-8 text-2xl font-bold"
        style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
      >
        {theme.copy.projectsSectionTitle}
      </h2>
      <div className="flex flex-col gap-8">
        {projects.map((project, i) => {
          const themed = getThemedProject(project, theme.projectDescriptions)
          return (
            <a
              key={i}
              href={themed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-animate group flex flex-col gap-2"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h3
                className="text-lg font-semibold group-hover:underline"
                style={{ fontFamily: "var(--theme-heading-font)", color: "var(--theme-fg)" }}
              >
                {themed.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-fg-muted)" }}>
                {themed.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {themed.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
