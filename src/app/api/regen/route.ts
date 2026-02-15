import {
  AI_CONFIG,
  ENV_KEYS,
  HTTP_STATUS,
  HTTP_HEADERS,
  AUTH_SCHEME,
  ERROR_MESSAGES,
  API_RESPONSE_FIELDS,
  CONTENT_TYPE,
} from "@/lib/constants"

// Next.js route segment config requires literal values
export const maxDuration = 60

export async function POST(req: Request) {
  const adminSecret = process.env[ENV_KEYS.ADMIN_SECRET]

  if (!adminSecret) {
    return Response.json(
      { [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.ADMIN_SECRET_NOT_CONFIGURED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }

  const authHeader = req.headers.get(HTTP_HEADERS.AUTHORIZATION)
  if (authHeader !== `${AUTH_SCHEME.BEARER_PREFIX}${adminSecret}`) {
    return Response.json(
      { [API_RESPONSE_FIELDS.ERROR]: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const body = await req.json().catch(() => ({}))

  // Forward to generate-theme endpoint
  const url = new URL("/api/generate-theme", req.url)
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPE.JSON,
      [HTTP_HEADERS.AUTHORIZATION_CAPS]: `${AUTH_SCHEME.BEARER_PREFIX}${adminSecret}`,
    },
    body: JSON.stringify({ theme: body.theme }),
  })

  const result = await response.json()
  return Response.json(result, { status: response.status })
}
