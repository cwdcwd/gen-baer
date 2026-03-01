# Gen-Baer 🎨

A dynamic, AI-powered personal portfolio that automatically regenerates itself with different aesthetic themes. Your resume gets a complete visual and tonal makeover every day — from cyberpunk noir to art deco gatsby, vaporwave to swiss minimalism.

## ✨ Features

- **AI Theme Generation** - Uses GPT-4 to completely reimagine your portfolio in different aesthetic styles
- **AI Background Images** - DALL-E generates unique background artwork for each theme (optional)
- **Automated Rotation** - Daily cron job automatically generates new themes
- **Reading List Integration** - Pulls your currently reading books from Hardcover
- **Multiple Layout Variants** - Classic, brutalist, cards, terminal, and magazine layouts
- **Fully Customizable** - Edit your info in one place, AI handles the rest
- **Edge-Optimized** - Built with Next.js 16 App Router and deployed on Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key
- Upstash Redis account
- (Optional) Vercel account for deployment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gen-baer.git
cd gen-baer
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy the environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local` (see [Configuration](#configuration))

5. Update your personal info in [src/lib/resume-data.ts](src/lib/resume-data.ts)

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) to see your portfolio

### Generate Your First Theme

Trigger a theme generation manually:

```bash
curl -X POST http://localhost:3000/api/theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"theme": "vaporwave"}'
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `KV_REST_API_URL` | Upstash Redis REST URL | [Upstash Console](https://console.upstash.com/) |
| `KV_REST_API_TOKEN` | Upstash Redis REST token | [Upstash Console](https://console.upstash.com/) |
| `CRON_SECRET` | Secret for cron authentication | Generate a random string |
| `ADMIN_SECRET` | Secret for admin API access | Generate a random string |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for AI-generated background images |
| `EDGE_CONFIG` | Vercel Edge Config connection string for dynamic theme lists |
| `CACHE_CLEAR_SECRET` | Secret for authenticating cache clearing endpoint |
| `HARDCOVER_API_TOKEN` | Optional token for higher Hardcover API rate limits |

See [.env.example](.env.example) for a complete template.

## 📖 Usage

### Customizing Your Info

Edit [src/lib/resume-data.ts](src/lib/resume-data.ts) with your:
- Name and tagline
- Bio
- Projects (with descriptions and tags)
- Social links

### Available Themes

Default themes include:
- 80s new wave
- Japanimation
- Heavy metal
- Vaporwave
- Cyberpunk noir
- Art deco gatsby
- Lo-fi hip hop
- Swiss design minimalism
- Addams Family / Edgar Allan Poe
- Film noir detective

You can customize the theme rotation by updating [src/lib/themes-config.ts](src/lib/themes-config.ts) or using Vercel Edge Config.

### Manual Theme Generation

Generate a specific theme:

```bash
curl -X POST https://your-domain.com/api/theme \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"theme": "cyberpunk noir"}'
```

### Automated Daily Rotation

The [vercel.json](vercel.json) file configures a daily cron job at 6 AM UTC. Vercel automatically calls the theme generation endpoint with the `CRON_SECRET`.

## 🏗️ Project Structure

```
gen-baer/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/                # API routes
│   │   │   ├── theme/          # Theme generation/regeneration endpoint
│   │   │   ├── themes/         # Theme list endpoint
│   │   │   └── cache/          # Cache management endpoint
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── hero.tsx            # Hero section
│   │   ├── bio.tsx             # Bio section
│   │   ├── projects.tsx        # Projects showcase
│   │   ├── reading-list.tsx    # Reading list display
│   │   └── theme-*.tsx         # Theme-related components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and core logic
│   │   ├── hardcover.ts        # Hardcover API integration
│   │   ├── redis.ts            # Redis client and helpers
│   │   ├── resume-data.ts      # Your personal info
│   │   ├── theme-schema.ts     # Zod schema for themes
│   │   └── themes-config.ts    # Theme rotation config
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── docs/                       # Documentation
└── [config files]              # TypeScript, Tailwind, etc.
```

## 🎨 How It Works

1. **Theme Generation**: The `/api/theme` endpoint uses GPT-4 to generate a complete theme, including:
   - Color palette (background, foreground, accents)
   - Typography choices (Google Fonts)
   - Rewritten copy in the theme's voice
   - Layout variant selection
   - Custom decorative CSS
   - Animation preferences

2. **Storage**: Generated themes are stored in Upstash Redis for fast retrieval

3. **Display**: The main page fetches the current theme and applies it dynamically via CSS variables and inline styles

4. **Rotation**: A Vercel cron job runs daily to generate a new theme from the rotation list

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import your repository in [Vercel](https://vercel.com)

3. Configure environment variables in Vercel project settings

4. Deploy! Vercel will automatically:
   - Set up the cron job
   - Configure Edge Config (optional)
   - Optimize for edge runtime

### Environment Setup for Vercel Cron

Make sure to set the `CRON_SECRET` environment variable in Vercel, and Vercel Cron will automatically include it in the Authorization header when calling your endpoint.

## 📚 Documentation

- [API Reference](docs/API.md) - Detailed API endpoint documentation
- [Theme System](docs/THEMES.md) - How themes work and customization options
- [Configuration Guide](docs/CONFIGURATION.md) - Advanced configuration options

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **AI**: OpenAI GPT-4 (via Vercel AI SDK)
- **Database**: Upstash Redis
- **Deployment**: Vercel
- **Configuration**: Vercel Edge Config

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new aesthetic themes
- Improve documentation
- Submit pull requests

## 📝 License

MIT License - feel free to use this for your own portfolio!

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Vercel AI SDK](https://sdk.vercel.ai/)
- Reading list via [Hardcover](https://hardcover.app/)

---

**Made by your friendly neighborhood code bear** 🐻
