/**
 * Simple in-memory cache
 * Reduces redundant extractions for the same URL
 */

const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get cached result if available and not expired
 */
export function getCached(key) {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Store result in cache
 */
export function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Cleanup old entries (keep max 100 entries)
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

/**
 * Clear all cache
 */
export function clearCache() {
  cache.clear();
}
