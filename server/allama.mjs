function defaultUrl(env) {
  return env.ALLAMA_API_URL || 'https://api.allama.ai/v1/generate'
}

export async function allamaResponse(env, body) {
  const url = defaultUrl(env)
  const key = env.ALLAMA_API_KEY
  if (!key) throw new Error('Allama API key not configured')

  const payload = { model: env.ALLAMA_MODEL || 'allama-base', input: body.input || body }

  const headers = { 'Content-Type': 'application/json' }
  const authType = (env.ALLAMA_AUTH_TYPE || '').toLowerCase()
  let targetUrl = url
  if (authType === 'api_key') {
    const sep = url.includes('?') ? '&' : '?'
    targetUrl = `${url}${sep}key=${encodeURIComponent(key)}`
  } else {
    headers.Authorization = `Bearer ${key}`
  }

  const response = await fetch(targetUrl, { method: 'POST', headers, signal: AbortSignal.timeout(60000), body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Allama authentication failed.' : 'Allama could not complete the request.')
  const data = await response.json()
  const text = (data.output_text || data.text || (Array.isArray(data.outputs) && data.outputs.map(o => o.text).join('\n')) || '').trim()
  if (!text) throw new Error('Allama returned an empty response.')
  return { text, output: data }
}

export default allamaResponse
