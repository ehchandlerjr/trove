/**
 * Core type definitions for Trove
 * 
 * Design principles:
 * - Branded IDs prevent mixing different entity IDs
 * - Result types make error handling explicit
 * - All types are serializable for client/server boundary
 */

// ============================================================================
// Branded ID Types - Prevents accidentally mixing different entity IDs
// ============================================================================

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
type Branded<T, B> = T & Brand<B>;

export type UserId = Branded<string, 'UserId'>;
export type ListId = Branded<string, 'ListId'>;
export type ItemId = Branded<string, 'ItemId'>;
export type ClaimId = Branded<string, 'ClaimId'>;
export type MappingId = Branded<string, 'MappingId'>;
export type ShareCode = Branded<string, 'ShareCode'>;

// Type guards for runtime validation
export const isUserId = (id: string): id is UserId => typeof id === 'string' && id.length > 0;
export const isListId = (id: string): id is ListId => typeof id === 'string' && id.length > 0;
export const isItemId = (id: string): id is ItemId => typeof id === 'string' && id.length > 0;

// Factory functions for creating branded IDs
export const toUserId = (id: string): UserId => id as UserId;
export const toListId = (id: string): ListId => id as ListId;
export const toItemId = (id: string): ItemId => id as ItemId;
export const toClaimId = (id: string): ClaimId => id as ClaimId;
export const toMappingId = (id: string): MappingId => id as MappingId;
export const toShareCode = (code: string): ShareCode => code as ShareCode;

// ============================================================================
// Result Type - Explicit error handling
// ============================================================================

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const err = <E>(error: E): Result<never, E> => ({ success: false, error });

// Helper to unwrap Result or throw
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) return result.data;
  throw result.error;
};

// Helper to unwrap Result with default
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (result.success) return result.data;
  return defaultValue;
};

// ============================================================================
// Domain Types
// ============================================================================

export type ListVisibility = 'private' | 'shared' | 'public';
export type ItemPriority = 'low' | 'medium' | 'high' | 'must_have';
export type ClaimStatus = 'claimed' | 'purchased' | 'gifted';

export interface User {
  id: UserId;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface List {
  id: ListId;
  ownerId: UserId;
  title: string;
  description: string | null;
  emoji: string | null;
  visibility: ListVisibility;
  shareCode: ShareCode | null;
  eventDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: ItemId;
  listId: ListId;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  originalPrice: number | null;
  currency: string;
  priority: ItemPriority;
  quantity: number;
  notes: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Claim {
  id: ClaimId;
  itemId: ItemId;
  claimerId: UserId;
  quantity: number;
  status: ClaimStatus;
  isAnonymous: boolean;
  createdAt: Date;
}

// ============================================================================
// API Types - For client/server communication
// ============================================================================

export interface CreateListInput {
  title: string;
  description?: string;
  emoji?: string;
  visibility?: ListVisibility;
  eventDate?: string;
}

export interface UpdateListInput {
  title?: string;
  description?: string | null;
  emoji?: string | null;
  visibility?: ListVisibility;
  eventDate?: string | null;
}

export interface CreateItemInput {
  listId: ListId;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  currency?: string;
  priority?: ItemPriority;
  quantity?: number;
  notes?: string;
}

export interface UpdateItemInput {
  title?: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  currentPrice?: number | null;
  originalPrice?: number | null;
  priority?: ItemPriority;
  quantity?: number;
  notes?: string | null;
  position?: number;
}

// ============================================================================
// View Models - Enriched types for display
// ============================================================================

export interface ListWithStats extends List {
  itemCount: number;
  claimedCount: number;
  totalValue: number | null;
}

export interface ItemWithClaims extends Item {
  claims: Claim[];
  remainingQuantity: number;
  isClaimed: boolean;
  isFullyClaimed: boolean;
}

export interface SharedListView {
  list: List;
  items: ItemWithClaims[];
  owner: Pick<User, 'displayName' | 'avatarUrl'>;
  viewerClaims: Claim[];
}

// ============================================================================
// Circle 2: Site Mappings & Price Tracking
// ============================================================================

export type SiteMappingId = Branded<string, 'SiteMappingId'>;
export type PriceSnapshotId = Branded<string, 'PriceSnapshotId'>;

export const toSiteMappingId = (id: string): SiteMappingId => id as SiteMappingId;
export const toPriceSnapshotId = (id: string): PriceSnapshotId => id as PriceSnapshotId;

export interface SiteMapping {
  id: SiteMappingId;
  domain: string;
  pathPattern: string;
  selectors: SiteSelectors;
  confidence: number;
  upvotes: number;
  downvotes: number;
  lastVerifiedAt: Date | null;
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSelectors {
  title?: string;
  price?: string;
  image?: string;
  description?: string;
  availability?: string;
  originalPrice?: string;
  brand?: string;
}

export interface PriceSnapshot {
  id: PriceSnapshotId;
  itemId: ItemId;
  price: number;
  currency: string;
  capturedAt: Date;
}

export interface ProductExtraction {
  source: 'json-ld' | 'open-graph' | 'meta-tags' | 'dom-heuristics' | 'site-mapping' | 'none';
  confidence: number;
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  sku?: string;
  url: string;
  needsMapping?: boolean;
}

export interface CreateSiteMappingInput {
  domain: string;
  pathPattern?: string;
  selectors: SiteSelectors;
}

export interface ItemWithPriceHistory extends Item {
  priceHistory: PriceSnapshot[];
  priceChange: number | null; // Percentage change from original
  isOnSale: boolean;
}
