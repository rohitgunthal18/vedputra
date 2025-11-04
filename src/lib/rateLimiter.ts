/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar distributed store
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request should be rate limited
   * @param key Unique identifier (e.g., IP address)
   * @param maxAttempts Maximum attempts allowed
   * @param windowMs Time window in milliseconds
   * @returns true if rate limited, false otherwise
   */
  check(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      // First attempt
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (now > entry.resetTime) {
      // Reset window
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (entry.count >= maxAttempts) {
      // Rate limited
      return true;
    }

    // Increment count
    entry.count++;
    return false;
  }

  /**
   * Get remaining attempts
   */
  getRemaining(key: string, maxAttempts: number = 5): number {
    const entry = this.store.get(key);
    if (!entry) return maxAttempts;
    return Math.max(0, maxAttempts - entry.count);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter (cleanup)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

