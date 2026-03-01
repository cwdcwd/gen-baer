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
  lastReadDate: string | null
}

interface HardcoverResponse {
  data: {
    users: Array<{
      id: number
      user_books: Array<{
        status_id: number
        rating: number | null
        last_read_date: string | null
        edition: {
          image: { url: string } | null
        } | null
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
        last_read_date
        edition {
          image {
            url
          }
        }
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
    
    // Build headers - API token is optional for public data
    const headers: Record<string, string> = {
      [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPE.JSON,
    }
    
    // Include authorization header if token is provided
    // Hardcover requires "Bearer " prefix for JWT tokens
    if (apiToken) {
      headers[HTTP_HEADERS.AUTHORIZATION] = `Bearer ${apiToken}`
    }

    const response = await fetch(HARDCOVER_CONFIG.API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: QUERY,
        variables: { username: HARDCOVER_CONFIG.DEFAULT_USERNAME },
      }),
    })

    if (!response.ok) {
      // API returned an error, return empty list
      return []
    }

    const json = (await response.json()) as HardcoverResponse

    if (!json.data?.users?.[0]?.user_books) {
      // No user data in response
      return []
    }

    const books: HardcoverBook[] = json.data.users[0].user_books.map((ub) => ({
      title: ub.book.title,
      author: ub.book.contributions?.[0]?.author?.name ?? "Unknown Author",
      coverUrl: ub.edition?.image?.url ?? ub.book.image?.url ?? null,
      status: HARDCOVER_STATUS_MAP[ub.status_id] ?? BOOK_STATUS.WANT_TO_READ,
      rating: ub.rating,
      lastReadDate: ub.last_read_date,
    }))

    // Cache the results
    await setCachedBooks(books)

    return books
  } catch (error) {
    console.error('[Hardcover] Error fetching reading list:', error)
    // Fetch failed, return empty list
    return []
  }
}
