"use client"

import { useState, useEffect } from "react"
import type { GeneratedTheme } from "@/lib/theme-schema"
import { RefreshCw, Palette, ChevronUp, ChevronDown, Check } from "lucide-react"

interface ThemeBadgeProps {
  theme: GeneratedTheme
}

interface AvailableTheme {
  slug: string
  name: string
  generatedAt: string
  colors: string[]
  layoutVariant: string
}

export function ThemeBadge({ theme }: ThemeBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenResult, setRegenResult] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [availableThemes, setAvailableThemes] = useState<AvailableTheme[]>([])
  const [isLoadingThemes, setIsLoadingThemes] = useState(false)

  // Check for admin mode via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsAdmin(params.get("admin") === "true")
  }, [])

  // Load available themes when expanded
  useEffect(() => {
    if (isExpanded && availableThemes.length === 0) {
      loadAvailableThemes()
    }
  }, [isExpanded])

  async function loadAvailableThemes() {
    setIsLoadingThemes(true)
    try {
      const res = await fetch("/api/themes")
      const data = await res.json()
      if (res.ok) {
        setAvailableThemes(data.themes || [])
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoadingThemes(false)
    }
  }

  async function switchTheme(slug: string) {
    // Set cookie to persist selection
    document.cookie = `selected-theme=${slug}; path=/; max-age=31536000`
    // Reload to apply theme
    window.location.reload()
  }

  async function handleRegenerate(themeName?: string) {
    setIsRegenerating(true)
    setRegenResult(null)

    try {
      const res = await fetch("/api/regen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${prompt("Enter admin secret:") || ""}`,
        },
        body: JSON.stringify(themeName ? { theme: themeName } : {}),
      })

      const data = await res.json()
      if (res.ok) {
        setRegenResult(`Generated: ${data.theme}`)
        // Reload available themes
        await loadAvailableThemes()
        // Reload page after a moment
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setRegenResult(`Error: ${data.error}`)
      }
    } catch {
      setRegenResult("Failed to regenerate")
    } finally {
      setIsRegenerating(false)
    }
  }

  // Format date in UTC to avoid hydration mismatch between server/client timezones
  const d = new Date(theme.generatedAt)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const generatedDate = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2"
      style={{ fontFamily: "var(--theme-mono-font)" }}
    >
      {/* Main toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 text-xs shadow-lg backdrop-blur-sm transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--theme-bg-secondary)",
          color: "var(--theme-fg-muted)",
          border: `1px solid var(--theme-border)`,
          borderRadius: "var(--theme-radius)",
        }}
      >
        <Palette className="h-3 w-3" style={{ color: "var(--theme-accent)" }} />
        <span>{theme.themeName}</span>
        <span style={{ color: "var(--theme-border)" }}>&middot;</span>
        <span suppressHydrationWarning>{generatedDate}</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {regenResult && (
        <div
          className="px-3 py-2 text-xs"
          style={{
            backgroundColor: "var(--theme-bg-secondary)",
            color: "var(--theme-accent)",
            border: `1px solid var(--theme-border)`,
            borderRadius: "var(--theme-radius)",
          }}
        >
          {regenResult}
        </div>
      )}

      {/* Admin controls - regeneration */}
      {isExpanded && isAdmin && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{
            backgroundColor: "var(--theme-bg-secondary)",
            border: `1px solid var(--theme-border)`,
            borderRadius: "var(--theme-radius)",
          }}
        >
          <div className="mb-1 text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>
            Admin: Regenerate
          </div>
          <button
            onClick={() => handleRegenerate()}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-3 py-2 text-xs transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: "var(--theme-accent)",
              color: "var(--theme-bg)",
              borderRadius: "var(--theme-radius)",
            }}
          >
            <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Generating..." : "Random Theme"}
          </button>
          {["80s new wave", "japanimation", "heavy metal", "cyberpunk noir", "vaporwave"].map(
            (t) => (
              <button
                key={t}
                onClick={() => handleRegenerate(t)}
                disabled={isRegenerating}
                className="px-3 py-1.5 text-left text-xs transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{
                  color: "var(--theme-fg-muted)",
                  borderRadius: "var(--theme-radius)",
                }}
              >
                {t}
              </button>
            )
          )}
        </div>
      )}

      {/* User theme picker - switch between cached themes */}
      {isExpanded && !isAdmin && (
        <div
          className="flex max-h-96 flex-col gap-2 overflow-y-auto p-3"
          style={{
            backgroundColor: "var(--theme-bg-secondary)",
            border: `1px solid var(--theme-border)`,
            borderRadius: "var(--theme-radius)",
          }}
        >
          <div className="mb-1 text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>
            {isLoadingThemes ? "Loading themes..." : "Switch Theme"}
          </div>
          {!isLoadingThemes && availableThemes.length === 0 && (
            <div className="px-3 py-2 text-xs" style={{ color: "var(--theme-fg-muted)" }}>
              No themes available
            </div>
          )}
          {availableThemes.map((t) => {
            const isCurrentTheme = t.slug === theme.themeSlug
            return (
              <button
                key={t.slug}
                onClick={() => !isCurrentTheme && switchTheme(t.slug)}
                disabled={isCurrentTheme}
                className="flex flex-col gap-1 px-3 py-2 text-left text-xs transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: isCurrentTheme ? "var(--theme-accent)" : "transparent",
                  color: isCurrentTheme ? "var(--theme-bg)" : "var(--theme-fg-muted)",
                  borderRadius: "var(--theme-radius)",
                  border: isCurrentTheme ? "none" : `1px solid var(--theme-border)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.name}</span>
                  {isCurrentTheme && <span className="text-[10px]">(active)</span>}
                </div>
                <div className="flex gap-1">
                  {t.colors.slice(0, 5).map((color, idx) => (
                    <div
                      key={idx}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
