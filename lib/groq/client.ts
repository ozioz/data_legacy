import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable')
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * Legacy model constant for backward compatibility
 * @deprecated Use SMART_MODEL or FAST_MODEL from '@/lib/groq/models' instead
 */
export const GROQ_MODEL = 'llama3-8b-8192'

// Re-export model constants for convenience
export { SMART_MODEL, FAST_MODEL, AUDIO_MODEL, LEGACY_MODEL } from './models'

