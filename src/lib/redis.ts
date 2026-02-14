import { Redis } from "@upstash/redis"
import type { GeneratedTheme } from "./theme-schema"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const THEME_KEY = "current-theme"
const ROTATION_INDEX_KEY = "theme-rotation-index"
const VISITOR_KEY = "visitor-count"
const BOOKS_CACHE_KEY = "hardcover-books-cache"

export async function getTheme(): Promise<GeneratedTheme | null> {
  const theme = await redis.get<GeneratedTheme>(THEME_KEY)
  return theme
}

export async function setTheme(theme: GeneratedTheme): Promise<void> {
  await redis.set(THEME_KEY, theme)
}

export async function getRotationIndex(): Promise<number> {
  const index = await redis.get<number>(ROTATION_INDEX_KEY)
  return index ?? 0
}

export async function setRotationIndex(index: number): Promise<void> {
  await redis.set(ROTATION_INDEX_KEY, index)
}

export async function incrementVisitorCount(): Promise<number> {
  return await redis.incr(VISITOR_KEY)
}

export async function getCachedBooks<T>(): Promise<T | null> {
  return await redis.get<T>(BOOKS_CACHE_KEY)
}

export async function setCachedBooks<T>(books: T): Promise<void> {
  // Cache for 1 hour
  await redis.set(BOOKS_CACHE_KEY, books, { ex: 3600 })
}

export default redis
