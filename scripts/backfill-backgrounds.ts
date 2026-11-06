/**
 * Backfill AI background images for stored themes that only have the SVG
 * fallback (e.g. every theme generated while dall-e-3 was failing).
 *
 * Reads/writes Redis and Vercel Blob directly using the env in .env.
 * Each generated image is a paid OpenAI image API call.
 *
 * Usage:
 *   pnpm backfill-backgrounds                 # dry run: list themes missing an image
 *   pnpm backfill-backgrounds --apply         # generate for all missing
 *   pnpm backfill-backgrounds --apply --slug heavy-metal
 *   pnpm backfill-backgrounds --apply --limit 3
 */

import { getAllThemes, getTheme, setTheme } from "../src/lib/redis"
import { generateBackgroundImage, isImageGenEnabled } from "../src/lib/image-gen"
import type { GeneratedTheme } from "../src/lib/theme-schema"

const args = process.argv.slice(2)
const apply = args.includes("--apply")
const argValue = (flag: string) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const onlySlug = argValue("--slug")
const limit = Number(argValue("--limit") ?? Infinity)

const hasAiImage = (t: GeneratedTheme) =>
  !!t.backgroundImage?.url && t.backgroundImage.url.startsWith("http")

async function main() {
  const themes = await getAllThemes()
  const missing = themes
    .filter((t) => !hasAiImage(t))
    .filter((t) => !onlySlug || t.themeSlug === onlySlug)
    .sort((a, b) => a.themeSlug.localeCompare(b.themeSlug))
    .slice(0, limit)

  console.log(`${themes.length} themes stored, ${missing.length} selected without an AI image:`)
  for (const t of missing) console.log(`  - ${t.themeSlug}`)

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to generate images.")
    return
  }
  if (!isImageGenEnabled()) {
    throw new Error("Image generation is not configured (OPENAI_API_KEY / BLOB_READ_WRITE_TOKEN).")
  }

  let ok = 0
  const failed: string[] = []
  for (const [i, t] of missing.entries()) {
    process.stdout.write(`[${i + 1}/${missing.length}] ${t.themeSlug} ... `)
    const bg = await generateBackgroundImage(t)
    if (!bg.url.startsWith("http")) {
      // generateBackgroundImage swallows errors and returns the SVG fallback
      console.log("FAILED (fell back to SVG; see [ImageGen] error above)")
      failed.push(t.themeSlug)
      continue
    }
    // Re-read so we only change backgroundImage on the latest stored copy
    const latest = await getTheme(t.themeSlug)
    if (!latest) {
      console.log("SKIPPED (theme was deleted meanwhile)")
      continue
    }
    await setTheme({ ...latest, backgroundImage: bg })
    console.log(bg.url)
    ok++
  }

  console.log(`\nDone: ${ok} updated, ${failed.length} failed${failed.length ? `: ${failed.join(", ")}` : ""}`)
  if (failed.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
