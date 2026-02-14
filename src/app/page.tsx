import { getTheme } from "@/lib/redis"
import { fetchReadingList } from "@/lib/hardcover"
import { resumeData } from "@/lib/resume-data"
import { fallbackTheme } from "@/lib/theme-schema"
import { ThemeStyleInjector } from "@/components/theme-style-injector"
import { Hero } from "@/components/hero"
import { Bio } from "@/components/bio"
import { Projects } from "@/components/projects"
import { ReadingList } from "@/components/reading-list"
import { Socials } from "@/components/socials"
import { SiteFooter } from "@/components/site-footer"
import { ThemeBadge } from "@/components/theme-badge"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [theme, books] = await Promise.all([
    getTheme().catch(() => null),
    fetchReadingList().catch(() => []),
  ])

  const currentTheme = theme ?? fallbackTheme
  const variant = currentTheme.style.layoutVariant

  // Layout width and padding varies by variant
  const containerStyles: Record<string, string> = {
    classic: "mx-auto max-w-3xl px-6",
    brutalist: "mx-auto max-w-4xl px-6 md:px-12",
    cards: "mx-auto max-w-5xl px-6",
    terminal: "mx-auto max-w-3xl px-6 font-mono",
    magazine: "mx-auto max-w-4xl px-8 md:px-16",
  }

  return (
    <>
      <ThemeStyleInjector theme={currentTheme} />
      <main className={containerStyles[variant] || containerStyles.classic}>
        <div className="theme-animate">
          <Hero theme={currentTheme} variant={variant} />
        </div>
        <div className="theme-animate theme-animate-delay-1">
          <Bio theme={currentTheme} variant={variant} />
        </div>
        <div className="theme-animate theme-animate-delay-2">
          <Projects
            theme={currentTheme}
            variant={variant}
            projects={resumeData.projects}
          />
        </div>
        <div className="theme-animate theme-animate-delay-3">
          <ReadingList
            theme={currentTheme}
            variant={variant}
            books={books}
          />
        </div>
        <div className="theme-animate theme-animate-delay-4">
          <Socials
            theme={currentTheme}
            variant={variant}
            socials={resumeData.socials}
          />
        </div>
        <SiteFooter theme={currentTheme} variant={variant} />
      </main>
      <ThemeBadge theme={currentTheme} />
    </>
  )
}
