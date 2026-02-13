export const maxDuration = 60

export async function POST(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret) {
    return Response.json({ error: "ADMIN_SECRET not configured" }, { status: 500 })
  }

  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${adminSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))

  // Forward to generate-theme endpoint
  const url = new URL("/api/generate-theme", req.url)
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminSecret}`,
    },
    body: JSON.stringify({ theme: body.theme }),
  })

  const result = await response.json()
  return Response.json(result, { status: response.status })
}
