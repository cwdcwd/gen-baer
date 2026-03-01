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
    
    const img = new Image()
    img.onload = () => {
      divRef.current?.classList.add("loaded")
    }
    img.src = url
  }, [url])

  return (
    <div
      ref={divRef}
      className="theme-bg-image"
      style={{ backgroundImage: `url("${url}")` }}
    />
  )
}
