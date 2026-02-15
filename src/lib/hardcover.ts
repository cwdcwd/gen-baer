import { getCachedBooks, setCachedBooks } from "./redis"
import {
  HARDCOVER_CONFIG,
  HARDCOVER_STATUS_MAP,
  HARDCOVER_STATUS_IDS,
  BOOK_STATUS,
  BookStatus,
  ENV_KEYS,
  CONTENT_TYPE,
  HTTP_HEADERS,
} from "./constants"

export interface HardcoverBook {
  title: string
  author: string
  coverUrl: string | null
  status: BookStatus
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

const QUERY = `
  query GetUserBooks($username: citext!) {
    users(where: { username: { _eq: $username } }) {
      id
      user_books(
        where: { status_id: { _in: [${HARDCOVER_STATUS_IDS.WANT_TO_READ}, ${HARDCOVER_STATUS_IDS.CURRENTLY_READING}, ${HARDCOVER_STATUS_IDS.READ}] } }
        order_by: { updated_at: desc }
        limit: ${HARDCOVER_CONFIG.MAX_BOOKS_FETCH}
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
    const apiToken = process.env[ENV_KEYS.HARDCOVER_API_TOKEN]
    if (!apiToken) {
      // Without a Hardcover API token, use fallback books
      return getFallbackBooks()
    }

    const response = await fetch(HARDCOVER_CONFIG.API_URL, {
      method: "POST",
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPE.JSON,
        [HTTP_HEADERS.AUTHORIZATION_CAPS]: apiToken,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: HARDCOVER_CONFIG.DEFAULT_USERNAME },
      }),
    })

    if (!response.ok) {
      // API returned an error, fall back gracefully
      return getFallbackBooks()
    }

    const json = (await response.json()) as HardcoverResponse

    if (!json.data?.users?.[0]?.user_books) {
      // No user data in response
      return getFallbackBooks()
    }

    const books: HardcoverBook[] = json.data.users[0].user_books.map((ub) => ({
      title: ub.book.title,
      author: ub.book.contributions?.[0]?.author?.name ?? "Unknown Author",
      coverUrl: ub.book.image?.url ?? null,
      status: HARDCOVER_STATUS_MAP[ub.status_id] ?? BOOK_STATUS.WANT_TO_READ,
      rating: ub.rating,
    }))

    // Cache the results
    await setCachedBooks(books)

    return books
  } catch (error) {
    // Fetch failed, use fallback
    return getFallbackBooks()
  }
}

function getFallbackBooks(): HardcoverBook[] {
  return [
    { title: "Neuromancer", author: "William Gibson", coverUrl: null, status: BOOK_STATUS.CURRENTLY_READING, rating: null },
    { title: "Snow Crash", author: "Neal Stephenson", coverUrl: null, status: BOOK_STATUS.READ, rating: 5 },
    { title: "Dune", author: "Frank Herbert", coverUrl: null, status: BOOK_STATUS.READ, rating: 5 },
    { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", coverUrl: null, status: BOOK_STATUS.READ, rating: 4 },
    { title: "Hyperion", author: "Dan Simmons", coverUrl: null, status: BOOK_STATUS.WANT_TO_READ, rating: null },
    { title: "The Three-Body Problem", author: "Liu Cixin", coverUrl: null, status: BOOK_STATUS.WANT_TO_READ, rating: null },
  ]
}
