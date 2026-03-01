/**
 * Background Image Generation Service
 * 
 * Generates AI background images using DALL-E and creates SVG fallback patterns.
 * Images are stored in Vercel Blob for fast CDN delivery.
 */

import OpenAI from "openai"
import { put } from "@vercel/blob"
import { IMAGE_CONFIG, ENV_KEYS } from "./constants"
import type { BackgroundImage, GeneratedTheme } from "./theme-schema"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env[ENV_KEYS.OPENAI_API_KEY],
})

/**
 * Check if background image generation is available
 */
export function isImageGenEnabled(): boolean {
  return !!(
    IMAGE_CONFIG.ENABLED &&
    process.env[ENV_KEYS.OPENAI_API_KEY] &&
    process.env[ENV_KEYS.BLOB_READ_WRITE_TOKEN]
  )
}

/**
 * Generate an SVG pattern based on theme colors
 * This serves as an instant fallback while the AI image loads
 */
export function generateSvgPattern(theme: GeneratedTheme): string {
  const { background, accent, accentSecondary, border } = theme.colors
  
  // Create a subtle geometric pattern that works with any theme
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="${accent}" opacity="0.1"/>
    </pattern>
    <radialGradient id="glow1" cx="20%" cy="30%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${background}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="70%">
      <stop offset="0%" stop-color="${accentSecondary}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${background}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="${background}"/>
  <rect width="100" height="100" fill="url(#grid)"/>
  <rect width="100" height="100" fill="url(#glow1)"/>
  <rect width="100" height="100" fill="url(#glow2)"/>
  <line x1="0" y1="50" x2="100" y2="50" stroke="${border}" stroke-width="0.5" opacity="0.3"/>
  <line x1="50" y1="0" x2="50" y2="100" stroke="${border}" stroke-width="0.5" opacity="0.3"/>
</svg>`.trim()

  // Convert to data URL
  const encoded = Buffer.from(svg).toString("base64")
  return `data:image/svg+xml;base64,${encoded}`
}

/**
 * Generate a tiny blur placeholder SVG
 * Creates a simple blurred SVG without fetching the image
 */
function generateBlurPlaceholder(): string {
  // Create a tiny SVG as blur placeholder
  const blurSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_CONFIG.BLUR_WIDTH}" height="${IMAGE_CONFIG.BLUR_HEIGHT}">
  <filter id="b" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="2"/>
  </filter>
  <rect width="100%" height="100%" fill="#1a1a2e" filter="url(#b)"/>
</svg>`.trim()
    
  return `data:image/svg+xml;base64,${Buffer.from(blurSvg).toString("base64")}`
}

/**
 * Generate background image using DALL-E
 */
async function generateDalleImage(prompt: string): Promise<string> {
  console.log("[ImageGen] Generating DALL-E image...")
  
  const response = await openai.images.generate({
    model: IMAGE_CONFIG.DALLE_MODEL,
    prompt: `${prompt}. Style: suitable as a website background, subtle and not too busy, cohesive color palette, professional quality.`,
    n: 1,
    size: IMAGE_CONFIG.IMAGE_SIZE,
    quality: IMAGE_CONFIG.IMAGE_QUALITY,
  })

  const imageUrl = response.data?.[0]?.url
  if (!imageUrl) {
    throw new Error("No image URL returned from DALL-E")
  }

  return imageUrl
}

/**
 * Upload image to Vercel Blob
 */
async function uploadToBlob(imageUrl: string, filename: string): Promise<string> {
  console.log("[ImageGen] Uploading to Vercel Blob...")
  
  // Fetch the image from DALL-E's temporary URL
  const response = await fetch(imageUrl)
  const imageBuffer = await response.arrayBuffer()
  
  // Upload to Vercel Blob
  const blob = await put(filename, imageBuffer, {
    access: "public",
    contentType: "image/png",
  })

  return blob.url
}

/**
 * Main function: Generate background image for a theme
 * Always returns a valid BackgroundImage (uses SVG fallback on failure)
 */
export async function generateBackgroundImage(
  theme: GeneratedTheme
): Promise<NonNullable<BackgroundImage>> {
  // Always generate SVG pattern as fallback
  const svgPattern = generateSvgPattern(theme)
  
  // If image generation is disabled, return SVG-only
  if (!isImageGenEnabled()) {
    console.log("[ImageGen] Image generation disabled, using SVG fallback only")
    return {
      url: svgPattern, // Use SVG as primary when no AI image
      blurDataUrl: svgPattern,
      svgPattern,
      prompt: theme.backgroundImagePrompt,
      generatedAt: new Date().toISOString(),
    }
  }

  try {
    // Generate DALL-E image
    const dalleUrl = await generateDalleImage(theme.backgroundImagePrompt)
    
    // Upload to Vercel Blob for permanent storage
    const filename = `backgrounds/${theme.themeSlug}-${Date.now()}.png`
    const blobUrl = await uploadToBlob(dalleUrl, filename)
    
    // Generate blur placeholder
    const blurDataUrl = generateBlurPlaceholder()
    
    console.log("[ImageGen] Successfully generated background image")
    
    return {
      url: blobUrl,
      blurDataUrl,
      svgPattern,
      prompt: theme.backgroundImagePrompt,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[ImageGen] Failed to generate background image:", error)
    
    // Graceful fallback to SVG pattern
    return {
      url: svgPattern,
      blurDataUrl: svgPattern,
      svgPattern,
      prompt: theme.backgroundImagePrompt,
      generatedAt: new Date().toISOString(),
    }
  }
}
