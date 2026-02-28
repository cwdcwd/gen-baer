import { generateText, Output } from "ai"
import { themeSchema } from "@/lib/theme-schema"
import type { GeneratedTheme } from "@/lib/theme-schema"
import { setTheme, deleteTheme } from "@/lib/redis"
import { fetchReadingList } from "@/lib/hardcover"
import { resumeData } from "@/lib/resume-data"
import { getNextTheme, getFeatureFlags } from "@/lib/themes-config"
import { generateBackgroundImage, isImageGenEnabled } from "@/lib/image-gen"
import {
  AI_CONFIG,
  ENV_KEYS,
  HTTP_STATUS,
  HTTP_HEADERS,
  AUTH_SCHEME,
  ERROR_MESSAGES,
  API_RESPONSE_FIELDS,
  LAYOUT_VARIANT,
  ANIMATION_STYLE,
  ALLOWED_DECORATIVE_CSS_PROPERTIES,
} from "@/lib/constants"

// Next.js route segment config requires literal values
export const maxDuration = 60

async function generateTheme(req: Request) {
  // Authenticate: cron secret or admin secret
  const authHeader = req.headers.get(HTTP_HEADERS.AUTHORIZATION)
  const cronSecret = process.env[ENV_KEYS.CRON_SECRET]
  const adminSecret = process.env[ENV_KEYS.ADMIN_SECRET]

  const isCron = cronSecret && authHeader === `${AUTH_SCHEME.BEARER_PREFIX}${cronSecret}`
  const isAdmin = adminSecret && authHeader === `${AUTH_SCHEME.BEARER_PREFIX}${adminSecret}`

  if (!isCron && !isAdmin) {
    return Response.json({ [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED })
  }

  try {
    // Determine which theme to generate
    let themeName: string

    // Check for forced theme in request body
    const body = await req.json().catch(() => ({}))
    if (body.theme) {
      themeName = body.theme
    } else {
      // Check feature flags for forced theme
      const flags = await getFeatureFlags()
      if (flags.forceTheme) {
        themeName = flags.forceTheme
      } else {
        // Use next in rotation
        const { theme } = await getNextTheme()
        themeName = theme
      }
    }

    // Fetch reading list for context
    const books = await fetchReadingList()

    // Build the prompt
    const projectContext = resumeData.projects
      .map((p) => `- ${p.name}: ${p.description} (${p.tags.join(", ")})`)
      .join("\n")

    const bookContext = books
      .slice(0, AI_CONFIG.MAX_BOOKS_IN_CONTEXT)
      .map((b) => `- "${b.title}" by ${b.author} [${b.status}]`)
      .join("\n")

    const result = await generateText({
      model: AI_CONFIG.MODEL,
      output: Output.object({ schema: themeSchema }),
      prompt: `You are a world-class creative director and web designer. Your task is to generate a complete visual theme and rewritten copy for a personal portfolio/resume website.

THE THEME: "${themeName}"

You must deeply embody the aesthetic, cultural references, visual language, and tone of "${themeName}". Every aspect of your output should feel authentically rooted in this theme.

PERSON'S ACTUAL INFO (keep the facts, transform the voice):
Name: ${resumeData.name}
Tagline: ${resumeData.tagline}
Bio: ${resumeData.bio}

PROJECTS:
${projectContext}

READING LIST:
${bookContext}

SOCIAL PLATFORMS: ${resumeData.socials.map((s) => s.platform).join(", ")}

GUIDELINES:
- Colors: Pick 3-5 colors that are ICONIC to the "${themeName}" aesthetic. High contrast between background and foreground. Accent colors should pop.
- Typography: Choose Google Fonts that evoke the theme. Headings should be dramatic/thematic, body text must remain readable.
- Copy: Completely rewrite ALL text in the voice/style of "${themeName}". Be creative, playful, and committed to the bit. The bio should sound like it was written BY someone living in that aesthetic world.
- Project descriptions: Rewrite each project name and description in the theme's voice while keeping the core meaning intact.
- Layout: Pick the layout variant that best fits the theme (${LAYOUT_VARIANT.BRUTALIST} for punk/raw themes, ${LAYOUT_VARIANT.TERMINAL} for hacker/tech, ${LAYOUT_VARIANT.MAGAZINE} for editorial, ${LAYOUT_VARIANT.CARDS} for modern, ${LAYOUT_VARIANT.CLASSIC} for elegant).
- Border radius: Match the theme (0px for angular/brutal, high values for soft/retro).
- Decorative CSS: Add theme-specific visual flair using ONLY ${ALLOWED_DECORATIVE_CSS_PROPERTIES.join(", ")} CSS properties. Keep it under ${AI_CONFIG.MAX_DECORATIVE_CSS_LENGTH} characters. This CSS will be applied to the page body.
- Animation style: "${ANIMATION_STYLE.ENERGETIC}" for high-energy themes, "${ANIMATION_STYLE.SUBTLE}" for elegant, "${ANIMATION_STYLE.NONE}" for minimal.
- Background Image Prompt: Write a detailed DALL-E prompt (100-200 words) to generate a background image that perfectly captures this theme's aesthetic. Consider: visual elements, mood, color palette, artistic style. The image will be used as a subtle full-page background, so describe something that works well faded/translucent behind text. For abstract themes, describe abstract art. For nature themes, describe landscapes. For tech themes, describe futuristic/digital visuals. Match the vibe!
- The generatedAt field should be the current ISO timestamp: ${new Date().toISOString()}
- The themeSlug should be a URL-friendly version of the theme name.

BE BOLD. BE CREATIVE. FULLY COMMIT TO THE THEME.`,
    })

    if (!result.output) {
      return Response.json(
        { [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.FAILED_TO_GENERATE_THEME },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // Cast to GeneratedTheme type (includes optional backgroundImage)
    const theme = result.output as GeneratedTheme

    // Generate background image (async, gracefully degrades to SVG if fails)
    console.log("[Theme] Generating background image...")
    const backgroundImage = await generateBackgroundImage(theme)
    theme.backgroundImage = backgroundImage
    console.log("[Theme] Background image generated:", backgroundImage?.url?.slice(0, 50) ?? "N/A")

    // Store in Redis
    await setTheme(theme)

    return Response.json({
      [API_RESPONSE_FIELDS.SUCCESS]: true,
      [API_RESPONSE_FIELDS.THEME]: theme.themeName,
      [API_RESPONSE_FIELDS.LAYOUT_VARIANT]: theme.style.layoutVariant,
    })
  } catch (error) {
    console.error("[v0] Theme generation error:", error)
    return Response.json(
      {
        [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.FAILED_TO_GENERATE_THEME,
        [API_RESPONSE_FIELDS.DETAILS]: String(error),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

// POST to create/generate a new theme
export async function POST(req: Request) {
  return generateTheme(req)
}

// PATCH to regenerate/update the current theme
export async function PATCH(req: Request) {
  return generateTheme(req)
}

// Support GET for Vercel Cron
export async function GET(req: Request) {
  const authHeader = req.headers.get(HTTP_HEADERS.AUTHORIZATION)
  const cronSecret = process.env[ENV_KEYS.CRON_SECRET]

  if (!cronSecret || authHeader !== `${AUTH_SCHEME.BEARER_PREFIX}${cronSecret}`) {
    return Response.json(
      { [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  // Reuse POST logic with a fake request
  const fakeReq = new Request(req.url, {
    method: "POST",
    headers: { [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_SCHEME.BEARER_PREFIX}${cronSecret}` },
    body: JSON.stringify({}),
  })

  return POST(fakeReq)
}

export async function DELETE(req: Request) {
  const adminSecret = process.env[ENV_KEYS.ADMIN_SECRET]

  if (!adminSecret) {
    return Response.json(
      { [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.ADMIN_SECRET_NOT_CONFIGURED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }

  const authHeader = req.headers.get(HTTP_HEADERS.AUTHORIZATION)
  if (authHeader !== `${AUTH_SCHEME.BEARER_PREFIX}${adminSecret}`) {
    return Response.json(
      { [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  try {
    // Get theme slug from query params or request body
    const url = new URL(req.url)
    let themeSlug = url.searchParams.get("slug")
    
    if (!themeSlug) {
      const body = await req.json().catch(() => ({}))
      themeSlug = body.slug
    }

    if (!themeSlug) {
      return Response.json(
        { [API_RESPONSE_FIELDS.ERROR]: "Theme slug is required" },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    await deleteTheme(themeSlug)

    return Response.json({
      success: true,
      message: `Theme "${themeSlug}" deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting theme:", error)
    return Response.json(
      { [API_RESPONSE_FIELDS.ERROR]: "Failed to delete theme" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
