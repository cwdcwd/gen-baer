# API Reference

## Overview

Gen-Baer exposes API endpoints for theme generation and management. All endpoints require authentication via Bearer token.

## Endpoints

### POST `/api/theme`

Generates a new theme using AI and stores it in Redis.

#### Authentication

Requires one of:
- `Authorization: Bearer {CRON_SECRET}` - For automated cron jobs
- `Authorization: Bearer {ADMIN_SECRET}` - For manual admin access

#### Request Body

```json
{
  "theme": "vaporwave"  // Optional: specify a theme, otherwise uses rotation
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "theme": "Vaporwave",
  "layoutVariant": "cards"
}
```

**Note:** The `theme` field returns the display name (e.g., "Vaporwave"), not the slug.

**Error Responses**

```json
// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "error": "Failed to generate theme"
}
```

#### Example Request

```bash
curl -X POST https://your-domain.com/api/theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"theme": "cyberpunk noir"}'
```

---

### PATCH `/api/theme`

Regenerates the current theme with fresh content. Functionally identical to POST, but semantically represents an update/regeneration.

#### Authentication

Requires:
- `Authorization: Bearer {ADMIN_SECRET}`

#### Request Body

```json
{
  "theme": "vaporwave"  // Optional: specify a theme to regenerate
}
```

#### Response

Same as POST `/api/theme`

#### Example Request

```bash
curl -X PATCH https://your-domain.com/api/theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"theme": "cyberpunk noir"}'
```

---

### DELETE `/api/theme`

Deletes a specific theme from the cache.

#### Authentication

Requires:
- `Authorization: Bearer {ADMIN_SECRET}`

#### Request Parameters

You can provide the theme slug in either:
- **Query parameter**: `?slug=theme-name`
- **Request body**: `{"slug": "theme-name"}`

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Theme \"vaporwave\" deleted successfully"
}
```

**Error Responses**

```json
// 400 Bad Request - missing slug
{
  "error": "Theme slug is required"
}

// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "error": "Failed to delete theme"
}
```

#### Example Requests

```bash
# Using query parameter
curl -X DELETE "https://your-domain.com/api/theme?slug=vaporwave" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Using request body
curl -X DELETE https://your-domain.com/api/theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug": "vaporwave"}'
```

---

### GET `/api/themes`

Returns a list of all available cached themes with their metadata.

#### Authentication

None required - this is a public endpoint.

#### Response

**Success (200)**
```json
{
  "themes": [
    {
      "slug": "vaporwave",
      "name": "Vaporwave",
      "generatedAt": "2026-02-28T12:00:00.000Z",
      "colors": [
        "#1a0b2e",
        "#e0e0ff",
        "#00f0ff",
        "#ff2a6d",
        "#1e1e3a"
      ],
      "layoutVariant": "cards"
    }
  ]
}
```

The colors array contains: `[background, foreground, accent, accentSecondary, border]`

---

## Theme Object Schema

```typescript
{
  themeName: string            // Display name, e.g. "Cyberpunk Noir"
  themeSlug: string            // URL-friendly slug, e.g. "cyberpunk-noir"
  generatedAt: string          // ISO 8601 timestamp
  
  colors: {
    background: string         // Primary background as hex
    backgroundSecondary: string // Secondary background for cards/sections as hex
    foreground: string         // Primary text color as hex
    foregroundMuted: string    // Muted/secondary text color as hex
    accent: string            // Primary accent color as hex
    accentSecondary: string   // Secondary accent color as hex
    border: string            // Border color as hex
  }
  
  typography: {
    headingFont: string       // Google Font name for headings
    bodyFont: string          // Google Font name for body text
    monoFont: string          // Google Font name for monospace text
  }
  
  copy: {
    siteTitle: string         // Site title in theme's voice
    heroHeadline: string      // Hero headline in theme's voice
    heroSubtext: string       // Hero subtext in theme's voice
    bioText: string           // Bio rewritten in theme's voice (2-3 paragraphs)
    projectsSectionTitle: string // Themed section heading for projects
    readingSectionTitle: string  // Themed section heading for reading list
    socialsSectionTitle: string  // Themed section heading for socials
    footerText: string        // Footer line in theme's voice
  }
  
  projectDescriptions: Array<{
    originalName: string      // Original project name to match against
    themedName: string        // Project name in theme's voice
    themedDescription: string // Project description in theme's voice
  }>
  
  style: {
    layoutVariant: string     // "classic" | "brutalist" | "cards" | "terminal" | "magazine"
    borderRadius: string      // CSS value, e.g. "0px", "16px"
    decorativeCSS: string     // Custom CSS for theme-specific styling (max 500 chars)
    animationStyle: string    // "none" | "subtle" | "energetic"
  }
}
```

---

### DELETE `/api/cache/clear`

Clears cached data from Redis (themes and/or books).

#### Authentication

Requires:
- `?secret={CACHE_CLEAR_SECRET}` - Query parameter

#### Query Parameters

- `key` - (Optional) What to clear: `"books"`, `"themes"`, or `"all"` (default: `"all"`)
- `secret` - (Required) Authentication secret

#### Response

**Success (200)**
```json
{
  "success": true,
  "cleared": ["books", "themes"],
  "message": "Successfully cleared books, themes cache"
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "error": "Unauthorized - invalid or missing secret"
}

// 500 Internal Server Error
{
  "error": "Failed to clear cache"
}
```

#### Example Requests

```bash
# Clear all caches
curl -X DELETE "https://your-domain.com/api/cache/clear?secret=YOUR_CACHE_CLEAR_SECRET"

# Clear only books cache
curl -X DELETE "https://your-domain.com/api/cache/clear?key=books&secret=YOUR_CACHE_CLEAR_SECRET"

# Clear only themes cache
curl -X DELETE "https://your-domain.com/api/cache/clear?key=themes&secret=YOUR_CACHE_CLEAR_SECRET"
```

---

## Rate Limits

- Theme generation uses OpenAI GPT-4, which has rate limits based on your OpenAI account tier
- Upstash Redis rate limits depend on your plan
- No application-level rate limiting is currently implemented

## Best Practices

1. **Generate themes sparingly** - Each generation costs OpenAI API tokens
2. **Use rotation** - Let the automatic rotation handle theme changes
3. **Test locally first** - Generate themes in development before production
4. **Monitor costs** - Track your OpenAI API usage in the OpenAI dashboard
5. **Cache reading list** - The Hardcover integration caches for 1 hour to reduce API calls

## Webhooks

Currently, Gen-Baer does not emit webhooks. To be notified of theme changes, you can:
- Poll the home page periodically
- Add webhook support by modifying the `/api/theme` route
- Use Vercel's deployment hooks with scheduled functions

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `401` - Unauthorized (bad or missing auth token)
- `404` - Resource not found
- `500` - Internal server error (AI generation failed, Redis error, etc.)

Include error handling in your integration:

```javascript
try {
  const response = await fetch('/api/theme', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ theme: 'vaporwave' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
  console.log('Theme generated:', data.theme.themeSlug);
} catch (error) {
  console.error('Theme generation failed:', error);
}
```
