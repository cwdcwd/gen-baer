import { NextRequest, NextResponse } from "next/server"
import { clearBooksCache, clearThemesCache } from "@/lib/redis"

export const dynamic = "force-dynamic"

/**
 * Clear Redis cache
 * 
 * Query params:
 * - key: "books" | "themes" | "all" (default: "all")
 * 
 * Authentication:
 * - Provide the secret via the Authorization header, e.g.:
 *   Authorization: Bearer <CACHE_CLEAR_SECRET>
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key") || "all"

    // Extract secret from Authorization header
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    const expectedSecret = process.env.CACHE_CLEAR_SECRET

    let providedSecret: string | null = null
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        providedSecret = authHeader.slice("Bearer ".length)
      } else {
        providedSecret = authHeader
      }
    }

    if (!expectedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized - invalid or missing secret" },
        { status: 401 }
      )
    }

    const deleted: string[] = []

    if (key === "books" || key === "all") {
      await clearBooksCache()
      deleted.push("books")
    }

    if (key === "themes" || key === "all") {
      await clearThemesCache()
      deleted.push("themes")
    }

    return NextResponse.json({
      success: true,
      cleared: deleted,
      message: `Successfully cleared ${deleted.join(", ")} cache`,
    })
  } catch (error) {
    console.error("[Cache Clear] Error:", error)
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    )
  }
}
