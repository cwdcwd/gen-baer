import { getCachedBooks, setCachedBooks } from "./redis"

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql"
const HARDCOVER_USERNAME = "lazybaer"

export interface HardcoverBook {
  title: string
  author: string
  coverUrl: string | null
  status: "currently-reading" | "read" | "want-to-read"
  rating: number | null
}

interface HardcoverResponse {
  data: {
    users: Array<{
      id: number
      user_books: Array<{
        status_id: number
        rating: number | null
        book: {
          title: string
          image: { url: string } | null
          contributions: Array<{
            author: {
              name: string
            }
          }>
        }
      }>
    }>
  }
}

const STATUS_MAP: Record<number, HardcoverBook["status"]> = {
  1: "want-to-read",
  2: "currently-reading",
  3: "read",
}

const QUERY = `
  query GetUserBooks($username: citext!) {
    users(where: { username: { _eq: $username } }) {
      id
      user_books(
        where: { status_id: { _in: [1, 2, 3] } }
        order_by: { updated_at: desc }
        limit: 20
      ) {
        status_id
        rating
        book {
          title
          image {
            url
          }
          contributions {
            author {
              name
            }
          }
        }
      }
    }
  }
`

export async function fetchReadingList(): Promise<HardcoverBook[]> {
  // Check cache first
  const cached = await getCachedBooks<HardcoverBook[]>()
  if (cached) return cached

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (process.env.HARDCOVER_API_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.HARDCOVER_API_TOKEN}`
    }

    const response = await fetch(HARDCOVER_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: QUERY,
        variables: { username: HARDCOVER_USERNAME },
      }),
    })

    if (!response.ok) {
      console.error("[v0] Hardcover API error:", response.status)
      return getFallbackBooks()
    }

    const json = (await response.json()) as HardcoverResponse

    if (!json.data?.users?.[0]?.user_books) {
      console.error("[v0] No user_books found in Hardcover response")
      return getFallbackBooks()
    }

    const books: HardcoverBook[] = json.data.users[0].user_books.map((ub) => ({
      title: ub.book.title,
      author: ub.book.contributions?.[0]?.author?.name ?? "Unknown Author",
      coverUrl: ub.book.image?.url ?? null,
      status: STATUS_MAP[ub.status_id] ?? "want-to-read",
      rating: ub.rating,
    }))

    // Cache the results
    await setCachedBooks(books)

    return books
  } catch (error) {
    console.error("[v0] Failed to fetch Hardcover reading list:", error)
    return getFallbackBooks()
  }
}

function getFallbackBooks(): HardcoverBook[] {
  return [
    { title: "Neuromancer", author: "William Gibson", coverUrl: null, status: "currently-reading", rating: null },
    { title: "Snow Crash", author: "Neal Stephenson", coverUrl: null, status: "read", rating: 5 },
    { title: "Dune", author: "Frank Herbert", coverUrl: null, status: "read", rating: 5 },
    { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", coverUrl: null, status: "read", rating: 4 },
    { title: "Hyperion", author: "Dan Simmons", coverUrl: null, status: "want-to-read", rating: null },
    { title: "The Three-Body Problem", author: "Liu Cixin", coverUrl: null, status: "want-to-read", rating: null },
  ]
}
