"use client"

import { useState } from "react"
import type { GeneratedTheme } from "@/lib/theme-schema"
import { RefreshCw, Palette, ChevronUp, ChevronDown } from "lucide-react"

interface ThemeBadgeProps {
  theme: GeneratedTheme
}

export function ThemeBadge({ theme }: ThemeBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenResult, setRegenResult] = useState<string | null>(null)

  // Check for admin mode via URL
  const isAdmin =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("admin") === "true"

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
        // Reload after a moment to see the new theme
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

  const generatedDate = new Date(theme.generatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      style={{ fontFamily: "var(--theme-mono-font)" }}
    >
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

      {isExpanded && isAdmin && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{
            backgroundColor: "var(--theme-bg-secondary)",
            border: `1px solid var(--theme-border)`,
            borderRadius: "var(--theme-radius)",
          }}
        >
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
        <span>{generatedDate}</span>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </button>
    </div>
  )
}
