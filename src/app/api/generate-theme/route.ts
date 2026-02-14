import { generateText, Output } from "ai"
import { themeSchema } from "@/lib/theme-schema"
import { setTheme } from "@/lib/redis"
import { fetchReadingList } from "@/lib/hardcover"
import { resumeData } from "@/lib/resume-data"
import { getNextTheme, getFeatureFlags } from "@/lib/themes-config"

export const maxDuration = 60

export async function POST(req: Request) {
  // Authenticate: cron secret or admin secret
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  const adminSecret = process.env.ADMIN_SECRET

  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`
  const isAdmin = adminSecret && authHeader === `Bearer ${adminSecret}`

  if (!isCron && !isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
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
      .slice(0, 10)
      .map((b) => `- "${b.title}" by ${b.author} [${b.status}]`)
      .join("\n")

    const result = await generateText({
      model: "openai/gpt-4o",
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
- Layout: Pick the layout variant that best fits the theme (brutalist for punk/raw themes, terminal for hacker/tech, magazine for editorial, cards for modern, classic for elegant).
- Border radius: Match the theme (0px for angular/brutal, high values for soft/retro).
- Decorative CSS: Add theme-specific visual flair using ONLY background, box-shadow, text-shadow, border, and filter CSS properties. Keep it under 500 characters. This CSS will be applied to the page body.
- Animation style: "energetic" for high-energy themes, "subtle" for elegant, "none" for minimal.
- The generatedAt field should be the current ISO timestamp: ${new Date().toISOString()}
- The themeSlug should be a URL-friendly version of the theme name.

BE BOLD. BE CREATIVE. FULLY COMMIT TO THE THEME.`,
    })

    if (!result.output) {
      return Response.json({ error: "Failed to generate theme" }, { status: 500 })
    }

    const theme = result.output

    // Store in Redis
    await setTheme(theme)

    return Response.json({
      success: true,
      theme: theme.themeName,
      layoutVariant: theme.style.layoutVariant,
    })
  } catch (error) {
    console.error("[v0] Theme generation error:", error)
    return Response.json(
      { error: "Failed to generate theme", details: String(error) },
      { status: 500 }
    )
  }
}

// Support GET for Vercel Cron
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Reuse POST logic with a fake request
  const fakeReq = new Request(req.url, {
    method: "POST",
    headers: { authorization: `Bearer ${cronSecret}` },
    body: JSON.stringify({}),
  })

  return POST(fakeReq)
}
