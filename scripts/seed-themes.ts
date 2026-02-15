/**
 * Seed script to generate all default themes and cache them in Redis
 * Usage: tsx scripts/seed-themes.ts [API_URL] [ADMIN_SECRET]
 */

import { getThemeList } from "../src/lib/themes-config"

const API_URL = process.argv[2] || process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
const ADMIN_SECRET = process.argv[3] || process.env.ADMIN_SECRET || ""

async function generateTheme(theme: string): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/generate-theme`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ADMIN_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme }),
    })

    const data = await response.json()
    
    if (response.ok && data.slug) {
      return { success: true, slug: data.slug }
    } else {
      return { success: false, error: data.error || "Unknown error" }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" }
  }
}

async function listCachedThemes(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/themes`)
    const data = await response.json()
    return data.themes?.map((t: any) => t.name) || []
  } catch {
    return []
  }
}

async function main() {
  console.log(`🎨 Seeding themes to ${API_URL}`)
  console.log("================================\n")

  if (!ADMIN_SECRET) {
    console.error("❌ Error: ADMIN_SECRET is required")
    console.error("   Set via environment variable or pass as second argument")
    process.exit(1)
  }

  const themes = await getThemeList()
  console.log(`Found ${themes.length} themes in config\n`)

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  }

  for (const theme of themes) {
    process.stdout.write(`Generating: ${theme}... `)
    
    const result = await generateTheme(theme)
    
    if (result.success) {
      console.log(`✅ ${result.slug}`)
      results.success++
    } else {
      console.log(`❌ ${result.error}`)
      results.failed++
    }
    
    // Add delay to avoid rate limiting and give AI time to generate
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log("\n================================")
  console.log(`✨ Seeding complete!`)
  console.log(`   Success: ${results.success}`)
  console.log(`   Failed:  ${results.failed}`)
  console.log("")

  console.log("Available themes:")
  const cachedThemes = await listCachedThemes()
  cachedThemes.forEach(name => console.log(`  - ${name}`))
  
  console.log(`\nTotal cached: ${cachedThemes.length}`)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
