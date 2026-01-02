/**
 * Multi-Strategy Extraction Service
 * 
 * Implements a "dialect library" approach to product extraction.
 * Each site may have multiple known patterns that have worked in the past.
 * We try strategies in order of reliability until one succeeds.
 * 
 * Strategies are ordered by confidence:
 * 1. JSON-LD structured data (highest - site explicitly provides it)
 * 2. Open Graph meta tags (high - standard format)
 * 3. Known site mappings (high - community-verified selectors)
 * 4. Heuristic extraction (medium - structural patterns)
 * 5. Regex fallbacks (low - text pattern matching)
 */

import type { Database } from '@/lib/db/database.types';

// ============================================================================
// Types
// ============================================================================

export interface ExtractedProduct {
  title?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  images?: string[];
  brand?: string;
  availability?: string;
  url: string;
}

export interface ExtractionResult {
  success: boolean;
  product?: ExtractedProduct;
  source: string;           // Which strategy succeeded
  confidence: number;       // 0-1 confidence score
  strategiesAttempted: string[];
  errors?: string[];
}

export interface ExtractionStrategy {
  name: string;
  priority: number;         // Lower = tried first
  extract: (html: string, url: string, context?: ExtractionContext) => Promise<ExtractedProduct | null>;
}

export interface ExtractionContext {
  domain: string;
  knownMappings?: SiteMapping[];
  previousSuccesses?: string[];  // Strategies that worked before for this domain
}

export interface SiteMapping {
  domain: string;
  pathPattern: string;
  selectors: {
    title?: string;
    price?: string;
    originalPrice?: string;
    image?: string | string[];  // Can be single or multiple
    description?: string;
    brand?: string;
  };
  confidence: number;
  lastVerified?: Date;
}

// For catalog-style sites (like mycomicshop)
export interface CatalogMapping extends SiteMapping {
  isCatalog: true;
  rowSelector: string;           // Selector for repeating item rows
  identityFields: string[];      // Fields that uniquely identify an item (e.g., ['title', 'grade'])
  relativeSelectors: {           // Selectors relative to row
    title?: string;
    price?: string;
    grade?: string;
    image?: string;
    link?: string;               // Optional: link within the row
  };
}

// ============================================================================
// Strategy Implementations
// ============================================================================

/**
 * Strategy 1: JSON-LD structured data
 * Sites that care about SEO include this - it's the most reliable
 */
export function extractJsonLd(html: string, url: string): ExtractedProduct | null {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = data['@graph'] || [data];
      
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type']?.includes?.('Product')) {
          const offers = item.offers;
          const offer = Array.isArray(offers) ? offers[0] : offers;
          
          // Handle images - can be string or array
          let images: string[] = [];
          if (Array.isArray(item.image)) {
            images = item.image.filter((i: unknown): i is string => typeof i === 'string');
          } else if (typeof item.image === 'string') {
            images = [item.image];
          }
          
          return {
            title: item.name,
            description: item.description,
            images,
            price: offer?.price ? parseFloat(offer.price) : undefined,
            originalPrice: offer?.priceValidUntil ? parseFloat(offer.highPrice) : undefined,
            currency: offer?.priceCurrency || 'USD',
            availability: offer?.availability?.replace('https://schema.org/', ''),
            brand: typeof item.brand === 'string' ? item.brand : item.brand?.name,
            url: item.url || url,
          };
        }
      }
    } catch {
      // Invalid JSON, continue to next match
    }
  }
  
  return null;
}

/**
 * Strategy 2: Open Graph meta tags
 * Standard format, widely supported
 */
export function extractOpenGraph(html: string, url: string): ExtractedProduct | null {
  const getMetaContent = (property: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
    ];
    for (const regex of patterns) {
      const match = regex.exec(html);
      if (match?.[1]) return match[1];
    }
    return undefined;
  };
  
  // Get all OG images
  const images: string[] = [];
  const ogImageRegex = /<meta[^>]*property=["']og:image(?::[^"']*)?["'][^>]*content=["']([^"']*)["']/gi;
  let imgMatch;
  while ((imgMatch = ogImageRegex.exec(html)) !== null) {
    if (imgMatch[1] && !images.includes(imgMatch[1])) {
      images.push(imgMatch[1]);
    }
  }
  
  const title = getMetaContent('og:title');
  
  if (!title) return null;
  
  const priceAmount = getMetaContent('product:price:amount') || getMetaContent('og:price:amount');
  
  return {
    title,
    description: getMetaContent('og:description'),
    images,
    price: priceAmount ? parseFloat(priceAmount) : undefined,
    currency: getMetaContent('product:price:currency') || getMetaContent('og:price:currency') || 'USD',
    url: getMetaContent('og:url') || url,
  };
}

/**
 * Strategy 3: Twitter Card meta tags
 * Similar to OG, sometimes has different/additional data
 */
export function extractTwitterCard(html: string, url: string): ExtractedProduct | null {
  const getMetaContent = (name: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]*name=["']twitter:${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']twitter:${name}["']`, 'i'),
    ];
    for (const regex of patterns) {
      const match = regex.exec(html);
      if (match?.[1]) return match[1];
    }
    return undefined;
  };
  
  const title = getMetaContent('title');
  if (!title) return null;
  
  const image = getMetaContent('image');
  
  return {
    title,
    description: getMetaContent('description'),
    images: image ? [image] : [],
    url,
  };
}

/**
 * Strategy 4: Heuristic extraction
 * Structural patterns that are common across e-commerce sites
 */
export function extractHeuristic(html: string, url: string): ExtractedProduct | null {
  // Common title patterns
  const titlePatterns = [
    /<h1[^>]*class="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)</i,
    /<h1[^>]*id="[^"]*product[^"]*title[^"]*"[^>]*>([^<]+)</i,
    /<h1[^>]*itemprop="name"[^>]*>([^<]+)</i,
    /<span[^>]*itemprop="name"[^>]*>([^<]+)</i,
    /<h1[^>]*>([^<]{10,200})<\/h1>/i,  // Any h1 with reasonable length
  ];
  
  let title: string | undefined;
  for (const pattern of titlePatterns) {
    const match = pattern.exec(html);
    if (match?.[1]) {
      title = match[1].trim();
      break;
    }
  }
  
  // Price patterns (capture the whole match for currency detection)
  const pricePatterns = [
    /itemprop="price"[^>]*content="([\d.]+)"/i,
    /class="[^"]*price[^"]*"[^>]*>\s*[\$€£¥]?\s*([\d,]+\.?\d*)/i,
    /id="[^"]*price[^"]*"[^>]*>\s*[\$€£¥]?\s*([\d,]+\.?\d*)/i,
    /[\$€£¥]\s*([\d,]+\.?\d{0,2})/,  // Currency symbol followed by number
  ];
  
  let price: number | undefined;
  for (const pattern of pricePatterns) {
    const match = pattern.exec(html);
    if (match?.[1]) {
      const cleanPrice = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleanPrice);
      if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
        price = parsed;
        break;
      }
    }
  }
  
  // Image patterns
  const images: string[] = [];
  const imagePatterns = [
    /<img[^>]*class="[^"]*product[^"]*image[^"]*"[^>]*src="([^"]+)"/gi,
    /<img[^>]*id="[^"]*product[^"]*image[^"]*"[^>]*src="([^"]+)"/gi,
    /<img[^>]*itemprop="image"[^>]*src="([^"]+)"/gi,
  ];
  
  for (const pattern of imagePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1] && !match[1].includes('placeholder') && !images.includes(match[1])) {
        images.push(match[1]);
      }
    }
  }
  
  if (!title && !price) return null;
  
  return {
    title,
    price,
    images,
    url,
  };
}

/**
 * Strategy 5: Basic meta tags fallback
 * Last resort - just get title and description from standard meta
 */
export function extractBasicMeta(html: string, url: string): ExtractedProduct | null {
  const getMetaContent = (name: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'),
    ];
    for (const regex of patterns) {
      const match = regex.exec(html);
      if (match?.[1]) return match[1];
    }
    return undefined;
  };
  
  // Get title from <title> tag
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  const title = getMetaContent('title') || titleMatch?.[1]?.trim();
  
  if (!title) return null;
  
  return {
    title,
    description: getMetaContent('description'),
    url,
  };
}

// ============================================================================
// Main Extraction Service
// ============================================================================

const DEFAULT_STRATEGIES: ExtractionStrategy[] = [
  {
    name: 'json-ld',
    priority: 1,
    extract: async (html, url) => extractJsonLd(html, url),
  },
  {
    name: 'open-graph',
    priority: 2,
    extract: async (html, url) => extractOpenGraph(html, url),
  },
  {
    name: 'twitter-card',
    priority: 3,
    extract: async (html, url) => extractTwitterCard(html, url),
  },
  {
    name: 'heuristic',
    priority: 4,
    extract: async (html, url) => extractHeuristic(html, url),
  },
  {
    name: 'basic-meta',
    priority: 5,
    extract: async (html, url) => extractBasicMeta(html, url),
  },
];

export interface ExtractOptions {
  strategies?: ExtractionStrategy[];
  context?: ExtractionContext;
  prioritizeStrategies?: string[];  // Try these first based on past success
}

/**
 * Main extraction function - tries strategies in order until one succeeds
 */
export async function extractProduct(
  html: string,
  url: string,
  options: ExtractOptions = {}
): Promise<ExtractionResult> {
  const strategies = options.strategies || DEFAULT_STRATEGIES;
  const prioritized = options.prioritizeStrategies || [];
  
  // Sort strategies: prioritized ones first, then by default priority
  const sortedStrategies = [...strategies].sort((a, b) => {
    const aIsPrioritized = prioritized.includes(a.name);
    const bIsPrioritized = prioritized.includes(b.name);
    
    if (aIsPrioritized && !bIsPrioritized) return -1;
    if (!aIsPrioritized && bIsPrioritized) return 1;
    return a.priority - b.priority;
  });
  
  const attempted: string[] = [];
  const errors: string[] = [];
  
  for (const strategy of sortedStrategies) {
    attempted.push(strategy.name);
    
    try {
      const result = await strategy.extract(html, url, options.context);
      
      if (result && result.title) {
        // Calculate confidence based on how much data we got
        let confidence = 0.5;
        if (result.price) confidence += 0.2;
        if (result.images && result.images.length > 0) confidence += 0.15;
        if (result.description) confidence += 0.1;
        if (result.brand) confidence += 0.05;
        
        // Adjust based on strategy reliability
        if (strategy.name === 'json-ld') confidence = Math.min(1, confidence + 0.2);
        if (strategy.name === 'open-graph') confidence = Math.min(1, confidence + 0.1);
        if (strategy.name === 'basic-meta') confidence = Math.max(0.3, confidence - 0.2);
        
        return {
          success: true,
          product: result,
          source: strategy.name,
          confidence,
          strategiesAttempted: attempted,
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`${strategy.name}: ${message}`);
    }
  }
  
  return {
    success: false,
    source: 'none',
    confidence: 0,
    strategiesAttempted: attempted,
    errors,
  };
}

// ============================================================================
// Strategy Learning/Recording
// ============================================================================

export interface StrategySuccess {
  domain: string;
  strategy: string;
  successCount: number;
  lastSuccess: Date;
}

/**
 * Record which strategy worked for a domain
 * This builds up the "dialect library" over time
 */
export function recordStrategySuccess(
  successes: Map<string, StrategySuccess[]>,
  domain: string,
  strategy: string
): void {
  const domainSuccesses = successes.get(domain) || [];
  const existing = domainSuccesses.find(s => s.strategy === strategy);
  
  if (existing) {
    existing.successCount++;
    existing.lastSuccess = new Date();
  } else {
    domainSuccesses.push({
      domain,
      strategy,
      successCount: 1,
      lastSuccess: new Date(),
    });
  }
  
  successes.set(domain, domainSuccesses);
}

/**
 * Get the best strategies to try for a domain based on past success
 */
export function getPrioritizedStrategies(
  successes: Map<string, StrategySuccess[]>,
  domain: string
): string[] {
  const domainSuccesses = successes.get(domain) || [];
  
  // Sort by success count (descending)
  return domainSuccesses
    .sort((a, b) => b.successCount - a.successCount)
    .map(s => s.strategy);
}

// ============================================================================
// Catalog Site Support
// ============================================================================

export interface CatalogItem {
  title: string;
  price?: number;
  grade?: string;
  image?: string;
  link?: string;
  rowIndex: number;
  rawData: Record<string, string>;
}

/**
 * Extract items from a catalog-style page
 * Returns all matching rows with their data
 */
export function extractCatalogItems(
  html: string,
  mapping: CatalogMapping
): CatalogItem[] {
  // This would need a DOM parser like cheerio for proper implementation
  // For now, return empty - actual implementation would use cheerio
  console.log('Catalog extraction requires DOM parser', mapping);
  return [];
}

/**
 * Find a specific item in catalog results by identity fields
 */
export function findCatalogItem(
  items: CatalogItem[],
  identity: Record<string, string>
): CatalogItem | undefined {
  return items.find(item => {
    for (const [key, value] of Object.entries(identity)) {
      if (item.rawData[key]?.toLowerCase() !== value.toLowerCase()) {
        return false;
      }
    }
    return true;
  });
}
