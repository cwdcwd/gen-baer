# API Reference

## Overview

Gen-Baer exposes API endpoints for theme generation and management. All endpoints require authentication via Bearer token.

## Endpoints

### POST `/api/generate-theme`

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
  "theme": {
    "themeSlug": "vaporwave",
    "colors": {
      "background": "#1a0b2e",
      "foreground": "#ff6ec7",
      "accent": "#00ffff",
      "muted": "#8b5cf6",
      "border": "#ff00ff"
    },
    "typography": {
      "headingFont": "Orbitron",
      "bodyFont": "Roboto"
    },
    // ... full theme object
  },
  "generatedAt": "2026-02-14T12:00:00.000Z"
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
curl -X POST https://your-domain.com/api/generate-theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"theme": "cyberpunk noir"}'
```

---

### POST `/api/regen`

Regenerates the current theme with fresh content while keeping the same theme aesthetic.

#### Authentication

Requires:
- `Authorization: Bearer {ADMIN_SECRET}`

#### Request Body

```json
{}  // Empty body
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Theme regenerated successfully",
  "theme": {
    // ... new theme object
  }
}
```

**Error Responses**

```json
// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 404 Not Found
{
  "error": "No current theme found"
}

// 500 Internal Server Error
{
  "error": "Failed to regenerate theme"
}
```

#### Example Request

```bash
curl -X POST https://your-domain.com/api/regen \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
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
- Add webhook support by modifying the `/api/generate-theme` route
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
  const response = await fetch('/api/generate-theme', {
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
