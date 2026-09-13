import { openaiResponse } from './openai.mjs'
import { geminiResponse } from './gemini.mjs'
import { allamaResponse } from './allama.mjs'

export async function aiResponse(env, body) {
  const preferred = (env.PREFERRED_AI_PROVIDER || '').toLowerCase()
  if (preferred === 'allama' && env.ALLAMA_API_KEY) return allamaResponse(env, body)
  if (preferred === 'gemini' && env.GEMINI_API_KEY) return geminiResponse(env, body)
  if (preferred === 'openai' && env.OPENAI_API_KEY) return openaiResponse(env, body)
  // fallback: prefer OpenAI, then Allama, then Gemini
  if (env.OPENAI_API_KEY) return openaiResponse(env, body)
  if (env.ALLAMA_API_KEY) return allamaResponse(env, body)
  if (env.GEMINI_API_KEY) return geminiResponse(env, body)
  throw new Error('No AI provider configured. Set OPENAI_API_KEY, ALLAMA_API_KEY or GEMINI_API_KEY on the server.')
}

export default aiResponse
