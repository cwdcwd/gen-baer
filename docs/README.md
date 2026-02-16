# Gen-Baer Documentation

Welcome to the Gen-Baer documentation! This guide will help you understand, configure, and customize your AI-powered dynamic portfolio.

## 📚 Documentation Index

### Getting Started
- [README](../README.md) - Project overview and quick start guide
- [Configuration Guide](CONFIGURATION.md) - Detailed setup and configuration instructions

### Core Concepts
- [Theme System](THEMES.md) - How themes work and how to customize them
- [API Reference](API.md) - Complete API endpoint documentation

## 🎯 Quick Links

### Setup & Installation
1. [Environment Variables](CONFIGURATION.md#environment-variables)
2. [Personal Data Configuration](CONFIGURATION.md#personal-data-configuration)
3. [Deployment Guide](../README.md#deployment)

### Customization
1. [Adding New Themes](THEMES.md#creating-new-themes)
2. [Modifying AI Prompts](THEMES.md#customization)
3. [Customizing Layouts](THEMES.md#layout-variants)

### API Usage
1. [Generate Theme Endpoint](API.md#post-apigenerate-theme)
2. [Regenerate Theme Endpoint](API.md#post-apiregen)
3. [Authentication](API.md#authentication)

### Advanced Topics
1. [Custom Theme Properties](THEMES.md#advanced-custom-theme-properties)
2. [Time-of-Day Themes](CONFIGURATION.md#time-of-day-themes)
3. [Edge Runtime Configuration](CONFIGURATION.md#edge-runtime)

## 🔍 Common Tasks

### How do I...

**Change my personal information?**
→ Edit [src/lib/resume-data.ts](../src/lib/resume-data.ts)

**Add a new theme to the rotation?**
→ See [Adding Themes](THEMES.md#add-to-default-rotation)

**Generate a theme manually?**
→ See [API Documentation](API.md#post-apigenerate-theme)

**Change the cron schedule?**
→ Edit [vercel.json](../vercel.json) - [Details](CONFIGURATION.md#verceljson)

**Use my own reading list?**
→ Update `DEFAULT_USERNAME` in [src/lib/constants.ts](../src/lib/constants.ts)

**Disable the reading list feature?**
→ See [Configuration Guide](CONFIGURATION.md#reading-list-integration)

**Deploy to production?**
→ See [Deployment Guide](../README.md#deployment)

**Debug theme generation issues?**
→ See [Troubleshooting](CONFIGURATION.md#troubleshooting)

## 📖 Documentation Pages

### [Theme System (THEMES.md)](THEMES.md)
Deep dive into how themes work:
- Theme generation flow
- Color system and typography
- Layout variants
- Copy transformation
- Creating custom themes
- Schema reference

### [API Reference (API.md)](API.md)
Complete API documentation:
- POST `/api/generate-theme` - Generate new theme
- POST `/api/regen` - Regenerate current theme
- Authentication methods
- Request/response formats
- Error handling

### [Configuration Guide (CONFIGURATION.md)](CONFIGURATION.md)
Comprehensive configuration reference:
- Environment variables setup
- Next.js configuration
- Vercel deployment settings
- Reading list integration
- Advanced customization
- Troubleshooting guide

## 🛠️ Project Structure

```
gen-baer/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API endpoints
│   │   │   ├── generate-theme/  # Theme generation
│   │   │   └── regen/           # Theme regeneration
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── hero.tsx             # Hero section
│   │   ├── bio.tsx              # Bio section
│   │   ├── projects.tsx         # Projects showcase
│   │   ├── reading-list.tsx     # Reading list
│   │   ├── socials.tsx          # Social links
│   │   ├── theme-provider.tsx   # Theme context
│   │   ├── theme-style-injector.tsx  # Dynamic CSS injection
│   │   └── theme-badge.tsx      # Theme display badge
│   │
│   ├── lib/                     # Core utilities
│   │   ├── redis.ts             # Redis client & helpers
│   │   ├── hardcover.ts         # Reading list API
│   │   ├── resume-data.ts       # Personal info (EDIT THIS!)
│   │   ├── theme-schema.ts      # Zod validation schema
│   │   ├── themes-config.ts     # Theme rotation config
│   │   └── utils.ts             # General utilities
│   │
│   ├── hooks/                   # Custom React hooks
│   └── middleware.ts            # Next.js middleware
│
├── docs/                        # Documentation (you are here!)
│   ├── README.md               # Documentation index
│   ├── API.md                  # API reference
│   ├── THEMES.md               # Theme system guide
│   └── CONFIGURATION.md         # Configuration reference
│
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── README.md                    # Main project README
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
├── next.config.mjs             # Next.js config
└── vercel.json                 # Vercel deployment config
```

## 🎨 Core Technologies

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **AI**: [OpenAI GPT-4](https://openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Database**: [Upstash Redis](https://upstash.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Validation**: [Zod](https://zod.dev/)

## 💡 Examples

### Example 1: Simple Theme Generation

```typescript
// Manual theme generation
const response = await fetch('/api/generate-theme', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.ADMIN_SECRET}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ theme: 'vaporwave' })
});

const data = await response.json();
console.log('Generated theme:', data.theme);
```

### Example 2: Custom Component with Theme

```tsx
// src/components/custom-section.tsx
import { GeneratedTheme } from "@/lib/theme-schema"

interface CustomSectionProps {
  theme: GeneratedTheme
  variant: string
}

export function CustomSection({ theme, variant }: CustomSectionProps) {
  return (
    <section 
      className="py-12"
      style={{
        color: theme.colors.foreground,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      <h2 style={{ fontFamily: theme.typography.headingFont }}>
        Custom Section
      </h2>
      <p>{theme.copy.bio}</p>
    </section>
  )
}
```

### Example 3: Add Custom Social Platform

```typescript
// In src/lib/resume-data.ts
socials: [
  { platform: "GitHub", url: "https://github.com/you", icon: "github" },
  { platform: "Mastodon", url: "https://mastodon.social/@you", icon: "mastodon" },
]

// In src/components/socials.tsx - add icon mapping
const iconMap = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  book: BookOpen,
  mastodon: Hash,  // Or import a Mastodon icon
}
```

## 🤝 Contributing

Want to contribute to Gen-Baer? We'd love your help!

### Areas for Contribution
- 🎨 New theme ideas and presets
- 📚 Documentation improvements
- 🐛 Bug fixes and testing
- ✨ New features (WebSocket themes, A/B testing, etc.)
- 🎯 Performance optimizations

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📞 Support & Resources

### Community
- [GitHub Issues](https://github.com/yourusername/gen-baer/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/yourusername/gen-baer/discussions) - Questions and community chat

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vercel AI SDK Guide](https://sdk.vercel.ai/docs)
- [Upstash Redis Docs](https://docs.upstash.com/redis)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Credits

Built with ❤️ using:
- [shadcn/ui](https://ui.shadcn.com/) by [@shadcn](https://twitter.com/shadcn)
- [Vercel AI SDK](https://sdk.vercel.ai/) by [Vercel](https://vercel.com/)
- [Upstash Redis](https://upstash.com/)
- Reading list powered by [Hardcover](https://hardcover.app/)

---

**Happy theming! 🎨✨**

For questions or issues, please open an issue on GitHub or check the troubleshooting sections in the documentation.
