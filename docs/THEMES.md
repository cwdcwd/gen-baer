# Theme System

## Overview

The theme system is the core of Gen-Baer. It uses AI to completely reimagine your portfolio in different aesthetic styles, transforming colors, typography, layout, and even the copy itself.

## How It Works

### 1. Theme Generation Flow

```
User/Cron → API Endpoint → OpenAI GPT-4 → Zod Validation → Redis Storage → Page Render
```

1. **Trigger**: Manual request or scheduled cron job
2. **Context Building**: Gathers your resume data and reading list
3. **AI Prompt**: Sends a detailed prompt to GPT-4 with theme instructions
4. **Schema Validation**: Uses Zod to ensure the response matches expected structure
5. **Storage**: Saves to Redis as the "current theme"
6. **Application**: Next.js page fetches and applies the theme

### 2. Multi-Theme Caching System

Gen-Baer now supports multiple pre-generated themes that users can switch between without admin access.

#### Storage Architecture

- **Individual Theme Storage**: Each theme is stored in Redis with a unique slug key pattern: `theme:vaporwave`, `theme:cyberpunk-noir`, etc.
- **Available Themes Set**: A Redis set (`available-themes`) tracks all cached theme slugs
- **User Preference**: Cookie-based selection (`selected-theme`) remembers user's choice

#### User Experience

**Regular Users:**
- Click the theme badge in the bottom-right corner
- View all available pre-cached themes with color previews
- Switch between themes instantly (page reload applies new theme)
- Selection persists via browser cookie

**Admin Users:**
- Access admin panel with `?admin=true` URL parameter + `ADMIN_SECRET`
- Regenerate individual themes or generate random new ones
- New themes are automatically added to the available themes cache

#### API Endpoints

**GET /api/themes** (Public)
- Lists all available cached themes
- Returns simplified metadata: slug, name, generatedAt, colors, layoutVariant
- No authentication required

**POST /api/theme** (Admin only)
- Creates a new theme
- Requires `Authorization: Bearer <ADMIN_SECRET>` header
- Stores the theme in cache

**PATCH /api/theme** (Admin only)
- Regenerates the current theme
- Requires `Authorization: Bearer <ADMIN_SECRET>` header
- Updates the cache with the new theme

**DELETE /api/theme** (Admin only)
- Deletes a specific theme from the cache
- Requires `Authorization: Bearer <ADMIN_SECRET>` header
- Accepts theme slug via query parameter or request body

#### Implementation Flow

```
User opens site → Cookie checked → Load theme:slug from Redis → Apply theme
User switches theme → Set cookie → Reload page → Load new theme
Admin regenerates → Generate new theme → Store in Redis → Update available set
```

### 3. Theme Components

#### Colors

Each theme includes 5 core colors:
- **Background**: Main page background
- **Foreground**: Primary text color
- **Accent**: Highlights, links, interactive elements
- **Muted**: Secondary text, borders
- **Border**: Dividers and card borders

Colors are applied via CSS variables for easy theming:

```css
:root {
  --background: 26 11 46;  /* HSL values */
  --foreground: 333 100 71;
  --accent: 180 100 50;
  --muted: 258 61 65;
  --border: 300 100 50;
}
```

#### Typography

Two Google Fonts per theme:
- **Heading Font**: Display text, hero, section titles
- **Body Font**: Paragraphs, descriptions, UI text

Fonts are loaded via Next.js font optimization:

```typescript
import { Orbitron, Roboto } from 'next/font/google'
```

#### Layout Variants

Five distinct layout styles:

| Variant | Best For | Characteristics |
|---------|----------|-----------------|
| Classic | Traditional, elegant themes | Centered content, generous spacing |
| Brutalist | Raw, angular, punk aesthetics | Tight spacing, bold typography |
| Cards | Modern, modular themes | Sections in cards, grid layouts |
| Terminal | Tech, hacker, retro-computing | Monospace fonts, minimal styling |
| Magazine | Editorial, artistic themes | Wide layout, large imagery |

#### Decorative CSS

Each theme can include custom CSS (max 500 characters) applied to the page body:

```css
background: linear-gradient(45deg, #ff00ff 0%, #00ffff 100%);
box-shadow: inset 0 0 100px rgba(255, 110, 199, 0.3);
```

Only these properties are allowed for security:
- `background`
- `box-shadow`
- `text-shadow`
- `border`
- `filter`

#### Animation Style

Three animation modes:
- **Energetic**: Fast, bouncy animations for high-energy themes
- **Subtle**: Gentle, smooth transitions for elegant themes
- **None**: No animations for minimal themes

### 3. Copy Transformation

The AI rewrites ALL text in the theme's voice:

**Original:**
> I'm a full-stack developer with a passion for building products...

**Vaporwave Theme:**
> ▲ aesthetic developer ▽ crafting digital dreams in neon-lit cyberspace...

**Film Noir Theme:**
> The city's full of developers. I'm the one you hire when the code gets dirty...

## Creating New Themes

### Add to Default Rotation

Edit [src/lib/themes-config.ts](../src/lib/themes-config.ts):

```typescript
const DEFAULT_THEMES = [
  "80s new wave",
  "japanimation",
  "your new theme",  // Add here
  // ...
]
```

### Use Vercel Edge Config (Dynamic)

For production environments, use Edge Config for hot-swappable themes:

1. Create an Edge Config in Vercel
2. Add a `themes` array:
```json
{
  "themes": [
    "solarpunk future",
    "dark academia",
    "memphis design"
  ]
}
```
3. Set `EDGE_CONFIG` environment variable
4. Themes update without redeployment!

### Theme Naming Tips

Good theme names are:
- **Specific**: "vaporwave" not "retro"
- **Evocative**: "cyberpunk noir" not "dark blue"
- **Cultural**: Reference art movements, music genres, time periods
- **2-4 words**: Enough context for the AI

Examples:
- ✅ "art deco gatsby"
- ✅ "lo-fi hip hop"
- ✅ "psychedelic 60s"
- ❌ "modern"
- ❌ "blue theme"
- ❌ "professional corporate business"

## Theme Schema

The full Zod schema is in [src/lib/theme-schema.ts](../src/lib/theme-schema.ts):

```typescript
export const themeSchema = z.object({
  themeSlug: z.string(),
  generatedAt: z.string(),
  colors: z.object({
    background: z.string(),
    foreground: z.string(),
    accent: z.string(),
    muted: z.string(),
    border: z.string(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    headingWeight: z.number().min(100).max(900),
    bodyWeight: z.number().min(100).max(900),
  }),
  style: z.object({
    borderRadius: z.number().min(0).max(32),
    layoutVariant: z.enum(["classic", "brutalist", "cards", "terminal", "magazine"]),
    decorativeCSS: z.string().max(500),
    animationStyle: z.enum(["energetic", "subtle", "none"]),
  }),
  copy: z.object({
    hero: z.object({
      name: z.string(),
      tagline: z.string(),
    }),
    bio: z.string(),
    projects: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
    footer: z.string(),
  }),
})
```

## Customization

### Adjust AI Prompt

Edit [src/app/api/theme/route.ts](../src/app/api/theme/route.ts) to modify how themes are generated:

```typescript
const result = await generateText({
  model: "openai/gpt-4o",
  output: Output.object({ schema: themeSchema }),
  prompt: `Your custom prompt here...`
})
```

**Tips:**
- Add more constraints (e.g., "always use sans-serif fonts")
- Include examples of desired output
- Adjust tone ("be more professional" or "be more playful")
- Add context about your brand

### Fallback Theme

If theme generation fails or Redis is unavailable, a fallback theme is used from [src/lib/theme-schema.ts](../src/lib/theme-schema.ts):

```typescript
export const fallbackTheme: GeneratedTheme = {
  themeSlug: "default",
  colors: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    // ...
  },
  // ...
}
```

Customize this to match your preferred default aesthetic.

### Theme Preview

Want to preview themes before deploying?

1. Generate locally:
```bash
curl -X POST http://localhost:3000/api/theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -d '{"theme": "test theme"}'
```

2. Check Redis:
```bash
# Use Upstash console or Redis CLI
GET current-theme
```

3. View at `http://localhost:3000`

## Feature Flags

Use [src/lib/themes-config.ts](../src/lib/themes-config.ts) feature flags:

```typescript
export async function getFeatureFlags(): Promise<{
  forceTheme: string | null          // Force a specific theme
  regenEnabled: boolean               // Enable manual regeneration
  timeOfDayThemes: Record<string, string[]> | null  // Future: time-based themes
}> {
  // Try Edge Config first
  // Fall back to defaults
}
```

### Force a Theme

In Edge Config or environment:
```json
{
  "forceTheme": "vaporwave"
}
```

This overrides rotation and always generates the specified theme.

## Debugging

### Theme Not Applying?

1. Check Redis connection:
```typescript
// src/lib/redis.ts
const theme = await getTheme()
console.log('Current theme:', theme)
```

2. Verify CSS variables in browser DevTools:
```css
:root {
  --background: ...
  --foreground: ...
}
```

3. Check for JavaScript errors in console

### Theme Looks Broken?

1. Verify Google Fonts loaded:
   - Open Network tab
   - Check for font requests
   - Confirm no 404s

2. Check decorative CSS:
   - Invalid CSS will be ignored
   - Keep it simple and valid

3. Test layout variant:
   - Try switching to "classic" in the theme object
   - Some variants may not suit all content

### AI Generating Bad Themes?

1. **Refine the prompt** - Add more examples or constraints
2. **Adjust temperature** - Lower for more conservative themes
3. **Use different model** - Try GPT-4 variants
4. **Add validation** - Extend Zod schema with more rules

## Best Practices

1. **Test new themes locally** before adding to rotation
2. **Monitor AI costs** - GPT-4 calls add up
3. **Cache aggressively** - Don't regenerate unnecessarily
4. **Keep prompts focused** - Clear instructions = better output
5. **Version your themes** - Store old themes for rollback
6. **A/B test** - Try multiple variants of popular themes

## Advanced: Custom Theme Properties

Want to add more theme properties?

1. **Update schema** in `theme-schema.ts`:
```typescript
const themeSchema = z.object({
  // ... existing fields
  customAnimations: z.object({
    heroEntry: z.string(),
    scrollReveal: z.string(),
  })
})
```

2. **Update AI prompt** to generate these fields

3. **Apply in components**:
```typescript
<div style={{ animation: theme.customAnimations.heroEntry }}>
  {/* content */}
</div>
```

4. **Update fallback theme** with default values
