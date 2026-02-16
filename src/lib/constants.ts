/**
 * Application-wide constants
 * Centralized location for all magic strings and configuration values
 */

// ============================================================================
// AI Configuration
// ============================================================================

export const AI_CONFIG = {
  /** OpenAI model to use for theme generation */
  MODEL: "openai/gpt-4o" as const,
  /** Maximum execution duration in seconds for AI routes */
  MAX_DURATION: 60,
  /** Maximum characters allowed for decorative CSS */
  MAX_DECORATIVE_CSS_LENGTH: 500,
  /** Maximum number of books to include in AI context */
  MAX_BOOKS_IN_CONTEXT: 10,
} as const

// ============================================================================
// Redis Keys & Cache Configuration
// ============================================================================

export const REDIS_KEYS = {
  /** Prefix for individual theme storage: theme:{slug} */
  THEME_PREFIX: "theme:",
  /** Default/fallback theme slug */
  DEFAULT_THEME_SLUG: "default",
  /** Theme rotation index */
  ROTATION_INDEX: "theme-rotation-index",
  /** Total visitor count */
  VISITOR_COUNT: "visitor-count",
  /** Cached reading list from Hardcover */
  BOOKS_CACHE: "hardcover-books-cache",
  /** List of available theme slugs */
  AVAILABLE_THEMES: "available-themes",
} as const

export const CACHE_CONFIG = {
  /** Cache TTL for books in seconds (1 hour) */
  BOOKS_TTL: 3600,
  /** Books cache key */
  BOOKS_CACHE: REDIS_KEYS.BOOKS_CACHE,
  /** Themes cache key */
  THEMES_CACHE: REDIS_KEYS.AVAILABLE_THEMES,
} as const

// ============================================================================
// Hardcover API Configuration
// ============================================================================

export const HARDCOVER_CONFIG = {
  /** Hardcover GraphQL API endpoint */
  API_URL: "https://api.hardcover.app/v1/graphql",
  /** Default username for reading list */
  DEFAULT_USERNAME: "lazybaer",
  /** Maximum books to fetch from API */
  MAX_BOOKS_FETCH: 50,
  /** Maximum books to display on site */
  MAX_BOOKS_DISPLAY: 10,
} as const

/** Hardcover book reading status types */
export const BOOK_STATUS = {
  WANT_TO_READ: "want-to-read",
  CURRENTLY_READING: "currently-reading",
  READ: "read",
} as const

export type BookStatus = (typeof BOOK_STATUS)[keyof typeof BOOK_STATUS]

/** Mapping of Hardcover status IDs to status strings */
export const HARDCOVER_STATUS_MAP: Record<number, BookStatus> = {
  1: BOOK_STATUS.WANT_TO_READ,
  2: BOOK_STATUS.CURRENTLY_READING,
  3: BOOK_STATUS.READ,
} as const

/** Hardcover status IDs for filtering */
export const HARDCOVER_STATUS_IDS = {
  WANT_TO_READ: 1,
  CURRENTLY_READING: 2,
  READ: 3,
} as const

// ============================================================================
// Theme & Layout Configuration
// ============================================================================

/** Available layout variants */
export const LAYOUT_VARIANT = {
  CLASSIC: "classic",
  BRUTALIST: "brutalist",
  CARDS: "cards",
  TERMINAL: "terminal",
  MAGAZINE: "magazine",
} as const

export type LayoutVariant = (typeof LAYOUT_VARIANT)[keyof typeof LAYOUT_VARIANT]

/** Available animation styles */
export const ANIMATION_STYLE = {
  NONE: "none",
  SUBTLE: "subtle",
  ENERGETIC: "energetic",
} as const

export type AnimationStyle = (typeof ANIMATION_STYLE)[keyof typeof ANIMATION_STYLE]

/** Allowed CSS properties for decorative styling (for security) */
export const ALLOWED_DECORATIVE_CSS_PROPERTIES = [
  "background",
  "box-shadow",
  "text-shadow",
  "border",
  "filter",
] as const

// ============================================================================
// HTTP & API Configuration
// ============================================================================

/** HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

/** HTTP headers */
export const HTTP_HEADERS = {
  AUTHORIZATION: "authorization",
  AUTHORIZATION_CAPS: "Authorization",
  CONTENT_TYPE: "Content-Type",
} as const

/** HTTP content types */
export const CONTENT_TYPE = {
  JSON: "application/json",
} as const

/** Authentication scheme */
export const AUTH_SCHEME = {
  BEARER_PREFIX: "Bearer ",
} as const

// ============================================================================
// Environment Variable Keys
// ============================================================================

/** Environment variable key names for type-safe access */
export const ENV_KEYS = {
  // OpenAI
  OPENAI_API_KEY: "OPENAI_API_KEY",
  
  // Redis/Upstash
  KV_REST_API_URL: "KV_REST_API_URL",
  KV_REST_API_TOKEN: "KV_REST_API_TOKEN",
  
  // Authentication
  CRON_SECRET: "CRON_SECRET",
  ADMIN_SECRET: "ADMIN_SECRET",
  
  // Optional services
  EDGE_CONFIG: "EDGE_CONFIG",
  HARDCOVER_API_TOKEN: "HARDCOVER_API_TOKEN",
} as const

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  ADMIN_SECRET_NOT_CONFIGURED: "ADMIN_SECRET not configured",
  FAILED_TO_GENERATE_THEME: "Failed to generate theme",
  NO_THEME_FOUND: "No current theme found",
} as const

// ============================================================================
// API Response Field Names
// ============================================================================

export const API_RESPONSE_FIELDS = {
  SUCCESS: "success",
  ERROR: "error",
  DETAILS: "details",
  THEME: "theme",
  LAYOUT_VARIANT: "layoutVariant",
  MESSAGE: "message",
} as const
