// Input Validation and Sanitization System
import DOMPurify from 'dompurify';

// Validation schemas
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  allowedTags?: string[];
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  url: /^https?:\/\/.+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  slug: /^[a-z0-9-]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  noHtml: /^[^<>]*$/,
  safeText: /^[\w\s.,!?\-()'"']+$/
};

// Validation schemas for different data types
export const VALIDATION_SCHEMAS: Record<string, ValidationSchema> = {
  userProfile: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: VALIDATION_PATTERNS.username,
      sanitize: true
    },
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.email,
      sanitize: true
    },
    bio: {
      maxLength: 500,
      sanitize: true,
      allowedTags: ['p', 'br', 'strong', 'em']
    }
  },
  comment: {
    content: {
      required: true,
      minLength: 1,
      maxLength: 2000,
      sanitize: true,
      allowedTags: ['p', 'br', 'strong', 'em', 'a']
    }
  },
  chapterData: {
    title: {
      required: true,
      minLength: 1,
      maxLength: 200,
      sanitize: true
    },
    seo_title: {
      maxLength: 60,
      sanitize: true
    },
    seo_description: {
      maxLength: 160,
      sanitize: true
    }
  },
  siteSettings: {
    site_title: {
      required: true,
      minLength: 1,
      maxLength: 100,
      sanitize: true
    },
    theme_color: {
      pattern: VALIDATION_PATTERNS.hexColor
    },
    custom_css: {
      maxLength: 50000,
      sanitize: false // CSS needs special handling
    }
  }
};

// Sanitization options
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title', 'target'],
  KEEP_CONTENT: true,
  ALLOW_DATA_ATTR: false
};

// Core validation functions
export class SecurityValidator {
  
  static sanitizeHtml(input: string, allowedTags?: string[]): string {
    if (!input || typeof input !== 'string') return '';
    
    const config = {
      ...SANITIZE_CONFIG,
      ALLOWED_TAGS: allowedTags || SANITIZE_CONFIG.ALLOWED_TAGS
    };
    
    return DOMPurify.sanitize(input, config);
  }

  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove remaining angle brackets
      .trim();
  }

  static validateField(value: any, rule: ValidationRule): { isValid: boolean; error?: string; sanitizedValue?: any } {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return { isValid: false, error: 'This field is required' };
    }

    if (!value && !rule.required) {
      return { isValid: true, sanitizedValue: value };
    }

    const stringValue = value?.toString() || '';

    // Length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return { isValid: false, error: `Minimum length is ${rule.minLength} characters` };
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return { isValid: false, error: `Maximum length is ${rule.maxLength} characters` };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return { isValid: false, error: 'Invalid format' };
    }

    // Sanitization
    let sanitizedValue = stringValue;
    if (rule.sanitize) {
      if (rule.allowedTags) {
        sanitizedValue = this.sanitizeHtml(stringValue, rule.allowedTags);
      } else {
        sanitizedValue = this.sanitizeText(stringValue);
      }
    }

    return { isValid: true, sanitizedValue };
  }

  static validateObject(data: Record<string, any>, schema: ValidationSchema): {
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: Record<string, any>;
  } {
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const result = this.validateField(data[field], rule);
      
      if (!result.isValid && result.error) {
        errors[field] = result.error;
      }
      
      sanitizedData[field] = result.sanitizedValue;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  // Specific validation methods
  static validateComment(content: string): { isValid: boolean; sanitizedContent: string; error?: string } {
    const result = this.validateField(content, VALIDATION_SCHEMAS.comment.content);
    
    return {
      isValid: result.isValid,
      sanitizedContent: result.sanitizedValue || '',
      error: result.error
    };
  }

  static validateUserProfile(profileData: any): {
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: Record<string, any>;
  } {
    return this.validateObject(profileData, VALIDATION_SCHEMAS.userProfile);
  }

  // SQL injection prevention
  static preventSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /('|"|;|--|\||\*)/,
      /(\b(OR|AND)\b.*=.*)/i
    ];

    return !sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS prevention
  static preventXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
    ];

    return !xssPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive security check
  static isSecureInput(input: string): { isSecure: boolean; threats: string[] } {
    const threats: string[] = [];

    if (!this.preventSqlInjection(input)) {
      threats.push('SQL Injection');
    }

    if (!this.preventXSS(input)) {
      threats.push('XSS Attack');
    }

    // Check for path traversal
    if (input.includes('../') || input.includes('..\\')) {
      threats.push('Path Traversal');
    }

    // Check for command injection
    if (/[;&|`]/.test(input)) {
      threats.push('Command Injection');
    }

    return {
      isSecure: threats.length === 0,
      threats
    };
  }
}

// Helper hook for React components
export const useSecureInput = () => {
  return {
    validateAndSanitize: (value: string, rule: ValidationRule) => 
      SecurityValidator.validateField(value, rule),
    sanitizeHtml: (html: string, tags?: string[]) => 
      SecurityValidator.sanitizeHtml(html, tags),
    sanitizeText: (text: string) => 
      SecurityValidator.sanitizeText(text),
    checkSecurity: (input: string) => 
      SecurityValidator.isSecureInput(input)
  };
};