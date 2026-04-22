export async function POST(request: Request) {
  const body = await request.json()
  const { baseUrl, model, messages, stream = true, username, password } = body

  if (!baseUrl || !model) {
    return Response.json(
      { error: 'Missing baseUrl or model' },
      { status: 400 }
    )
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  
  if (username && password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    headers['Authorization'] = `Basic ${credentials}`
  }

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        stream
      })
    })

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to get response from Ollama' },
        { status: response.status }
      )
    }

    if (!stream) {
      const data = await response.json()
      return Response.json(data)
    }

    // For streaming, we need to forward the stream directly
    // Create a ReadableStream that pipes the response
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    // Read from Ollama and write to our response
    response.body?.pipeTo(writable).catch(err => {
      console.error('Stream pipe error:', err)
      writer.close()
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked'
      }
    })
  } catch (error) {
    return Response.json(
      { error: `Failed to connect to Ollama: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
