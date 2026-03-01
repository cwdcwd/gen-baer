import { z } from "zod"
import {
  LAYOUT_VARIANT,
  ANIMATION_STYLE,
  AI_CONFIG,
  ALLOWED_DECORATIVE_CSS_PROPERTIES,
} from "./constants"

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
    layoutVariant: z.enum([
      LAYOUT_VARIANT.CLASSIC,
      LAYOUT_VARIANT.BRUTALIST,
      LAYOUT_VARIANT.CARDS,
      LAYOUT_VARIANT.TERMINAL,
      LAYOUT_VARIANT.MAGAZINE,
    ]).describe("Which layout variant to use"),
    borderRadius: z.string().describe("CSS border-radius value, e.g. '0px' for brutalist, '16px' for soft"),
    decorativeCSS: z.string().describe(`A CSS snippet for theme-specific decorative effects. Only use ${ALLOWED_DECORATIVE_CSS_PROPERTIES.join(", ")} properties. No JavaScript. Max ${AI_CONFIG.MAX_DECORATIVE_CSS_LENGTH} chars.`),
    animationStyle: z.enum([
      ANIMATION_STYLE.NONE,
      ANIMATION_STYLE.SUBTLE,
      ANIMATION_STYLE.ENERGETIC,
    ]).describe("Animation intensity level"),
  }),

  // Background image prompt - used to generate the background image after theme creation
  backgroundImagePrompt: z.string().describe("A detailed DALL-E prompt to generate a background image that matches this theme. Should describe visual elements, mood, colors, and style. 100-200 words. The image will be used as a subtle full-page background, so it should work well faded/translucent."),
})

// Separate schema for background image data (populated after image generation)
export const backgroundImageSchema = z.object({
  url: z.string().describe("Vercel Blob URL of the generated background image"),
  blurDataUrl: z.string().describe("Base64-encoded tiny blur placeholder"),
  svgPattern: z.string().describe("SVG data URL for fallback pattern"),
  prompt: z.string().describe("The prompt used to generate the image"),
  generatedAt: z.string().describe("ISO 8601 timestamp"),
}).nullable()

export type BackgroundImage = z.infer<typeof backgroundImageSchema>

// Full theme with optional background image
export type GeneratedTheme = z.infer<typeof themeSchema> & {
  backgroundImage?: BackgroundImage
}

// Default fallback theme used when Redis is empty and AI hasn't generated yet
// Uses a fixed timestamp to avoid hydration mismatch between server and client
export const fallbackTheme: GeneratedTheme = {
  themeName: "Cyberpunk Noir",
  themeSlug: "cyberpunk-noir",
  generatedAt: "2026-02-13T00:00:00.000Z",
  colors: {
    background: "#0a0a12",
    backgroundSecondary: "#12121f",
    foreground: "#e0e0ff",
    foregroundMuted: "#7a7a9e",
    accent: "#00f0ff",
    accentSecondary: "#ff2a6d",
    border: "#1e1e3a",
  },
  typography: {
    headingFont: "Orbitron",
    bodyFont: "Rajdhani",
    monoFont: "Share Tech Mono",
  },
  copy: {
    siteTitle: "NEURAL.LINK//PORTFOLIO",
    heroHeadline: "Jacking into the grid.",
    heroSubtext: "Full-stack netrunner. Code architect. Digital ghost in the machine.",
    bioText: "In the neon-drenched corridors of the digital frontier, this operative builds systems that blur the line between human intention and machine execution. A full-stack architect who speaks fluent TypeScript and dreams in React components.\n\nWhen the screens go dark, you'll find them deep-diving into speculative fiction or dissecting the sonic landscapes of electronic music. Every project is a mission. Every line of code, a signal cutting through the noise.",
    projectsSectionTitle: "// ACTIVE_OPERATIONS",
    readingSectionTitle: "// DATA_FEEDS",
    socialsSectionTitle: "// UPLINK_CHANNELS",
    footerText: "Signal transmitted from sector 7G. All systems nominal.",
  },
  projectDescriptions: [],
  style: {
    layoutVariant: LAYOUT_VARIANT.TERMINAL,
    borderRadius: "2px",
    decorativeCSS: "background-image: radial-gradient(ellipse at 20% 50%, rgba(0,240,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,42,109,0.03) 0%, transparent 50%); box-shadow: inset 0 0 120px rgba(0,240,255,0.02);",
    animationStyle: ANIMATION_STYLE.ENERGETIC,
  },
  backgroundImagePrompt: "A dark cyberpunk cityscape at night, neon signs glowing in cyan and magenta, rain-slicked streets reflecting light, towering skyscrapers with holographic advertisements, slight fog and atmospheric haze, noir aesthetic with high contrast shadows, digital glitch effects subtly overlaid, moody and mysterious atmosphere perfect for a portfolio background",
  backgroundImage: null,
}
