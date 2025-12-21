/**
 * Simple in-memory cache for interview responses
 * Reduces API calls for similar questions
 */

interface CacheEntry {
  question: string
  response: string
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry>()

/**
 * Generate a cache key from conversation context
 */
function generateCacheKey(
  history: Array<{ role: string; content: string }>,
  role: string,
  level: string
): string {
  // Use last 2 messages + role + level as cache key
  const recentMessages = history.slice(-2).map((msg) => `${msg.role}:${msg.content}`).join('|')
  return `${role}-${level}-${recentMessages}`.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Get cached response if available
 */
export function getCachedResponse(
  history: Array<{ role: string; content: string }>,
  role: string,
  level: string
): string | null {
  const key = generateCacheKey(history, role, level)
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  // Check if cache is still valid
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return entry.response
}

/**
 * Cache a response
 */
export function cacheResponse(
  history: Array<{ role: string; content: string }>,
  role: string,
  level: string,
  response: string
): void {
  const key = generateCacheKey(history, role, level)
  cache.set(key, {
    question: history[history.length - 1]?.content || '',
    response,
    timestamp: Date.now(),
  })

  // Clean up old entries (keep cache size manageable)
  if (cache.size > 50) {
    const oldestKey = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0]
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear()
}

