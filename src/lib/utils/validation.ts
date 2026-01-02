/**
 * Form validation utilities using Zod schemas
 * Provides client-side validation with field-level error messages
 */

import { z } from 'zod';

export type FieldErrors = Record<string, string>;

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: FieldErrors;
}

/**
 * Validate form data against a Zod schema
 * Returns either validated data or field-level error messages
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Convert Zod errors to field-level error messages
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}

/**
 * Get first error message from validation result
 * Useful for displaying a single error banner
 */
export function getFirstError(errors: FieldErrors): string | undefined {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : undefined;
}

/**
 * Format Zod error for display
 * Handles edge cases like nested paths
 */
export function formatFieldName(path: string): string {
  return path
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
