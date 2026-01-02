/**
 * Zod schemas for runtime validation
 * Used at API boundaries to validate incoming data
 */

import { z } from 'zod';

// ============================================================================
// Primitive Schemas
// ============================================================================

export const emailSchema = z.string().email('Invalid email address');
export const urlSchema = z.string()
  .url('Invalid URL')
  .max(2048, 'URL too long')
  .refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    'URL must start with http:// or https://'
  )
  .or(z.literal(''));
export const priceSchema = z.number().nonnegative('Price cannot be negative');
export const quantitySchema = z.number().int().positive('Quantity must be at least 1');

// ============================================================================
// Enum Schemas
// ============================================================================

export const listVisibilitySchema = z.enum(['private', 'shared', 'public']);
export const itemPrioritySchema = z.enum(['low', 'medium', 'high', 'must_have']);
export const claimStatusSchema = z.enum(['claimed', 'purchased', 'gifted']);

// ============================================================================
// List Schemas
// ============================================================================

export const createListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  emoji: z.string().max(10).optional(),
  visibility: listVisibilitySchema.optional().default('private'),
  eventDate: z.string().datetime().optional(),
});

export const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
  visibility: listVisibilitySchema.optional(),
  eventDate: z.string().datetime().nullable().optional(),
});

// ============================================================================
// Item Schemas
// ============================================================================

export const createItemSchema = z.object({
  listId: z.string().min(1, 'List ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  url: urlSchema.optional(),
  imageUrl: urlSchema.optional(),
  currentPrice: priceSchema.optional(),
  originalPrice: priceSchema.optional(),
  currency: z.string().length(3).default('USD'),
  priority: itemPrioritySchema.optional().default('medium'),
  quantity: quantitySchema.optional().default(1),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  url: urlSchema.nullable().optional(),
  imageUrl: urlSchema.nullable().optional(),
  currentPrice: priceSchema.nullable().optional(),
  originalPrice: priceSchema.nullable().optional(),
  priority: itemPrioritySchema.optional(),
  quantity: quantitySchema.optional(),
  notes: z.string().max(500).nullable().optional(),
  position: z.number().int().min(0).optional(),
});

// ============================================================================
// Claim Schemas
// ============================================================================

export const createClaimSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: quantitySchema.optional().default(1),
  isAnonymous: z.boolean().optional().default(false),
});

export const updateClaimSchema = z.object({
  status: claimStatusSchema.optional(),
  quantity: quantitySchema.optional(),
});

// ============================================================================
// Auth Schemas
// ============================================================================

export const signUpSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(50).optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(50, 'Name must be 50 characters or less').optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
