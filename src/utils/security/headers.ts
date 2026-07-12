// Security Headers Configuration
export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'X-XSS-Protection': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
}

export const getSecurityHeaders = (environment: 'development' | 'production' = 'production'): SecurityHeaders => {
  const isDev = environment === 'development';
  
  return {
    // Content Security Policy - Strict but functional for manga reader
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:", // Allow external images for manga pages
      "media-src 'self' blob:",
      "connect-src 'self' https://eslcxgomsaizesekdvcc.supabase.co wss://eslcxgomsaizesekdvcc.supabase.co",
      "frame-src 'self' https://www.google.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      isDev ? "frame-ancestors 'self'" : "frame-ancestors 'none'"
    ].join('; '),

    // HTTP Strict Transport Security - 1 year, include subdomains
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Prevent clickjacking
    'X-Frame-Options': isDev ? 'SAMEORIGIN' : 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer policy - strict for privacy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy - restrict potentially dangerous features
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

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Cross-Origin Embedder Policy
    'Cross-Origin-Embedder-Policy': 'credentialless',

    // Cross-Origin Opener Policy
    'Cross-Origin-Opener-Policy': 'same-origin'
  };
};

// Apply security headers to document
export const applySecurityHeaders = (environment?: 'development' | 'production') => {
  if (typeof document === 'undefined') return;

  const headers = getSecurityHeaders(environment);
  
  // Set meta tags for headers that can be set via HTML
  const metaTags = [
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
    { 'http-equiv': 'Content-Security-Policy', content: headers['Content-Security-Policy'] },
    { 'http-equiv': 'X-Content-Type-Options', content: headers['X-Content-Type-Options'] },
    { 'http-equiv': 'X-Frame-Options', content: headers['X-Frame-Options'] }
  ];

  metaTags.forEach(tag => {
    const existingTag = document.querySelector(`meta[${Object.keys(tag)[0]}="${Object.values(tag)[0]}"]`);
    if (!existingTag) {
      const meta = document.createElement('meta');
      Object.entries(tag).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      document.head.appendChild(meta);
    }
  });
};