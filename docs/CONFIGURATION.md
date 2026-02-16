# Configuration Guide

## Environment Variables

### Required Variables

#### OpenAI API Configuration

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and set as `OPENAI_API_KEY`
4. Ensure your account has GPT-4 access and sufficient credits

**Cost Estimates:**
- Each theme generation uses ~2,000-4,000 tokens (input + output)
- At $0.01/1K tokens (GPT-4), expect ~$0.02-0.04 per theme
- Daily generation = ~$0.60-1.20/month

#### Upstash Redis Configuration

```bash
KV_REST_API_URL=https://your-database.upstash.io
KV_REST_API_TOKEN=AaaaAAaaAAaaAAAaaaAAaaAAaaAAaa_AaAaAa==
```

**Setup:**
1. Create account at [Upstash](https://console.upstash.com/)
2. Create a new Redis database (Global or regional)
3. Copy "REST API" → "UPSTASH_REDIS_REST_URL" to `KV_REST_API_URL`
4. Copy "REST API" → "UPSTASH_REDIS_REST_TOKEN" to `KV_REST_API_TOKEN`

**Free Tier Limits:**
- 10,000 commands/day
- 256 MB storage
- Should be sufficient for most personal portfolios

#### Authentication Secrets

```bash
CRON_SECRET=generate-with-openssl-rand-hex-32
ADMIN_SECRET=generate-with-openssl-rand-hex-32
```

**Setup:**
Generate secure random strings:

```bash
# macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use an online generator
# https://1password.com/password-generator/
```

**Usage:**
- `CRON_SECRET`: Used by Vercel Cron to authenticate scheduled jobs
- `ADMIN_SECRET`: Used for manual API calls (theme generation, regeneration)

### Optional Variables

#### Vercel Edge Config

```bash
EDGE_CONFIG=https://edge-config.vercel.com/ecfg_xxxxx?token=xxxxx
```

**Setup:**
1. In Vercel dashboard, go to Storage → Edge Config
2. Create a new Edge Config
3. Add configuration:
```json
{
  "themes": [
    "solarpunk utopia",
    "dark academia",
    "memphis design"
  ],
  "forceTheme": null,
  "regenEnabled": true
}
```
4. Copy the connection string to `EDGE_CONFIG`

**Benefits:**
- Update theme rotation without redeployment
- Feature flags (force theme, toggle features)
- Instant configuration updates globally

## Next.js Configuration

### next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Remove in production
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.hardcover.app",  // For reading list covers
      },
    ],
  },
}
```

**Recommendations:**
- Remove `ignoreBuildErrors: true` after fixing type issues
- Add additional `remotePatterns` if loading images from other sources
- Enable experimental features as needed:
```javascript
experimental: {
  serverActions: true,
  ppr: true,  // Partial Prerendering
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // Path alias for clean imports
    }
  }
}
```

**Path Aliases:**
Use `@/` prefix for all imports:
```typescript
import { getTheme } from "@/lib/redis"
import { Hero } from "@/components/hero"
```

## Tailwind Configuration

### tailwind.config.ts

```typescript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
]
```

**Important:** After moving to `src/` folder, ensure content paths include `./src/`

### Custom CSS Variables

Global styles in [src/app/globals.css](../src/app/globals.css) define theme CSS variables:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 4%;
    --accent: 0 0% 9%;
    /* ... more variables */
  }
}
```

These are overridden dynamically by the theme system via inline styles.

## Vercel Configuration

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/generate-theme",
      "schedule": "0 6 * * *"  // Daily at 6 AM UTC
    }
  ]
}
```

**Cron Schedule Syntax:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, Sun-Sat)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**
- `0 6 * * *` - Daily at 6 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 12 * * 1` - Every Monday at noon
- `0 0 1 * *` - First day of every month

**Requirements:**
- Vercel Pro plan or higher for Cron Jobs
- `CRON_SECRET` must be set in environment variables
- Endpoint must complete within function timeout (60s max duration set)

### Environment Variable Setup

**Development (.env.local):**
```bash
# Local development variables
OPENAI_API_KEY=sk-...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
CRON_SECRET=local-dev-secret
ADMIN_SECRET=local-dev-admin
```

**Production (Vercel):**
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Select "Production" environment
4. Optionally add different values for "Preview" and "Development"

**Best Practices:**
- Never commit `.env.local` to git (in `.gitignore`)
- Use different secrets for dev/prod
- Rotate secrets periodically
- Use Vercel's encrypted environment variables

## shadcn/ui Configuration

### components.json

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Adding New Components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

Components install to `src/components/ui/` automatically due to path aliases.

## Reading List Integration

### Hardcover API

Hardcover integration uses the username `lazybaer` by default, configured in [src/lib/constants.ts](../src/lib/constants.ts):

```typescript
export const HARDCOVER_CONFIG = {
  // ...
  DEFAULT_USERNAME: "lazybaer",  // Change this to your username!
  // ...
}
```

**To use your own reading list:**
1. Create account at [Hardcover](https://hardcover.app/)
2. Add books to your shelves
3. Update `DEFAULT_USERNAME` in [src/lib/constants.ts](../src/lib/constants.ts) to your Hardcover username
4. Redeploy or restart your development server
5. No API key needed (public GraphQL endpoint)

> **Note:** An optional `HARDCOVER_API_TOKEN` environment variable can be set if you need higher rate limits or want to access private data. For most use cases, the public API works without authentication.

**Disable Reading List:**
If you don't want the reading list feature:

1. Remove from [src/app/page.tsx](../src/app/page.tsx):
```typescript
// Remove this
const books = await fetchReadingList().catch(() => [])
// And the ReadingList component
<ReadingList books={books} theme={currentTheme} variant={variant} />
```

2. Update AI prompt in [src/app/api/generate-theme/route.ts](../src/app/api/generate-theme/route.ts) to remove book context

## Personal Data Configuration

### Resume Data

Edit [src/lib/resume-data.ts](../src/lib/resume-data.ts):

```typescript
export const resumeData = {
  name: "Your Name",
  tagline: "Your Professional Tagline",
  avatar: null,  // Or URL to avatar image
  bio: `Your bio here...`,
  
  projects: [
    {
      name: "Project Name",
      description: "What it does",
      url: "https://github.com/...",
      tags: ["React", "TypeScript"],
    },
  ],
  
  socials: [
    { platform: "GitHub", url: "https://github.com/you", icon: "github" },
    { platform: "Twitter", url: "https://twitter.com/you", icon: "twitter" },
  ],
}
```

**Available Social Icons:**
- `github`
- `twitter`
- `linkedin`
- `book` (Hardcover)
- Add more by editing [src/components/socials.tsx](../src/components/socials.tsx)

## Advanced Configuration

### Custom Theme Rotation Logic

Edit [src/lib/themes-config.ts](../src/lib/themes-config.ts):

```typescript
export async function getNextTheme(): Promise<{ theme: string; index: number }> {
  const themes = await getThemeList()
  const currentIndex = await getRotationIndex()
  
  // Custom logic here
  // Example: random selection
  const nextIndex = Math.floor(Math.random() * themes.length)
  
  await setRotationIndex(nextIndex)
  return {
    theme: themes[nextIndex],
    index: nextIndex,
  }
}
```

### Time-of-Day Themes

Implement time-based theme selection:

```typescript
export async function getNextTheme(): Promise<{ theme: string; index: number }> {
  const hour = new Date().getUTCHours()
  
  const timeThemes: Record<string, string[]> = {
    morning: ["sunrise aesthetic", "fresh minimalism"],
    afternoon: ["bright brutalism", "clean corporate"],
    evening: ["sunset vibes", "cozy lo-fi"],
    night: ["cyberpunk noir", "dark vaporwave"],
  }
  
  let themes: string[]
  if (hour >= 6 && hour < 12) themes = timeThemes.morning
  else if (hour >= 12 && hour < 17) themes = timeThemes.afternoon
  else if (hour >= 17 && hour < 21) themes = timeThemes.evening
  else themes = timeThemes.night
  
  const theme = themes[Math.floor(Math.random() * themes.length)]
  
  return { theme, index: 0 }
}
```

### Visitor Analytics

The project includes a visitor counter in [src/lib/redis.ts](../src/lib/redis.ts):

```typescript
export async function incrementVisitorCount(): Promise<number> {
  return await redis.incr(VISITOR_KEY)
}
```

**To enable:**
1. Call in [src/middleware.ts](../src/middleware.ts) or page
2. Display in footer or analytics dashboard
3. Consider privacy implications and compliance (GDPR, etc.)

### Custom AI Model

Switch to a different OpenAI model or provider:

```typescript
// In src/app/api/generate-theme/route.ts
const result = await generateText({
  model: "openai/gpt-4-turbo",  // or gpt-3.5-turbo for cost savings
  // model: "anthropic/claude-3-sonnet",  // Anthropic Claude
  output: Output.object({ schema: themeSchema }),
  prompt: `...`,
})
```

**Vercel AI SDK** supports multiple providers. Install additional adapters:
```bash
pnpm add @ai-sdk/anthropic
pnpm add @ai-sdk/mistral
```

## Troubleshooting

### OpenAI API Errors

**Rate Limit Exceeded:**
- Upgrade OpenAI account tier
- Reduce generation frequency
- Implement retry logic with exponential backoff

**Insufficient Credits:**
- Add payment method to OpenAI account
- Monitor usage in OpenAI dashboard

### Redis Connection Issues

**ECONNREFUSED:**
- Verify `KV_REST_API_URL` is correct
- Check Upstash database is active
- Ensure not using local Redis URL

**Authentication Failed:**
- Regenerate `KV_REST_API_TOKEN` in Upstash console
- Update environment variable
- Restart development server

### Vercel Cron Not Running

**Cron Shows as "Skipped":**
- Verify you have Vercel Pro plan
- Check `CRON_SECRET` is set in production environment
- View cron logs in Vercel dashboard

**Cron Times Out:**
- Increase `maxDuration` in route.ts
- Optimize AI prompt for faster response
- Consider background job processing

### Build Errors

**Module Not Found:**
- Run `pnpm install`
- Check import paths use `@/` alias
- Verify all files moved to `src/` folder

**Type Errors:**
- Run `pnpm run build` locally first
- Fix TypeScript errors before deploying
- Don't rely on `ignoreBuildErrors: true`

## Performance Optimization

### Edge Runtime

Convert routes to edge runtime for faster response:

```typescript
// In route.ts
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
```

**Note:** Edge runtime has limitations (no Node.js APIs, 1MB response limit)

### Redis Caching Strategy

```typescript
// Cache themes with TTL
export async function setTheme(theme: GeneratedTheme, ttl: number = 86400): Promise<void> {
  await redis.set(THEME_KEY, theme, { ex: ttl })  // 24 hour expiry
}
```

### Image Optimization

For avatar and project images:
```typescript
import Image from 'next/image'

<Image 
  src={avatarUrl}
  width={100}
  height={100}
  alt="Avatar"
  priority  // For above-the-fold images
/>
```

## Security Considerations

1. **Never expose secrets** - Keep API keys in environment variables only
2. **Validate inputs** - All API inputs should be validated
3. **Rate limiting** - Consider adding rate limiting for API routes
4. **CORS** - Configure appropriately if building separate frontend
5. **Content Security Policy** - Add CSP headers for additional security
6. **Sanitize user content** - If allowing user-generated themes

## Monitoring & Logging

### Vercel Analytics

Enable in Vercel dashboard:
- Web Analytics (page views, performance)
- Speed Insights (Core Web Vitals)

### Custom Logging

```typescript
// In API routes
console.log('[Theme Generation]', {
  theme: themeName,
  timestamp: new Date().toISOString(),
  success: true,
})
```

View logs in:
- `pnpm dev` console (local)
- Vercel Functions → Logs (production)

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io/) for error tracking
- [LogDNA](https://www.logdna.com/) for log aggregation
- [Datadog](https://www.datadoghq.com/) for full observability
