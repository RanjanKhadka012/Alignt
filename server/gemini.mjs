function defaultUrl(env) {
  return env.GEMINI_API_URL || 'https://api.gemini.example/v1/generate'
}

export async function geminiResponse(env, body) {
  const url = defaultUrl(env)
  const key = env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key not configured')

  const payload = {
    model: env.GEMINI_MODEL || 'gemini-pro',
    input: body.input || body,
    parameters: body.parameters || {},
    // keep store false-equivalent behaviour
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Gemini authentication failed.' : 'Gemini could not complete the request.')
  const data = await response.json()

  // Normalize to { text, output }
  // Gemini responses vary; try common fields then fallback
  const text = (data.output_text || data.text || (Array.isArray(data.outputs) && data.outputs.map(o => o.text).join('\n')) || '').trim()
  if (!text) throw new Error('Gemini returned an empty response.')
  return { text, output: data }
}

export default geminiResponse
