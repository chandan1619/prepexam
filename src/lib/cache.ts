// Client-side cache utility for better performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ClientCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get stale data if available (for stale-while-revalidate pattern)
  getStale<T>(key: string): T | null {
    const item = this.cache.get(key);
    return item ? item.data as T : null;
  }

  // Check if data is stale but still in cache
  isStale(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    return Date.now() > item.expiresAt;
  }
}

// Singleton instance
export const clientCache = new ClientCache();

// Cache keys
export const CACHE_KEYS = {
  COURSES: 'courses',
  COURSE_DETAIL: (id: string) => `course_${id}`,
  FEATURED_BLOGS: 'featured_blogs',
  USER_ACCESS: (examId: string) => `user_access_${examId}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  COURSES: 5 * 60 * 1000, // 5 minutes
  COURSE_DETAIL: 10 * 60 * 1000, // 10 minutes
  FEATURED_BLOGS: 5 * 60 * 1000, // 5 minutes
  USER_ACCESS: 2 * 60 * 1000, // 2 minutes
} as const;

// Fetch with cache utility
export async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  ttl: number = CACHE_TTL.COURSES,
  options?: RequestInit
): Promise<T> {
  // Check cache first
  const cached = clientCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Check if we have stale data
  const staleData = clientCache.getStale<T>(cacheKey);
  
  try {
    // Fetch fresh data
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the fresh data
    clientCache.set(cacheKey, data, ttl);
    
    return data;
  } catch (error) {
    // If fetch fails and we have stale data, return it
    if (staleData) {
      console.warn('Fetch failed, returning stale data:', error);
      return staleData;
    }
    
    // Otherwise, throw the error
    throw error;
  }
}

// Clear user-specific cache when authentication state changes
export function clearUserCache() {
  // Clear all cache entries that might be user-specific
  clientCache.clear();
}

// Clear specific cache entries
export function clearCacheKey(key: string) {
  clientCache.delete(key);
}