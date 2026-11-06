/**
 * Background Image Generation Service
 * 
 * Generates AI background images using the OpenAI image API and creates SVG fallback patterns.
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
 * Generate background image with the OpenAI image model.
 * gpt-image-* models return base64 data, not a URL.
 */
async function generateAiImage(prompt: string): Promise<Buffer> {
  console.log(`[ImageGen] Generating image with ${IMAGE_CONFIG.IMAGE_MODEL}...`)

  const response = await openai.images.generate({
    model: IMAGE_CONFIG.IMAGE_MODEL,
    prompt: `${prompt}. Style: suitable as a website background, subtle and not too busy, cohesive color palette, professional quality.`,
    n: 1,
    size: IMAGE_CONFIG.IMAGE_SIZE,
    quality: IMAGE_CONFIG.IMAGE_QUALITY,
    output_format: IMAGE_CONFIG.OUTPUT_FORMAT,
    output_compression: IMAGE_CONFIG.OUTPUT_COMPRESSION,
  })

  const b64 = response.data?.[0]?.b64_json
  if (!b64) {
    throw new Error("No image data returned from image model")
  }

  const buffer = Buffer.from(b64, "base64")
  if (buffer.length === 0) {
    throw new Error("Image model returned empty image data")
  }
  return buffer
}

/**
 * Upload image to Vercel Blob
 */
async function uploadToBlob(image: Buffer, filename: string): Promise<string> {
  console.log("[ImageGen] Uploading to Vercel Blob...")

  const blob = await put(filename, image, {
    access: "public",
    contentType: `image/${IMAGE_CONFIG.OUTPUT_FORMAT}`,
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
    // Generate image
    const image = await generateAiImage(theme.backgroundImagePrompt)

    // Upload to Vercel Blob for permanent storage
    const filename = `backgrounds/${theme.themeSlug}-${Date.now()}.${IMAGE_CONFIG.OUTPUT_FORMAT}`
    const blobUrl = await uploadToBlob(image, filename)
    
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
