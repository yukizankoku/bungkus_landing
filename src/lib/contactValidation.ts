import { z } from 'zod';
import DOMPurify from 'dompurify';

// Blocked patterns for security (SQL injection, XSS, etc.)
const BLOCKED_PATTERNS = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i,  // onclick=, onload=, etc.
  /SELECT\s+.*\s+FROM/i,
  /INSERT\s+INTO/i,
  /UPDATE\s+.*\s+SET/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /--\s*$/,
  /;\s*DROP/i,
  /UNION\s+SELECT/i,
  /<iframe/i,
  /<embed/i,
  /<object/i,
];

// Check if text contains blocked patterns
function containsBlockedPatterns(text: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

// Sanitize and validate text input
function sanitizeText(text: string): string {
  // Use DOMPurify to strip all HTML
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }).trim();
}

// Indonesian phone number regex (supports various formats)
const PHONE_REGEX = /^(\+62|62|0)?[1-9][0-9]{7,12}$/;

// Contact form validation schema with enhanced security
export const contactSchema = z.object({
  name: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z.string()
        .min(2, { message: 'Name must be at least 2 characters' })
        .max(100, { message: 'Name must be less than 100 characters' })
        .refine(val => !containsBlockedPatterns(val), { 
          message: 'Invalid characters detected in name' 
        })
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' })
    .refine(val => !containsBlockedPatterns(val), { 
      message: 'Invalid email format' 
    }),
  phone: z
    .string()
    .transform(val => val.replace(/[\s\-\(\)]/g, '')) // Remove spaces, dashes, parentheses
    .pipe(
      z.string()
        .max(20, { message: 'Phone must be less than 20 characters' })
        .refine(val => val === '' || PHONE_REGEX.test(val), {
          message: 'Please enter a valid phone number (e.g., 08123456789 or +628123456789)'
        })
    )
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z.string()
        .max(200, { message: 'Company name must be less than 200 characters' })
        .refine(val => !containsBlockedPatterns(val), { 
          message: 'Invalid characters detected in company name' 
        })
    )
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z.string()
        .max(2000, { message: 'Message must be less than 2000 characters' })
        .refine(val => !containsBlockedPatterns(val), { 
          message: 'Invalid content detected in message' 
        })
    )
    .optional()
    .or(z.literal('')),
});

// Schema for when message is required
export const contactSchemaWithMessage = contactSchema.extend({
  message: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z.string()
        .min(10, { message: 'Message must be at least 10 characters' })
        .max(2000, { message: 'Message must be less than 2000 characters' })
        .refine(val => !containsBlockedPatterns(val), { 
          message: 'Invalid content detected in message' 
        })
    ),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Map database errors to user-friendly messages
export function mapDatabaseError(error: any): string {
  // Log full error for debugging (in development only)
  if (import.meta.env.DEV) {
    console.error('Database error:', error);
  }

  // Return generic user-friendly messages
  if (error?.code === '23505') return 'This submission already exists.';
  if (error?.code === '23503') return 'Invalid reference. Please try again.';
  if (error?.code === '42501' || error?.message?.includes('RLS')) {
    return 'Access denied. Please try again.';
  }
  if (error?.code === 'PGRST301') return 'Session expired. Please refresh the page.';
  if (error?.code === 'P0001' || error?.message?.includes('rate limit')) {
    return 'Too many submissions. Please wait 5 minutes before trying again.';
  }
  
  // Validation errors from database triggers
  if (error?.code === 'P0002') return 'Please enter a valid name (2-100 characters).';
  if (error?.code === 'P0003') return 'Please enter a valid email address.';
  if (error?.code === 'P0004') return 'Please enter a valid message (10-2000 characters).';
  if (error?.code === 'P0005') return 'Please check your phone or company field.';
  
  return 'An error occurred. Please try again later.';
}
