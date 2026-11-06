import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Track visitor count via cookie
  const visitCount = parseInt(request.cookies.get("visit_count")?.value || "0", 10)
  response.cookies.set("visit_count", String(visitCount + 1), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
  })

  // Pass visitor count to the server
  response.headers.set("x-visitor-count", String(visitCount + 1))

  return response
}

export const config = {
  matcher: ["/"],
}
