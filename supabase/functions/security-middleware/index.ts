import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security headers configuration
const getSecurityHeaders = (environment: 'development' | 'production' = 'production') => {
  const isDev = environment === 'development';
  
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob:",
      "connect-src 'self' https://eslcxgomsaizesekdvcc.supabase.co wss://eslcxgomsaizesekdvcc.supabase.co",
      "frame-src 'self' https://www.google.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      isDev ? "frame-ancestors 'self'" : "frame-ancestors 'none'"
    ].join('; '),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Frame-Options': isDev ? 'SAMEORIGIN' : 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
      'fullscreen=(self)',
      'autoplay=(self)'
    ].join(', '),
    'X-XSS-Protection': '1; mode=block',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
};

// Rate limiting configuration
const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  signup: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  comments: { windowMs: 60 * 1000, maxRequests: 10 },
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 20 },
  api_general: { windowMs: 60 * 1000, maxRequests: 100 },
  api_heavy: { windowMs: 60 * 1000, maxRequests: 10 }
};

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string, endpoint: string, userId?: string): string {
  return `${endpoint}:${userId || ip}`;
}

function checkRateLimit(ip: string, endpoint: string, userId?: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
} {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.api_general;
  const key = getRateLimitKey(ip, endpoint, userId);
  const now = Date.now();
  const resetTime = now + config.windowMs;
  
  const existing = rateLimitStore.get(key);
  
  // Clean up expired entries
  if (existing && now > existing.resetTime) {
    rateLimitStore.delete(key);
  }
  
  const entry = rateLimitStore.get(key);
  if (!entry) {
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
      totalRequests: 1
    };
  }
  
  const newCount = entry.count + 1;
  rateLimitStore.set(key, { count: newCount, resetTime: entry.resetTime });
  
  return {
    allowed: newCount <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - newCount),
    resetTime: entry.resetTime,
    totalRequests: newCount
  };
}

// Input validation and sanitization
function validateInput(input: string): { isValid: boolean; sanitized: string; threats: string[] } {
  const threats: string[] = [];
  let sanitized = input;
  
  // SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /('|"|;|--|\||\*)/,
    /(\b(OR|AND)\b.*=.*)/i
  ];
  
  // XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];
  
  // Check for threats
  if (sqlPatterns.some(pattern => pattern.test(input))) {
    threats.push('SQL Injection');
  }
  
  if (xssPatterns.some(pattern => pattern.test(input))) {
    threats.push('XSS Attack');
  }
  
  if (input.includes('../') || input.includes('..\\')) {
    threats.push('Path Traversal');
  }
  
  if (/[;&|`]/.test(input)) {
    threats.push('Command Injection');
  }
  
  // Basic sanitization
  sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return {
    isValid: threats.length === 0,
    sanitized,
    threats
  };
}

// Log security events
async function logSecurityEvent(
  supabase: any,
  eventType: string,
  details: any,
  userId?: string,
  ip?: string
) {
  try {
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'security_event',
        admin_user_id: userId || '00000000-0000-0000-0000-000000000000',
        description: `Security event: ${eventType}`,
        metadata: {
          event_type: eventType,
          ip_address: ip,
          details,
          timestamp: new Date().toISOString()
        }
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

serve(async (req) => {
  const url = new URL(req.url);
  const method = req.method;
  
  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // Get client info
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const authHeader = req.headers.get('authorization');
    
    // Extract user ID if authenticated
    let userId: string | undefined;
    if (authHeader) {
      try {
        const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = data.user?.id;
      } catch (error) {
        console.log('Auth extraction failed:', error);
      }
    }
    
    const endpoint = url.pathname.split('/').pop() || 'api_general';
    
    // Apply rate limiting
    const rateLimitResult = checkRateLimit(clientIP, endpoint, userId);
    
    if (!rateLimitResult.allowed) {
      await logSecurityEvent(
        supabase,
        'rate_limit_exceeded',
        { endpoint, ip: clientIP, requests: rateLimitResult.totalRequests },
        userId,
        clientIP
      );
      
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMITS.api_general.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // Handle different endpoints
    if (url.pathname === '/security-middleware/validate') {
      const body = await req.json();
      const { input } = body;
      
      if (!input || typeof input !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid input' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const validation = validateInput(input);
      
      if (!validation.isValid) {
        await logSecurityEvent(
          supabase,
          'malicious_input_detected',
          { input, threats: validation.threats },
          userId,
          clientIP
        );
      }
      
      return new Response(
        JSON.stringify(validation),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            ...getSecurityHeaders(),
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      );
    }
    
    if (url.pathname === '/security-middleware/headers') {
      return new Response(
        JSON.stringify(getSecurityHeaders()),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            ...getSecurityHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    if (url.pathname === '/security-middleware/status') {
      // Clean up expired rate limit entries
      const now = Date.now();
      for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
          rateLimitStore.delete(key);
        }
      }
      
      return new Response(
        JSON.stringify({
          rateLimitEntries: rateLimitStore.size,
          timestamp: new Date().toISOString(),
          environment: Deno.env.get('ENVIRONMENT') || 'production'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            ...getSecurityHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Security middleware active',
        endpoints: ['/validate', '/headers', '/status']
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...getSecurityHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Security middleware error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          ...getSecurityHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
  }
});