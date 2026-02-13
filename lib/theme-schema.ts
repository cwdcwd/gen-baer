import { z } from "zod"

export const themeSchema = z.object({
  themeName: z.string().describe("Display name of the theme, e.g. '80s New Wave'"),
  themeSlug: z.string().describe("URL-friendly slug, e.g. '80s-new-wave'"),
  generatedAt: z.string().describe("ISO 8601 timestamp of when this theme was generated"),

  colors: z.object({
    background: z.string().describe("Primary background color as CSS hex, e.g. '#0a0a0a'"),
    backgroundSecondary: z.string().describe("Secondary background for cards/sections as CSS hex"),
    foreground: z.string().describe("Primary text color as CSS hex"),
    foregroundMuted: z.string().describe("Muted/secondary text color as CSS hex"),
    accent: z.string().describe("Primary accent color as CSS hex"),
    accentSecondary: z.string().describe("Secondary accent color as CSS hex"),
    border: z.string().describe("Border color as CSS hex"),
  }),

  typography: z.object({
    headingFont: z.string().describe("Google Fonts family name for headings, e.g. 'Orbitron'. Must be available on Google Fonts."),
    bodyFont: z.string().describe("Google Fonts family name for body text, e.g. 'Inter'. Must be available on Google Fonts."),
    monoFont: z.string().describe("Google Fonts family name for monospace text, e.g. 'JetBrains Mono'. Must be available on Google Fonts."),
  }),

  copy: z.object({
    siteTitle: z.string().describe("The site title rewritten in the theme's voice/style"),
    heroHeadline: z.string().describe("A compelling hero headline in the theme's voice"),
    heroSubtext: z.string().describe("A short subtext below the headline in the theme's voice"),
    bioText: z.string().describe("The person's bio completely rewritten in the theme's voice and style. Keep the facts, change the tone. 2-3 paragraphs."),
    projectsSectionTitle: z.string().describe("Section heading for projects, themed"),
    readingSectionTitle: z.string().describe("Section heading for reading list, themed"),
    socialsSectionTitle: z.string().describe("Section heading for social links, themed"),
    footerText: z.string().describe("A short footer line in the theme's voice"),
  }),

  projectDescriptions: z.array(
    z.object({
      originalName: z.string().describe("The original project name to match against"),
      themedName: z.string().describe("The project name rewritten in theme voice"),
      themedDescription: z.string().describe("The project description rewritten in theme voice"),
    })
  ).describe("Each project's name and description rewritten in the theme's voice"),

  style: z.object({
    layoutVariant: z.enum(["classic", "brutalist", "cards", "terminal", "magazine"]).describe("Which layout variant to use"),
    borderRadius: z.string().describe("CSS border-radius value, e.g. '0px' for brutalist, '16px' for soft"),
    decorativeCSS: z.string().describe("A CSS snippet for theme-specific decorative effects. Only use background, box-shadow, text-shadow, border, and filter properties. No JavaScript. Max 500 chars."),
    animationStyle: z.enum(["none", "subtle", "energetic"]).describe("Animation intensity level"),
  }),
})

export type GeneratedTheme = z.infer<typeof themeSchema>

// Default fallback theme used when Redis is empty and AI hasn't generated yet
export const fallbackTheme: GeneratedTheme = {
  themeName: "Default",
  themeSlug: "default",
  generatedAt: new Date().toISOString(),
  colors: {
    background: "#0a0a0a",
    backgroundSecondary: "#141414",
    foreground: "#fafafa",
    foregroundMuted: "#a1a1a1",
    accent: "#3b82f6",
    accentSecondary: "#8b5cf6",
    border: "#262626",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
  },
  copy: {
    siteTitle: "Portfolio",
    heroHeadline: "Hello, world.",
    heroSubtext: "Developer, reader, builder of things.",
    bioText: "A passionate developer who loves building things for the web. Always learning, always shipping. When not coding, you can find me buried in a good book or exploring new music.",
    projectsSectionTitle: "Projects",
    readingSectionTitle: "Reading List",
    socialsSectionTitle: "Connect",
    footerText: "Built with curiosity and caffeine.",
  },
  projectDescriptions: [],
  style: {
    layoutVariant: "classic",
    borderRadius: "8px",
    decorativeCSS: "",
    animationStyle: "subtle",
  },
}
