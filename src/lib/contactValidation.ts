import { z } from 'zod';

// Contact form validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  phone: z
    .string()
    .max(50, { message: 'Phone must be less than 50 characters' })
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(200, { message: 'Company name must be less than 200 characters' })
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(2000, { message: 'Message must be less than 2000 characters' }),
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
  if (error?.message?.includes('rate limit')) return 'Too many requests. Please wait a moment.';
  
  return 'An error occurred. Please try again later.';
}
