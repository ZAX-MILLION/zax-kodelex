// Rate Limiting System
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

// Default rate limit configurations
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true
  },
  signup: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour per IP
    skipSuccessfulRequests: true
  },
  
  // Content endpoints
  comments: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 comments per minute
    skipFailedRequests: true
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour
    skipFailedRequests: true
  },
  
  // API endpoints
  api_general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  api_heavy: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 heavy operations per minute
  },
  
  // Search and reading
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
  },
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 page views per minute
  }
};

// In-memory store for rate limiting (in production, use Redis or similar)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  get(key: string): { count: number; resetTime: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return entry;
  }
  
  set(key: string, count: number, resetTime: number): void {
    this.store.set(key, { count, resetTime });
  }
  
  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.get(key);
    
    if (!existing) {
      this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }
    
    const newCount = existing.count + 1;
    this.set(key, newCount, existing.resetTime);
    return { count: newCount, resetTime: existing.resetTime };
  }
  
  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

export class RateLimiter {
  private store = new RateLimitStore();
  
  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.store.cleanup(), 5 * 60 * 1000);
  }
  
  // Get client identifier (IP + User ID if available)
  getClientId(request: { ip?: string; userId?: string; userAgent?: string }): string {
    const parts = [];
    
    if (request.userId) {
      parts.push(`user:${request.userId}`);
    }
    
    if (request.ip) {
      parts.push(`ip:${request.ip}`);
    }
    
    // Fallback to user agent hash if no IP
    if (!request.ip && request.userAgent) {
      const hash = this.simpleHash(request.userAgent);
      parts.push(`ua:${hash}`);
    }
    
    return parts.join('|') || 'unknown';
  }
  
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
  
  check(
    identifier: string, 
    endpoint: string, 
    config?: RateLimitConfig
  ): RateLimitResult {
    const limitConfig = config || RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.api_general;
    const key = `${endpoint}:${identifier}`;
    
    const { count, resetTime } = this.store.increment(key, limitConfig.windowMs);
    const allowed = count <= limitConfig.maxRequests;
    const remaining = Math.max(0, limitConfig.maxRequests - count);
    
    return {
      allowed,
      remaining,
      resetTime,
      totalRequests: count
    };
  }
  
  // Specific rate limit checks
  checkAuth(identifier: string, endpoint: 'login' | 'signup'): RateLimitResult {
    return this.check(identifier, endpoint);
  }
  
  checkComment(identifier: string): RateLimitResult {
    return this.check(identifier, 'comments');
  }
  
  checkUpload(identifier: string): RateLimitResult {
    return this.check(identifier, 'upload');
  }
  
  checkAPI(identifier: string, isHeavy: boolean = false): RateLimitResult {
    return this.check(identifier, isHeavy ? 'api_heavy' : 'api_general');
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// React hook for client-side rate limiting
export const useRateLimit = () => {
  const checkRateLimit = (endpoint: string, config?: RateLimitConfig) => {
    // Get client info
    const clientInfo = {
      ip: undefined, // Will be set by server
      userId: undefined, // Will be set if authenticated
      userAgent: navigator.userAgent
    };
    
    const identifier = globalRateLimiter.getClientId(clientInfo);
    return globalRateLimiter.check(identifier, endpoint, config);
  };
  
  return { checkRateLimit };
};

// Utility functions for handling rate limit responses
export const createRateLimitResponse = (result: RateLimitResult, message?: string) => {
  if (result.allowed) {
    return {
      success: true,
      remaining: result.remaining,
      resetTime: result.resetTime
    };
  }
  
  const defaultMessage = `Rate limit exceeded. Try again after ${new Date(result.resetTime).toLocaleTimeString()}`;
  
  return {
    success: false,
    error: message || defaultMessage,
    remaining: result.remaining,
    resetTime: result.resetTime,
    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
  };
};

// Headers for rate limit information
export const getRateLimitHeaders = (result: RateLimitResult) => {
  return {
    'X-RateLimit-Limit': result.totalRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
    'Retry-After': result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  };
};