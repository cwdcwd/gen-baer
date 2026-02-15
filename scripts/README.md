# Scripts

## seed-themes.ts

Generates and caches all themes from the default theme list in `src/lib/themes-config.ts`.

### Usage

```bash
# Using pnpm script (recommended)
pnpm seed-themes [API_URL] [ADMIN_SECRET]

# Or directly with tsx
tsx scripts/seed-themes.ts [API_URL] [ADMIN_SECRET]
```

### Arguments

- `API_URL` (optional): The base URL of your API. Defaults to:
  1. First argument
  2. `NEXT_PUBLIC_URL` environment variable
  3. `http://localhost:3000`

- `ADMIN_SECRET` (optional): Your admin secret for authentication. Defaults to:
  1. Second argument
  2. `ADMIN_SECRET` environment variable
  3. Empty string (will fail)

### Examples

```bash
# Local development (requires ADMIN_SECRET in .env)
pnpm seed-themes

# Local with explicit secret
pnpm seed-themes http://localhost:3000 your-secret-here

# Production
pnpm seed-themes https://your-site.vercel.app your-secret-here
```

### Notes

- Generates themes from `DEFAULT_THEMES` in `src/lib/themes-config.ts`
- Takes ~20-30 seconds (2s delay between generations to avoid rate limits)
- Existing themes will be regenerated
- Uses the `/api/generate-theme` endpoint which calls OpenAI
