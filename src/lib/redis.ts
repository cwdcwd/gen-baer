import { Redis } from "@upstash/redis"
import type { GeneratedTheme } from "./theme-schema"
import { REDIS_KEYS, ENV_KEYS, CACHE_CONFIG } from "./constants"

const redis = new Redis({
  url: process.env[ENV_KEYS.KV_REST_API_URL]!,
  token: process.env[ENV_KEYS.KV_REST_API_TOKEN]!,
})

export async function getTheme(): Promise<GeneratedTheme | null> {
  const theme = await redis.get<GeneratedTheme>(REDIS_KEYS.THEME)
  return theme
}

export async function setTheme(theme: GeneratedTheme): Promise<void> {
  await redis.set(REDIS_KEYS.THEME, theme)
}

export async function getRotationIndex(): Promise<number> {
  const index = await redis.get<number>(REDIS_KEYS.ROTATION_INDEX)
  return index ?? 0
}

export async function setRotationIndex(index: number): Promise<void> {
  await redis.set(REDIS_KEYS.ROTATION_INDEX, index)
}

export async function incrementVisitorCount(): Promise<number> {
  return await redis.incr(REDIS_KEYS.VISITOR_COUNT)
}

export async function getCachedBooks<T>(): Promise<T | null> {
  return await redis.get<T>(REDIS_KEYS.BOOKS_CACHE)
}

export async function setCachedBooks<T>(books: T): Promise<void> {
  await redis.set(REDIS_KEYS.BOOKS_CACHE, books, { ex: CACHE_CONFIG.BOOKS_TTL })
}

export default redis
