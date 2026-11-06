"use client"

import { useEffect, useRef } from "react"

/**
 * Client component for lazy loading the background image
 * Must be a client component because it uses refs and browser APIs
 */
export function BackgroundImage({ url }: { url: string }) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!divRef.current) return

    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) divRef.current?.classList.add("loaded")
    }
    img.onerror = () => {
      // The SVG pattern layer stays visible; make the failure discoverable.
      console.warn("[BackgroundImage] Failed to load background image:", url)
    }
    img.src = url

    return () => {
      cancelled = true
      img.onload = null
      img.onerror = null
    }
  }, [url])

  return (
    <div
      ref={divRef}
      className="theme-bg-image"
      style={{ backgroundImage: `url("${url}")` }}
    />
  )
}
