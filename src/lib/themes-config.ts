import { getRotationIndex, setRotationIndex } from "./redis"

// Default themes - used as fallback if Edge Config isn't available
const DEFAULT_THEMES = [
  "80s new wave",
  "japanimation",
  "heavy metal",
  "vaporwave",
  "cyberpunk noir",
  "art deco gatsby",
  "lo-fi hip hop",
  "swiss design minimalism",
  "adams family. Edgar Allan Poe, spooky, dark, and mysterious.",
  "film noir detective",
]

export async function getThemeList(): Promise<string[]> {
  // Try Edge Config first
  try {
    if (process.env.EDGE_CONFIG) {
      const { get } = await import("@vercel/edge-config")
      const themes = await get<string[]>("themes")
      if (themes && themes.length > 0) return themes
    }
  } catch {
    // Fall through to defaults
  }

  return DEFAULT_THEMES
}

export async function getNextTheme(): Promise<{ theme: string; index: number }> {
  const themes = await getThemeList()
  const currentIndex = await getRotationIndex()
  const nextIndex = (currentIndex + 1) % themes.length

  await setRotationIndex(nextIndex)

  return {
    theme: themes[nextIndex],
    index: nextIndex,
  }
}

export async function getFeatureFlags(): Promise<{
  forceTheme: string | null
  regenEnabled: boolean
  timeOfDayThemes: Record<string, string[]> | null
}> {
  const defaults = {
    forceTheme: null,
    regenEnabled: true,
    timeOfDayThemes: null,
  }

  try {
    if (process.env.EDGE_CONFIG) {
      const { get } = await import("@vercel/edge-config")
      const forceTheme = await get<string>("forceTheme")
      const regenEnabled = await get<boolean>("regenEnabled")
      const timeOfDayThemes = await get<Record<string, string[]>>("timeOfDayThemes")

      return {
        forceTheme: forceTheme ?? null,
        regenEnabled: regenEnabled ?? true,
        timeOfDayThemes: timeOfDayThemes ?? null,
      }
    }
  } catch {
    // Fall through to defaults
  }

  return defaults
}

export function getTimeOfDayPeriod(): "morning" | "afternoon" | "night" {
  const hour = new Date().getUTCHours()
  if (hour >= 6 && hour < 12) return "morning"
  if (hour >= 12 && hour < 20) return "afternoon"
  return "night"
}
