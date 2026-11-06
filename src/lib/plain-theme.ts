import { LAYOUT_VARIANT, ANIMATION_STYLE } from "./constants"
import { resumeData } from "./resume-data"
import type { GeneratedTheme } from "./theme-schema"

export const PLAIN_THEME_SLUG = "boring"

/**
 * A deliberately boring, built-in theme: the resume as written, with no themed
 * copy, background image or animation. Lives in code rather than Redis, so it
 * is never regenerated and is not part of the random rotation.
 */
export const plainTheme: GeneratedTheme = {
  themeName: "Boring",
  themeSlug: PLAIN_THEME_SLUG,
  generatedAt: "2026-11-06T00:00:00.000Z",
  colors: {
    background: "#ffffff",
    backgroundSecondary: "#f6f7f9",
    foreground: "#1a1a1a",
    foregroundMuted: "#4b5563",
    accent: "#1f4e8c",
    accentSecondary: "#6b7280",
    border: "#e5e7eb",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
  },
  copy: {
    siteTitle: "Portfolio",
    heroHeadline: resumeData.name,
    heroSubtext: resumeData.tagline,
    bioText: resumeData.bio,
    projectsSectionTitle: "Projects",
    readingSectionTitle: "Reading",
    socialsSectionTitle: "Links",
    footerText: `© ${resumeData.name}`,
  },
  // Empty: every project renders with its plain name and description
  projectDescriptions: [],
  style: {
    layoutVariant: LAYOUT_VARIANT.CLASSIC,
    borderRadius: "6px",
    decorativeCSS: "",
    animationStyle: ANIMATION_STYLE.NONE,
  },
  backgroundImagePrompt: "",
  backgroundImage: null,
}
