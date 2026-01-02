/**
 * Multi-Strategy Product Extraction System
 * 
 * Inspired by the XFA dialect approach: we maintain a library of extraction
 * strategies and try them in order of reliability. When we find one that works,
 * we remember it for next time.
 * 
 * Strategy priority:
 * 1. JSON-LD (structured data, highest confidence)
 * 2. Site-specific mappings (crowdsourced selectors from teach-site)
 * 3. Open Graph meta tags
 * 4. Common product page patterns (Amazon-style, Shopify-style, etc.)
 * 5. Heuristic extraction (find things that "look like" prices/titles)
 * 6. Basic meta tags (lowest confidence)
 */

// ============================================================================
// Types
// ============================================================================

export interface ExtractedProduct {
  title?: string;
  description?: string;
  images: string[];          // All product images, not just one
  price?: number;
  originalPrice?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  url: string;
  
  // Extraction metadata
  source: ExtractionSource;
  confidence: number;
  strategiesAttempted: string[];
  strategyUsed: string;
}

export type ExtractionSource = 
  | 'json-ld'
  | 'site-mapping'
  | 'open-graph'
  | 'pattern-library'
  | 'heuristic'
  | 'meta-tags'
  | 'manual';

export interface ExtractionStrategy {
  name: string;
  confidence: number;  // Base confidence when this strategy succeeds
  extract: (html: string, url: string, context?: ExtractionContext) => ExtractedProduct | null;
}

export interface ExtractionContext {
  domain: string;
  siteMapping?: SiteMapping;
  knownPatterns?: PatternLibrary;
}

export interface SiteMapping {
  domain: string;
  selectors: {
    title?: string;
    price?: string;
    originalPrice?: string;
    image?: string;
    images?: string;        // Selector for ALL images
    description?: string;
  };
  confidence: number;
}

export interface PatternLibrary {
  patterns: DomainPattern[];
}

export interface DomainPattern {
  name: string;
  domains: string[];        // Which domains this pattern works for
  selectors: {
    title: string[];        // Multiple selectors to try
    price: string[];
    image: string[];
    description?: string[];
  };
  priceRegex?: RegExp;
  lastVerified?: Date;
  successRate: number;
}

// ============================================================================
// Strategy Implementations
// ============================================================================

/**
 * Strategy 1: JSON-LD Structured Data
 * Highest confidence - explicit machine-readable data
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
          
          // Collect ALL images
          const images: string[] = [];
          if (item.image) {
            if (Array.isArray(item.image)) {
              images.push(...item.image.filter((img: unknown): img is string => typeof img === 'string'));
            } else if (typeof item.image === 'string') {
              images.push(item.image);
            } else if (typeof item.image === 'object' && item.image.url) {
              images.push(item.image.url);
            }
          }
          
          return {
            title: item.name,
            description: item.description,
            images,
            price: offer?.price ? parseFloat(offer.price) : undefined,
            originalPrice: offer?.priceSpecification?.price 
              ? parseFloat(offer.priceSpecification.price) 
              : undefined,
            currency: offer?.priceCurrency || 'USD',
            availability: offer?.availability?.replace('https://schema.org/', ''),
            brand: typeof item.brand === 'string' ? item.brand : item.brand?.name,
            url: item.url || url,
            source: 'json-ld',
            confidence: 0.95,
            strategiesAttempted: ['json-ld'],
            strategyUsed: 'json-ld',
          };
        }
      }
    } catch {
      // Invalid JSON, continue to next script tag
    }
  }
  
  return null;
}

/**
 * Strategy 2: Open Graph Meta Tags
 * Good confidence - designed for sharing/previews
 */
export function extractOpenGraph(html: string, url: string): ExtractedProduct | null {
  const getMetaContent = (property: string): string | undefined => {
    // Try both attribute orders
    const regex = new RegExp(
      `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']` +
      `|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
      'i'
    );
    const match = regex.exec(html);
    return match?.[1] || match?.[2];
  };
  
  // Get all og:image tags (some sites have multiple)
  const getAllImages = (): string[] => {
    const images: string[] = [];
    const regex = /<meta[^>]*(?:property|name)=["']og:image(?::\d+)?["'][^>]*content=["']([^"']*)["']/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (match[1]) images.push(match[1]);
    }
    // Also try the alternate attribute order
    const altRegex = /<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']og:image(?::\d+)?["']/gi;
    while ((match = altRegex.exec(html)) !== null) {
      if (match[1] && !images.includes(match[1])) images.push(match[1]);
    }
    return images;
  };
  
  const title = getMetaContent('og:title');
  
  if (!title) return null;
  
  const images = getAllImages();
  const priceAmount = getMetaContent('product:price:amount') || getMetaContent('og:price:amount');
  const priceCurrency = getMetaContent('product:price:currency') || getMetaContent('og:price:currency');
  
  return {
    title,
    description: getMetaContent('og:description'),
    images,
    price: priceAmount ? parseFloat(priceAmount) : undefined,
    currency: priceCurrency || 'USD',
    url: getMetaContent('og:url') || url,
    source: 'open-graph',
    confidence: 0.8,
    strategiesAttempted: ['json-ld', 'open-graph'],
    strategyUsed: 'open-graph',
  };
}

/**
 * Strategy 3: Known Site Patterns
 * 
 * These are "dialects" - known HTML structures for popular sites.
 * Even if class names are randomized, the structure is often consistent.
 */
export const KNOWN_PATTERNS: DomainPattern[] = [
  {
    name: 'amazon-style',
    domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.ca'],
    selectors: {
      title: [
        '#productTitle',
        '#title',
        'h1[data-automation-id="product-title"]',
        'h1.product-title',
      ],
      price: [
        '.a-price .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price-whole',
        '[data-a-price]',
      ],
      image: [
        '#landingImage',
        '#imgTagWrapperId img',
        '#main-image',
        '.imgTagWrapper img',
      ],
    },
    priceRegex: /\$[\d,]+\.?\d*/,
    successRate: 0.7,
  },
  {
    name: 'shopify-style',
    domains: [], // Generic, try on unknown sites
    selectors: {
      title: [
        '.product-single__title',
        '.product__title',
        'h1.title',
        '[data-product-title]',
      ],
      price: [
        '.product-single__price',
        '.product__price',
        '[data-product-price]',
        '.price__current',
      ],
      image: [
        '.product-single__photo img',
        '.product__photo img',
        '[data-product-image]',
        '.product-featured-media img',
      ],
    },
    successRate: 0.6,
  },
  {
    name: 'woocommerce-style',
    domains: [],
    selectors: {
      title: [
        '.product_title',
        'h1.entry-title',
      ],
      price: [
        '.woocommerce-Price-amount',
        '.price ins .amount',
        '.price .amount',
      ],
      image: [
        '.woocommerce-product-gallery__image img',
        '.product-image img',
      ],
    },
    successRate: 0.6,
  },
  {
    name: 'etsy-style',
    domains: ['etsy.com'],
    selectors: {
      title: [
        'h1[data-buy-box-listing-title]',
        '.listing-page-title',
        'h1.wt-text-title-01',
      ],
      price: [
        '[data-buy-box-region="price"] p',
        '.wt-text-title-03',
        '.currency-value',
      ],
      image: [
        'img[data-listing-full-image-id]',
        '.listing-page-image-carousel img',
        '.carousel-image',
      ],
    },
    successRate: 0.65,
  },
  {
    name: 'target-style',
    domains: ['target.com'],
    selectors: {
      title: [
        'h1[data-test="product-title"]',
        '#pdp-product-title',
      ],
      price: [
        '[data-test="product-price"]',
        '.Price__currentPrice',
      ],
      image: [
        '[data-test="product-image"] img',
        '.slideDeckPicture img',
      ],
    },
    successRate: 0.5, // Target is tricky
  },
  {
    name: 'ebay-style',
    domains: ['ebay.com', 'ebay.co.uk'],
    selectors: {
      title: [
        'h1.x-item-title__mainTitle',
        '#itemTitle',
        'h1[itemprop="name"]',
      ],
      price: [
        '.x-price-primary',
        '#prcIsum',
        '[itemprop="price"]',
      ],
      image: [
        '.ux-image-carousel-item img',
        '#icImg',
        '[itemprop="image"]',
      ],
    },
    successRate: 0.7,
  },
];

/**
 * Strategy 4: Heuristic Extraction
 * 
 * When all else fails, use heuristics to find things that "look like"
 * product information. Lower confidence but better than nothing.
 */
export function extractHeuristic(html: string, url: string): ExtractedProduct | null {
  // Price heuristics - find text that matches price patterns
  const pricePatterns = [
    /\$\s*([\d,]+\.?\d*)/,           // $19.99
    /USD\s*([\d,]+\.?\d*)/i,          // USD 19.99
    /([\d,]+\.?\d*)\s*(?:USD|dollars?)/i,  // 19.99 USD
    /£\s*([\d,]+\.?\d*)/,             // £19.99
    /€\s*([\d,]+\.?\d*)/,             // €19.99
  ];
  
  // Try to find a price
  let price: number | undefined;
  let currency = 'USD';
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      price = parseFloat(match[1].replace(',', ''));
      if (pattern.source.includes('£')) currency = 'GBP';
      if (pattern.source.includes('€')) currency = 'EUR';
      break;
    }
  }
  
  // Title heuristics - find the first h1, or largest heading
  const h1Match = /<h1[^>]*>([^<]+)<\/h1>/i.exec(html);
  const title = h1Match?.[1]?.trim();
  
  // Image heuristics - find large images
  const images: string[] = [];
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const src = imgMatch[1];
    // Skip tiny images, icons, tracking pixels
    if (src && !src.includes('1x1') && !src.includes('pixel') && !src.includes('icon')) {
      images.push(src);
    }
  }
  
  if (!title && !price) return null;
  
  return {
    title,
    images: images.slice(0, 10), // Limit to first 10
    price,
    currency,
    url,
    source: 'heuristic',
    confidence: 0.3,
    strategiesAttempted: ['json-ld', 'open-graph', 'pattern-library', 'heuristic'],
    strategyUsed: 'heuristic',
  };
}

/**
 * Strategy 5: Basic Meta Tags
 * Lowest confidence - just title tag and description
 */
export function extractMetaTags(html: string, url: string): ExtractedProduct | null {
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  const descMatch = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html);
  
  const title = titleMatch?.[1]?.trim();
  
  if (!title) return null;
  
  return {
    title,
    description: descMatch?.[1],
    images: [],
    url,
    source: 'meta-tags',
    confidence: 0.4,
    strategiesAttempted: ['json-ld', 'open-graph', 'pattern-library', 'heuristic', 'meta-tags'],
    strategyUsed: 'meta-tags',
  };
}

// ============================================================================
// Main Extraction Pipeline
// ============================================================================

export interface ExtractionResult {
  success: boolean;
  product?: ExtractedProduct;
  error?: string;
  strategiesAttempted: string[];
  suggestTeaching: boolean;
}

/**
 * Main extraction function - tries strategies in order
 */
export async function extractProduct(
  html: string, 
  url: string,
  context?: ExtractionContext
): Promise<ExtractionResult> {
  const strategiesAttempted: string[] = [];
  
  // Strategy 1: JSON-LD
  strategiesAttempted.push('json-ld');
  const jsonLdResult = extractJsonLd(html, url);
  if (jsonLdResult?.title) {
    return { 
      success: true, 
      product: jsonLdResult, 
      strategiesAttempted,
      suggestTeaching: false,
    };
  }
  
  // Strategy 2: Site-specific mapping (from teach-site)
  if (context?.siteMapping) {
    strategiesAttempted.push('site-mapping');
    // Note: Actual selector execution would happen client-side
    // Server just validates the mapping exists
  }
  
  // Strategy 3: Open Graph
  strategiesAttempted.push('open-graph');
  const ogResult = extractOpenGraph(html, url);
  if (ogResult?.title) {
    return { 
      success: true, 
      product: { ...ogResult, strategiesAttempted }, 
      strategiesAttempted,
      suggestTeaching: ogResult.confidence < 0.7,
    };
  }
  
  // Strategy 4: Known patterns
  if (context?.domain) {
    for (const pattern of KNOWN_PATTERNS) {
      if (pattern.domains.length === 0 || pattern.domains.some(d => context.domain.includes(d))) {
        strategiesAttempted.push(`pattern:${pattern.name}`);
        // Pattern matching would be done with a DOM parser like cheerio
        // For now, we just note that we'd try it
      }
    }
  }
  
  // Strategy 5: Heuristic
  strategiesAttempted.push('heuristic');
  const heuristicResult = extractHeuristic(html, url);
  if (heuristicResult?.title) {
    return {
      success: true,
      product: { ...heuristicResult, strategiesAttempted },
      strategiesAttempted,
      suggestTeaching: true, // Always suggest teaching for heuristic extraction
    };
  }
  
  // Strategy 6: Meta tags (last resort)
  strategiesAttempted.push('meta-tags');
  const metaResult = extractMetaTags(html, url);
  if (metaResult?.title) {
    return {
      success: true,
      product: { ...metaResult, strategiesAttempted },
      strategiesAttempted,
      suggestTeaching: true,
    };
  }
  
  // Nothing worked
  return {
    success: false,
    error: 'Could not extract product information',
    strategiesAttempted,
    suggestTeaching: true,
  };
}

// ============================================================================
// Dialect Learning (for future ML integration)
// ============================================================================

/**
 * Record a successful extraction for learning
 * This data can be used to improve patterns over time
 */
export interface ExtractionLearningRecord {
  domain: string;
  url: string;
  strategyUsed: string;
  selectorsUsed?: Record<string, string>;
  extractedFields: string[];  // Which fields were successfully extracted
  userVerified: boolean;      // Did user confirm this was correct?
  timestamp: Date;
}

/**
 * When a user teaches a site, we can analyze similar sites
 * to see if the same selectors work elsewhere
 */
export function analyzePatternSimilarity(
  newMapping: SiteMapping,
  existingMappings: SiteMapping[]
): { similarDomains: string[]; confidence: number } {
  // This is where you could add more sophisticated analysis
  // For now, just check if selector patterns match
  
  const similarDomains: string[] = [];
  
  for (const existing of existingMappings) {
    // Check if selectors have similar structure
    const overlap = Object.keys(newMapping.selectors).filter(
      key => existing.selectors[key as keyof typeof existing.selectors] === 
             newMapping.selectors[key as keyof typeof newMapping.selectors]
    );
    
    if (overlap.length >= 2) {
      similarDomains.push(existing.domain);
    }
  }
  
  return {
    similarDomains,
    confidence: similarDomains.length > 0 ? 0.5 : 0,
  };
}
