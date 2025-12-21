/**
 * Hybrid Model Strategy for Data Legacy 2.0
 * 
 * We use a hybrid approach to balance Latency (Speed) vs. Reasoning (Intelligence):
 * 
 * - SMART_MODEL: For complex reasoning tasks that require high logic and context awareness
 *   (RPG scenarios, Interview simulation, Resume generation, Career coaching)
 * 
 * - FAST_MODEL: For speed-critical tasks that need near-instant responses (<200ms)
 *   (Arcade game scoring, Tower Defense upgrades, NPC chatter, Marketplace events)
 * 
 * - AUDIO_MODEL: For speech-to-text transcription tasks
 *   (Interview module speech recognition)
 */

/**
 * Smart Model - High Intelligence
 * Model: llama-3.3-70b-versatile
 * Use Cases:
 * - Complex RPG scenarios with ethical nuance
 * - AI Mock Interview (maintains persona and context)
 * - Career Coach feedback (professional and analytical)
 * - Resume generation (needs deep understanding)
 * 
 * Characteristics:
 * - High reasoning capability
 * - Better context understanding
 * - Slower response time (~500-1000ms)
 * - Higher token cost
 */
export const SMART_MODEL = 'llama-3.3-70b-versatile'

/**
 * Fast Model - Low Latency
 * Model: llama-3.1-8b-instant
 * Use Cases:
 * - Prompt Lab scoring (Visionary, Algorithm games)
 * - Tower Defense upgrade card generation
 * - NPC chatter and quick responses
 * - Marketplace event generation
 * 
 * Characteristics:
 * - Near-instant responses (<200ms)
 * - Cost-effective
 * - Good for simple logic and scoring
 * - Lower reasoning depth
 */
export const FAST_MODEL = 'llama-3.1-8b-instant'

/**
 * Audio Model - Speech Recognition
 * Model: whisper-large-v3
 * Use Cases:
 * - Speech-to-Text for AI Mock Interview
 * - Voice input transcription
 * 
 * Characteristics:
 * - High accuracy transcription
 * - Multi-language support
 * - Optimized for audio processing
 */
export const AUDIO_MODEL = 'whisper-large-v3'

/**
 * Legacy Model (for backward compatibility)
 * @deprecated Use SMART_MODEL or FAST_MODEL instead
 */
export const LEGACY_MODEL = 'llama3-8b-8192'

