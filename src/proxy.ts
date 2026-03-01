import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const { searchParams } = request.nextUrl

  // Track visitor count via cookie
  const visitCount = parseInt(request.cookies.get("visit_count")?.value || "0", 10)
  response.cookies.set("visit_count", String(visitCount + 1), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
  })

  // Query param theme override: ?theme=heavy-metal
  // This triggers a server-side regen via a header the page can read
  const themeOverride = searchParams.get("theme")
  if (themeOverride) {
    response.headers.set("x-theme-override", themeOverride)
  }

  // Pass visitor count to the server
  response.headers.set("x-visitor-count", String(visitCount + 1))

  return response
}

export const config = {
  matcher: ["/"],
}
