export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const baseUrl = searchParams.get('baseUrl')
  const username = searchParams.get('username')
  const password = searchParams.get('password')

  if (!baseUrl) {
    return Response.json(
      { error: 'Missing baseUrl parameter' },
      { status: 400 }
    )
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  
  if (username && password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
  }

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch models from Ollama' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: `Failed to connect to Ollama: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
