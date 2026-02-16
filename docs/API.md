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
  "theme": "vaporwave",
  "layoutVariant": "cards"
}
```

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

Returns a list of all available theme slugs.

#### Response

**Success (200)**
```json
{
  "themes": ["vaporwave", "cyberpunk", "brutalist", "cottagecore"]
}
```

---

## Theme Object Schema

```typescript
{
  themeSlug: string            // URL-friendly theme identifier
  generatedAt: string          // ISO 8601 timestamp
  
  colors: {
    background: string         // Hex color
    foreground: string         // Hex color
    accent: string            // Hex color
    muted: string             // Hex color
    border: string            // Hex color
  }
  
  typography: {
    headingFont: string       // Google Font name
    bodyFont: string          // Google Font name
    headingWeight: number     // 400-900
    bodyWeight: number        // 400-700
  }
  
  style: {
    borderRadius: number      // 0-32 (px)
    layoutVariant: string     // "classic" | "brutalist" | "cards" | "terminal" | "magazine"
    decorativeCSS: string     // Custom CSS for theme-specific styling
    animationStyle: string    // "energetic" | "subtle" | "none"
  }
  
  copy: {
    hero: {
      name: string
      tagline: string
    }
    bio: string
    projects: Array<{
      name: string
      description: string
    }>
    footer: string
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
