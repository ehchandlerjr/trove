/**
 * Simple In-Memory Rate Limiter
 * 
 * Implements token bucket algorithm for rate limiting.
 * For production, consider Redis-based rate limiting.
 * 
 * Usage:
 * const limiter = rateLimit({ interval: 60000, limit: 10 });
 * if (!limiter.check(userId)) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 */

interface RateLimitConfig {
  /** Time window in milliseconds */
  interval: number;
  /** Maximum requests per interval */
  limit: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global store for rate limit entries
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Creates a rate limiter instance
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, limit } = config;

  return {
    /**
     * Check if request is allowed and consume a token
     * @param key - Unique identifier (user ID, IP, etc.)
     * @returns true if allowed, false if rate limited
     */
    check(key: string): boolean {
      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || entry.resetAt < now) {
        // First request or window expired - reset
        rateLimitStore.set(key, {
          count: 1,
          resetAt: now + interval,
        });
        return true;
      }

      if (entry.count >= limit) {
        // Rate limit exceeded
        return false;
      }

      // Increment count
      entry.count++;
      return true;
    },

    /**
     * Get remaining requests for a key
     */
    remaining(key: string): number {
      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || entry.resetAt < now) {
        return limit;
      }

      return Math.max(0, limit - entry.count);
    },

    /**
     * Get time until rate limit resets (in seconds)
     */
    resetIn(key: string): number {
      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || entry.resetAt < now) {
        return 0;
      }

      return Math.ceil((entry.resetAt - now) / 1000);
    },
  };
}

/**
 * Pre-configured rate limiters for different API routes
 */
export const rateLimiters = {
  /** For URL parsing - 30 requests per minute */
  parseUrl: rateLimit({ interval: 60 * 1000, limit: 30 }),
  
  /** For item creation - 60 requests per minute */
  items: rateLimit({ interval: 60 * 1000, limit: 60 }),
  
  /** For site mappings - 30 requests per minute */
  siteMappings: rateLimit({ interval: 60 * 1000, limit: 30 }),
  
  /** For proxy page - 20 requests per minute */
  proxyPage: rateLimit({ interval: 60 * 1000, limit: 20 }),
};

/**
 * Helper to create rate limit error response
 */
export function rateLimitResponse(limiter: ReturnType<typeof rateLimit>, key: string) {
  const resetIn = limiter.resetIn(key);
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${resetIn} seconds.`,
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(resetIn),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + resetIn),
      },
    }
  );
}

export default rateLimit;
