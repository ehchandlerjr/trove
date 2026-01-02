import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import { z } from 'zod';
import { extractProduct, type ExtractionContext } from '@/lib/extraction/strategies';

// Validation schema
const parseUrlSchema = z.object({
  url: z.string().url().max(2000),
});

/**
 * SSRF Protection: Block requests to private/internal networks
 * Handles various bypass attempts including:
 * - Case variations (LOCALHOST, LocalHost)
 * - IPv4-mapped IPv6 (::ffff:127.0.0.1)
 * - Full IPv6 loopback (0:0:0:0:0:0:0:1)
 * - Cloud metadata endpoints
 */
function isPrivateOrReservedIP(hostname: string): boolean {
  // Normalize to lowercase for case-insensitive checks
  const normalized = hostname.toLowerCase().trim();
  
  // Block localhost variants (exact match only)
  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1') {
    return true;
  }
  
  // Block cloud metadata endpoints (exact matches to avoid false positives)
  const blockedExactHostnames = [
    'metadata.google.internal',
    '169.254.169.254', // AWS/GCP metadata
  ];
  if (blockedExactHostnames.includes(normalized)) {
    return true;
  }
  
  // Block IPv6 loopback variations
  const ipv6LoopbackPatterns = [
    /^0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,1}1$/i, // ::1 full form
    /^::ffff:127\./i, // IPv4-mapped IPv6 loopback
    /^::ffff:10\./i,  // IPv4-mapped IPv6 private
    /^::ffff:192\.168\./i, // IPv4-mapped IPv6 private
    /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i, // IPv4-mapped IPv6 private
  ];
  if (ipv6LoopbackPatterns.some(pattern => pattern.test(normalized))) {
    return true;
  }
  
  // Check for private IP ranges
  const ipv4Match = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    
    // Validate each octet is 0-255
    const octets = [a, b, Number(ipv4Match[3]), Number(ipv4Match[4])];
    if (octets.some(o => o > 255)) {
      return true; // Invalid IP, block it
    }
    
    // 10.0.0.0/8 - Private
    if (a === 10) return true;
    
    // 172.16.0.0/12 - Private
    if (a === 172 && b >= 16 && b <= 31) return true;
    
    // 192.168.0.0/16 - Private
    if (a === 192 && b === 168) return true;
    
    // 127.0.0.0/8 - Loopback
    if (a === 127) return true;
    
    // 169.254.0.0/16 - Link-local
    if (a === 169 && b === 254) return true;
    
    // 0.0.0.0/8 - Current network
    if (a === 0) return true;
    
    // 224.0.0.0/4 - Multicast
    if (a >= 224 && a <= 239) return true;
    
    // 240.0.0.0/4 - Reserved
    if (a >= 240) return true;
  }
  
  // Block IPv6 private ranges
  if (normalized.startsWith('fe80:') || // Link-local
      normalized.startsWith('fc') ||    // Unique local
      normalized.startsWith('fd')) {    // Unique local
    return true;
  }
  
  return false;
}

/**
 * POST /api/parse-url
 * 
 * Fetches a URL and extracts product information.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Parse and validate request body
    const body = await request.json();
    const validation = parseUrlSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid URL', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { url } = validation.data;
    
    // Parse the URL to get domain
    let domain: string;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      domain = parsedUrl.hostname;
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // SSRF Protection: Block private/internal networks
    if (isPrivateOrReservedIP(domain)) {
      return NextResponse.json(
        { error: 'URL points to a private or reserved network address' },
        { status: 400 }
      );
    }
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }
    
    // Fetch the page
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.status}` },
          { status: 502 }
        );
      }
      
      html = await response.text();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to fetch URL: ${message}` },
        { status: 502 }
      );
    }
    
    // Use the unified extraction system
    const context: ExtractionContext = { domain };
    
    // Check if we have a site mapping
    const normalizedDomain = domain.replace(/^www\./, '');
    const { data: mappings } = await supabase
      .from('site_mappings')
      .select('*')
      .or(`domain.eq.${normalizedDomain},domain.eq.www.${normalizedDomain}`)
      .order('confidence', { ascending: false })
      .limit(1);
    
    if (mappings && mappings.length > 0) {
      const mapping = mappings[0] as { selectors: Record<string, string>; confidence: number };
      context.siteMapping = {
        domain: normalizedDomain,
        selectors: mapping.selectors,
        confidence: mapping.confidence,
      };
    }
    
    // Run extraction
    const result = await extractProduct(html, url, context);
    
    if (result.success && result.product) {
      return NextResponse.json({ 
        product: {
          source: result.product.source,
          confidence: result.product.confidence,
          title: result.product.title,
          description: result.product.description,
          image: result.product.images[0], // Primary image for backward compat
          images: result.product.images,   // All images
          price: result.product.price,
          originalPrice: result.product.originalPrice,
          currency: result.product.currency,
          availability: result.product.availability,
          brand: result.product.brand,
          url: result.product.url,
        },
        domain,
        suggestTeaching: result.suggestTeaching,
        strategiesAttempted: result.strategiesAttempted,
      });
    }
    
    // Nothing found - suggest teaching
    return NextResponse.json({
      product: {
        source: 'none',
        confidence: 0,
        url,
        needsMapping: true,
      },
      domain,
      suggestTeaching: true,
      strategiesAttempted: result.strategiesAttempted,
      html: html.substring(0, 100000), // Limit HTML size for client-side mapping
    });
  } catch (error) {
    console.error('Parse URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
