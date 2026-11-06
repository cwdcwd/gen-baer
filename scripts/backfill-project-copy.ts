/**
 * Backfill themed copy for projects added to resume-data.ts after a theme was
 * generated. Stored themes only rewrote the projects that existed at the time;
 * anything newer renders with its plain description until this runs.
 *
 * Only missing projects are generated. Existing copy, colours and background
 * images are untouched. One text-model call per theme that needs it.
 *
 * Usage:
 *   npx tsx --env-file=.env.production.local scripts/backfill-project-copy.ts             # dry run
 *   npx tsx --env-file=.env.production.local scripts/backfill-project-copy.ts --apply --limit 1
 *   npx tsx --env-file=.env.production.local scripts/backfill-project-copy.ts --apply
 *   ... --apply --slug heavy-metal
 */

import { generateText, Output } from "ai"
import { z } from "zod"
import { getAllThemes, getTheme, setTheme } from "../src/lib/redis"
import { resumeData } from "../src/lib/resume-data"
import { AI_CONFIG } from "../src/lib/constants"
import type { GeneratedTheme } from "../src/lib/theme-schema"

const args = process.argv.slice(2)
const apply = args.includes("--apply")
const argValue = (flag: string) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const onlySlug = argValue("--slug")
const limit = Number(argValue("--limit") ?? Infinity)

type Project = (typeof resumeData.projects)[number]

const norm = (s: string) => s.trim().toLowerCase()

function missingProjects(theme: GeneratedTheme): Project[] {
  const have = new Set(theme.projectDescriptions.map((p) => norm(p.originalName)))
  return resumeData.projects.filter((p) => !have.has(norm(p.name)))
}

const outputSchema = z.object({
  projectDescriptions: z.array(
    z.object({
      originalName: z.string().describe("The original project name, copied exactly"),
      themedName: z.string().describe("The project name rewritten in the theme's voice"),
      themedDescription: z.string().describe("The description rewritten in the theme's voice"),
    })
  ),
})

// AI Gateway allows this team 5 gpt-4o requests per minute, so pace calls
// and retry when the limit is hit anyway.
const PACE_MS = 13_000
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const isRateLimit = (err: unknown) => /rate limit/i.test(err instanceof Error ? err.message : String(err))

async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (err) {
      if (!isRateLimit(err) || i >= attempts) throw err
      process.stdout.write(`(rate limited, waiting 30s) `)
      await sleep(30_000)
    }
  }
}

async function generateCopy(theme: GeneratedTheme, projects: Project[]) {
  const examples = theme.projectDescriptions
    .slice(0, 3)
    .map((p) => `- "${p.originalName}" became "${p.themedName}": ${p.themedDescription}`)
    .join("\n")

  const list = projects
    .map((p) => `- ${p.name}: ${p.description} (${p.tags.join(", ")})`)
    .join("\n")

  const result = await generateText({
    model: AI_CONFIG.MODEL,
    output: Output.object({ schema: outputSchema }),
    prompt: `You are the copywriter for a portfolio site themed as "${theme.themeName}".
Rewrite each project's name and description in that theme's voice, matching the style already used on the site. Keep the facts and core meaning intact; be playful and fully committed to the theme, at a similar length to the examples.

Hero headline, for tone: ${theme.copy.heroHeadline}

Existing project copy on this site:
${examples || "(none yet)"}

PROJECTS TO REWRITE (return one entry per project, with originalName copied exactly):
${list}`,
  })

  const out = result.output?.projectDescriptions ?? []
  // Keep only entries that map back to a requested project, by exact name.
  const wanted = new Map(projects.map((p) => [norm(p.name), p.name]))
  const cleaned = out
    .filter((p) => wanted.has(norm(p.originalName)))
    .map((p) => ({ ...p, originalName: wanted.get(norm(p.originalName))! }))
  const got = new Set(cleaned.map((p) => norm(p.originalName)))
  const stillMissing = projects.filter((p) => !got.has(norm(p.name))).map((p) => p.name)
  return { cleaned, stillMissing }
}

async function main() {
  const themes = (await getAllThemes())
    .filter((t) => !onlySlug || t.themeSlug === onlySlug)
    .sort((a, b) => a.themeSlug.localeCompare(b.themeSlug))
  const todo = themes
    .map((t) => ({ theme: t, missing: missingProjects(t) }))
    .filter((x) => x.missing.length > 0)
    .slice(0, limit)

  console.log(`${themes.length} themes checked, ${todo.length} selected with missing project copy.`)
  for (const { theme, missing } of todo) {
    console.log(`  - ${theme.themeSlug}: ${missing.map((p) => p.name).join(", ")}`)
  }
  if (!apply) {
    console.log("\nDry run. Re-run with --apply to generate copy.")
    return
  }

  let ok = 0
  const failed: string[] = []
  for (const [i, { theme, missing }] of todo.entries()) {
    if (i > 0) await sleep(PACE_MS)
    process.stdout.write(`[${i + 1}/${todo.length}] ${theme.themeSlug} ... `)
    try {
      const { cleaned, stillMissing } = await withRetry(() => generateCopy(theme, missing))
      // Re-read so we only append to the latest stored copy
      const latest = await getTheme(theme.themeSlug)
      if (!latest) {
        console.log("SKIPPED (theme was deleted meanwhile)")
        continue
      }
      const have = new Set(latest.projectDescriptions.map((p) => norm(p.originalName)))
      const additions = cleaned.filter((p) => !have.has(norm(p.originalName)))
      await setTheme({ ...latest, projectDescriptions: [...latest.projectDescriptions, ...additions] })
      console.log(
        `added ${additions.length}` + (stillMissing.length ? ` (model skipped: ${stillMissing.join(", ")})` : "")
      )
      if (stillMissing.length) failed.push(theme.themeSlug)
      else ok++
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : String(err)}`)
      failed.push(theme.themeSlug)
    }
  }

  console.log(`\nDone: ${ok} complete, ${failed.length} incomplete${failed.length ? `: ${failed.join(", ")}` : ""}`)
  console.log("Re-running is safe: it only fills what is still missing.")
  if (failed.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
