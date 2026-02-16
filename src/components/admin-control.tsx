"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function AdminControl() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")

  // Check for admin mode in localStorage on mount
  useEffect(() => {
    const adminMode = localStorage.getItem("admin-mode") === "true"
    setIsAdmin(adminMode)
  }, [])

  function handleAdminClick() {
    if (isAdmin) {
      // Exit admin mode
      setIsAdmin(false)
      localStorage.removeItem("admin-mode")
      localStorage.removeItem("admin-secret")
    } else {
      // Show password dialog
      setShowPasswordDialog(true)
    }
  }

  function handlePasswordSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!password.trim()) return

    // Store the secret and enable admin mode
    // The secret will be verified when first used
    localStorage.setItem("admin-mode", "true")
    localStorage.setItem("admin-secret", password)
    setIsAdmin(true)
    setShowPasswordDialog(false)
    setPassword("")
  }

  return (
    <>
      {/* Top-left admin trigger */}
      <button
        onClick={handleAdminClick}
        className="fixed top-4 left-4 z-50 transition-all hover:scale-110 active:scale-95"
        title={isAdmin ? "Exit admin mode" : "Enter admin mode"}
      >
        <Image
          src="https://s.gravatar.com/avatar/e68a8dbaf1555f955d36a12a5fd21523?s=32"
          alt="Admin"
          width={32}
          height={32}
          className={`rounded-full border-2 ${
            isAdmin
              ? "border-green-500 shadow-lg shadow-green-500/50"
              : "border-gray-400 opacity-30 hover:opacity-100"
          }`}
        />
      </button>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
            <DialogDescription>
              Enter your admin secret to access administrative controls.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Admin Secret</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin secret"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false)
                  setPassword("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Enter Admin Mode</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin toolbar */}
      {isAdmin && <AdminToolbar />}
    </>
  )
}

function AdminToolbar() {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const [themeName, setThemeName] = useState("")

  async function handleClearCache(type: "books" | "themes" | "all") {
    const secret = localStorage.getItem("admin-secret")
    if (!secret) {
      alert("Admin secret not found")
      return
    }

    try {
      const response = await fetch(`/api/cache/clear?key=${type}&secret=${secret}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`✓ ${data.message}`)
        setTimeout(() => setMessage(null), 3000)
      } else {
        if (response.status === 401) {
          alert("Invalid admin secret. Exiting admin mode.")
          localStorage.removeItem("admin-mode")
          localStorage.removeItem("admin-secret")
          window.location.reload()
        } else {
          alert(`Error: ${data.error}`)
        }
      }
    } catch (error) {
      alert("Failed to clear cache")
    }
  }

  function openThemeDialog() {
    setShowThemeDialog(true)
  }

  async function handleRegenerateTheme(e?: React.FormEvent) {
    e?.preventDefault()
    const secret = localStorage.getItem("admin-secret")
    if (!secret) {
      alert("Admin secret not found")
      return
    }
    
    setIsRegenerating(true)
    setMessage("Generating theme...")
    setShowThemeDialog(false)

    try {
      const response = await fetch("/api/theme", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(themeName.trim() ? { theme: themeName } : {}),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`✓ Generated: ${data.theme}`)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        if (response.status === 401) {
          alert("Invalid admin secret. Exiting admin mode.")
          localStorage.removeItem("admin-mode")
          localStorage.removeItem("admin-secret")
          window.location.reload()
        } else {
          alert(`Error: ${data.error}`)
        }
        setMessage(null)
      }
    } catch (error) {
      alert("Failed to regenerate theme")
      setMessage(null)
    } finally {
      setIsRegenerating(false)
      setThemeName("")
    }
  }

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-xl border border-white/20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono opacity-60">ADMIN MODE</span>
            
            <div className="h-4 w-px bg-white/20" />

            <button
              onClick={() => handleClearCache("books")}
              className="text-sm px-3 py-1 rounded-md hover:bg-white/10 transition-colors"
            >
              Clear Books
            </button>

            <button
              onClick={() => handleClearCache("themes")}
              className="text-sm px-3 py-1 rounded-md hover:bg-white/10 transition-colors"
            >
              Clear Themes
            </button>

            <button
              onClick={() => handleClearCache("all")}
              className="text-sm px-3 py-1 rounded-md hover:bg-white/10 transition-colors"
            >
              Clear All
            </button>

            <div className="h-4 w-px bg-white/20" />

            <button
              onClick={openThemeDialog}
              disabled={isRegenerating}
              className="text-sm px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {isRegenerating ? "Generating..." : "Regenerate Theme"}
            </button>

            {message && (
              <>
                <div className="h-4 w-px bg-white/20" />
                <span className="text-sm text-green-400">{message}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Theme Name Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Theme</DialogTitle>
            <DialogDescription>
              Enter a theme name or leave empty for a random theme from the rotation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegenerateTheme}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme Name (optional)</Label>
                <Input
                  id="theme"
                  type="text"
                  placeholder="e.g., cyberpunk, vaporwave, brutalist"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowThemeDialog(false)
                  setThemeName("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Generate Theme</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
