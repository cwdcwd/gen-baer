import { getAllThemes } from "@/lib/redis"
import { HTTP_STATUS } from "@/lib/constants"

/**
 * Public API to list all available cached themes
 * No authentication required - anyone can see available themes
 */
export async function GET() {
  try {
    const themes = await getAllThemes()
    
    // Return simplified theme info for the picker
    const themeList = themes.map((theme) => ({
      slug: theme.themeSlug,
      name: theme.themeName,
      generatedAt: theme.generatedAt,
      colors: [
        theme.colors.background,
        theme.colors.foreground,
        theme.colors.accent,
        theme.colors.accentSecondary,
        theme.colors.border,
      ],
      layoutVariant: theme.style.layoutVariant,
    }))
    
    return Response.json({ themes: themeList })
  } catch (error) {
    console.error("[API] Failed to fetch themes:", error)
    return Response.json(
      { error: "Failed to fetch themes" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
