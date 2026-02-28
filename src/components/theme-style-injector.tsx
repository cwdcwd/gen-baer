import type { GeneratedTheme } from "@/lib/theme-schema"
import { BackgroundImage } from "./background-image"

function googleFontUrl(families: string[]): string {
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800;900`)
    .join("&")
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

function sanitizeCSS(css: string): string {
  const allowedProperties = [
    "background",
    "background-image",
    "background-color",
    "background-size",
    "background-position",
    "background-repeat",
    "box-shadow",
    "text-shadow",
    "border",
    "border-color",
    "border-style",
    "border-width",
    "filter",
    "backdrop-filter",
    "opacity",
  ]

  let sanitized = css
    .replace(/javascript:/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/@import/gi, "")
    .replace(/url\s*\(\s*['"]?(?!data:image)[^)]*\)/gi, "")

  const declarations = sanitized.split(";").filter(Boolean)
  const validDeclarations = declarations.filter((decl) => {
    const property = decl.split(":")[0]?.trim().toLowerCase()
    return property && allowedProperties.some((p) => property.startsWith(p))
  })

  return validDeclarations.join(";")
}

/**
 * Check if URL is AI-generated image (not SVG fallback)
 */
function isAiGeneratedImage(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith("http") && !url.startsWith("data:")
}

export function ThemeStyleInjector({ theme }: { theme: GeneratedTheme }) {
  const fonts = [
    theme.typography.headingFont,
    theme.typography.bodyFont,
    theme.typography.monoFont,
  ].filter((f, i, arr) => arr.indexOf(f) === i)

  const decorativeCSS = sanitizeCSS(theme.style.decorativeCSS)
  
  // Background image handling
  const bgImage = theme.backgroundImage
  const hasAiImage = isAiGeneratedImage(bgImage?.url)
  const svgPattern = bgImage?.svgPattern || ""
  const aiImageUrl = hasAiImage ? bgImage?.url : ""

  const animationCSS =
    theme.style.animationStyle === "energetic"
      ? `
    @keyframes theme-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
    @keyframes theme-glow {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.15); }
    }
    @keyframes theme-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .theme-animate { animation: theme-slide-up 0.6s ease-out both; }
    .theme-animate-delay-1 { animation-delay: 0.1s; }
    .theme-animate-delay-2 { animation-delay: 0.2s; }
    .theme-animate-delay-3 { animation-delay: 0.3s; }
    .theme-animate-delay-4 { animation-delay: 0.4s; }
  `
      : theme.style.animationStyle === "subtle"
        ? `
    @keyframes theme-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .theme-animate { animation: theme-slide-up 0.8s ease-out both; }
    .theme-animate-delay-1 { animation-delay: 0.15s; }
    .theme-animate-delay-2 { animation-delay: 0.3s; }
    .theme-animate-delay-3 { animation-delay: 0.45s; }
    .theme-animate-delay-4 { animation-delay: 0.6s; }
  `
        : `
    .theme-animate {}
    .theme-animate-delay-1 {}
    .theme-animate-delay-2 {}
    .theme-animate-delay-3 {}
    .theme-animate-delay-4 {}
  `

  const cssVars = `
    :root {
      --theme-bg: ${theme.colors.background};
      --theme-bg-secondary: ${theme.colors.backgroundSecondary};
      --theme-fg: ${theme.colors.foreground};
      --theme-fg-muted: ${theme.colors.foregroundMuted};
      --theme-accent: ${theme.colors.accent};
      --theme-accent-secondary: ${theme.colors.accentSecondary};
      --theme-border: ${theme.colors.border};
      --theme-radius: ${theme.style.borderRadius};
      --theme-heading-font: '${theme.typography.headingFont}', system-ui, sans-serif;
      --theme-body-font: '${theme.typography.bodyFont}', system-ui, sans-serif;
      --theme-mono-font: '${theme.typography.monoFont}', ui-monospace, monospace;
    }
    body {
      background-color: var(--theme-bg);
      color: var(--theme-fg);
      font-family: var(--theme-body-font);
      transition: background-color 0.3s, color 0.3s;
      min-height: 100vh;
      ${decorativeCSS}
    }
    
    /* Background image layers */
    .theme-bg-container {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    }
    
    .theme-bg-svg {
      position: absolute;
      inset: 0;
      background-image: url("${svgPattern}");
      background-repeat: repeat;
      background-size: 100px 100px;
      opacity: 0.5;
    }
    
    .theme-bg-image {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      transition: opacity 1.5s ease-in-out;
    }
    
    .theme-bg-image.loaded {
      opacity: 0.5;
    }
    
    .theme-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        ${theme.colors.background}99 0%,
        ${theme.colors.background}80 30%,
        ${theme.colors.background}80 70%,
        ${theme.colors.background}99 100%
      );
    }
    
    ${animationCSS}
  `

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontUrl(fonts)} />
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      
      {/* Background image layers */}
      <div className="theme-bg-container">
        {/* SVG pattern fallback (instant load) */}
        {svgPattern && <div className="theme-bg-svg" />}
        
        {/* AI-generated image (lazy load with fade) */}
        {hasAiImage && (
          <BackgroundImage url={aiImageUrl!} />
        )}
        
        {/* Overlay for readability */}
        <div className="theme-bg-overlay" />
      </div>
    </>
  )
}
