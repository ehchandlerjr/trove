/**
 * Giftwise Content Script
 * 
 * Injected into every page to extract product information.
 * Uses multiple strategies in order of reliability:
 * 1. JSON-LD structured data (most reliable)
 * 2. Open Graph meta tags
 * 3. Standard meta tags
 * 4. DOM heuristics (fallback)
 */

// Utility to safely query selector
function safeQuery(selector) {
  try {
    const el = document.querySelector(selector);
    return el ? el.textContent?.trim() : null;
  } catch {
    return null;
  }
}

// Utility to safely get attribute
function safeAttr(selector, attr) {
  try {
    const el = document.querySelector(selector);
    return el ? el.getAttribute(attr) : null;
  } catch {
    return null;
  }
}

// Extract JSON-LD product data
function extractJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      
      // Handle @graph arrays
      const items = data['@graph'] || [data];
      
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type']?.includes('Product')) {
          const offers = item.offers;
          const offer = Array.isArray(offers) ? offers[0] : offers;
          
          return {
            source: 'json-ld',
            confidence: 0.95,
            title: item.name,
            description: item.description,
            image: Array.isArray(item.image) ? item.image[0] : item.image,
            price: offer?.price ? parseFloat(offer.price) : null,
            currency: offer?.priceCurrency || 'USD',
            availability: offer?.availability?.replace('https://schema.org/', ''),
            brand: item.brand?.name || item.brand,
            sku: item.sku,
            url: item.url || window.location.href,
          };
        }
      }
    } catch (e) {
      // Invalid JSON, continue to next script
    }
  }
  
  return null;
}

// Extract Open Graph meta tags
function extractOpenGraph() {
  const og = {
    title: safeAttr('meta[property="og:title"]', 'content'),
    description: safeAttr('meta[property="og:description"]', 'content'),
    image: safeAttr('meta[property="og:image"]', 'content'),
    url: safeAttr('meta[property="og:url"]', 'content'),
    price: safeAttr('meta[property="product:price:amount"]', 'content') ||
           safeAttr('meta[property="og:price:amount"]', 'content'),
    currency: safeAttr('meta[property="product:price:currency"]', 'content') ||
              safeAttr('meta[property="og:price:currency"]', 'content'),
  };
  
  if (og.title) {
    return {
      source: 'open-graph',
      confidence: 0.8,
      title: og.title,
      description: og.description,
      image: og.image,
      price: og.price ? parseFloat(og.price) : null,
      currency: og.currency || 'USD',
      url: og.url || window.location.href,
    };
  }
  
  return null;
}

// Extract standard meta tags
function extractMetaTags() {
  const meta = {
    title: safeAttr('meta[name="title"]', 'content') || document.title,
    description: safeAttr('meta[name="description"]', 'content'),
    image: safeAttr('link[rel="image_src"]', 'href'),
  };
  
  if (meta.title && meta.title !== document.title) {
    return {
      source: 'meta-tags',
      confidence: 0.5,
      title: meta.title,
      description: meta.description,
      image: meta.image,
      url: window.location.href,
    };
  }
  
  return null;
}

// Extract using DOM heuristics
function extractDomHeuristics() {
  // Try common product title selectors
  const titleSelectors = [
    'h1[itemprop="name"]',
    '[data-testid="product-title"]',
    '.product-title',
    '.product-name',
    '#productTitle',
    'h1.title',
    'h1',
  ];
  
  let title = null;
  for (const sel of titleSelectors) {
    title = safeQuery(sel);
    if (title && title.length > 3 && title.length < 300) break;
  }
  
  // Try common price selectors
  const priceSelectors = [
    '[itemprop="price"]',
    '[data-testid="product-price"]',
    '.product-price',
    '.price-current',
    '.sale-price',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen',
  ];
  
  let priceText = null;
  for (const sel of priceSelectors) {
    priceText = safeQuery(sel) || safeAttr(sel, 'content');
    if (priceText) break;
  }
  
  // Parse price from text
  let price = null;
  if (priceText) {
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
      price = parseFloat(match[0].replace(/,/g, ''));
    }
  }
  
  // Try to find main product image
  const imageSelectors = [
    '[itemprop="image"]',
    '[data-testid="product-image"] img',
    '.product-image img',
    '#main-image',
    '#landingImage',
    '.gallery-image img',
  ];
  
  let image = null;
  for (const sel of imageSelectors) {
    image = safeAttr(sel, 'src') || safeAttr(sel, 'data-src');
    if (image) break;
  }
  
  // Fallback to largest image on page
  if (!image) {
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img => img.naturalWidth > 200 && img.naturalHeight > 200)
      .sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
    
    if (images.length > 0) {
      image = images[0].src;
    }
  }
  
  if (title) {
    return {
      source: 'dom-heuristics',
      confidence: 0.3,
      title: title,
      image: image,
      price: price,
      url: window.location.href,
    };
  }
  
  return null;
}

// Capture full page HTML for element selector
function capturePageHtml() {
  return {
    html: document.documentElement.outerHTML,
    url: window.location.href,
    domain: window.location.hostname,
  };
}

// Main extraction function
function extractProductInfo() {
  // Try each method in order of reliability
  const jsonLd = extractJsonLd();
  if (jsonLd && jsonLd.title) return jsonLd;
  
  const og = extractOpenGraph();
  if (og && og.title) return og;
  
  const meta = extractMetaTags();
  if (meta && meta.title) return meta;
  
  const dom = extractDomHeuristics();
  if (dom && dom.title) return dom;
  
  // Nothing found
  return {
    source: 'none',
    confidence: 0,
    title: document.title,
    url: window.location.href,
    needsMapping: true,
  };
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_PRODUCT') {
    const result = extractProductInfo();
    sendResponse(result);
    return true;
  }
  
  if (request.type === 'CAPTURE_HTML') {
    const result = capturePageHtml();
    sendResponse(result);
    return true;
  }
  
  if (request.type === 'APPLY_SELECTOR') {
    // Apply a CSS selector and return the content
    try {
      const el = document.querySelector(request.selector);
      if (el) {
        sendResponse({
          success: true,
          text: el.textContent?.trim(),
          html: el.innerHTML,
          src: el.src || el.getAttribute('src'),
          href: el.href || el.getAttribute('href'),
        });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
});

// Auto-detect if on a product page and notify popup
const productInfo = extractProductInfo();
if (productInfo.confidence > 0.5) {
  chrome.runtime.sendMessage({
    type: 'PRODUCT_DETECTED',
    data: productInfo,
  }).catch(() => {
    // Extension context may not be available
  });
}
