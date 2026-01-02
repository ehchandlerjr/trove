import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const proxyPageSchema = z.object({
  url: z.string().url().max(2000),
});

/**
 * SSRF Protection: Block requests to private/internal networks
 */
function isPrivateOrReservedIP(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim();
  
  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1') {
    return true;
  }
  
  const blockedExactHostnames = [
    'metadata.google.internal',
    '169.254.169.254',
  ];
  if (blockedExactHostnames.includes(normalized)) {
    return true;
  }
  
  const ipv6LoopbackPatterns = [
    /^0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,4}:0{0,1}1$/i,
    /^::ffff:127\./i,
    /^::ffff:10\./i,
    /^::ffff:192\.168\./i,
    /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i,
  ];
  if (ipv6LoopbackPatterns.some(pattern => pattern.test(normalized))) {
    return true;
  }
  
  const ipv4Match = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    const octets = [a, b, Number(ipv4Match[3]), Number(ipv4Match[4])];
    if (octets.some(o => o > 255)) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
    if (a >= 224 && a <= 239) return true;
    if (a >= 240) return true;
  }
  
  if (normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  
  return false;
}

/**
 * The injection script that enables element selection in the iframe.
 * This is the heart of the "teach the system" functionality.
 */
const SELECTOR_INJECTION_SCRIPT = `
<script>
(function() {
  'use strict';
  
  // State
  let highlightOverlay = null;
  let selectedOverlay = null;
  let currentHovered = null;
  
  // Create highlight overlay element
  function createOverlay(type) {
    const overlay = document.createElement('div');
    overlay.style.cssText = \`
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      border: 2px solid \${type === 'hover' ? '#C7923E' : '#10B981'};
      background: \${type === 'hover' ? 'rgba(199, 146, 62, 0.1)' : 'rgba(16, 185, 129, 0.15)'};
      border-radius: 4px;
      transition: all 0.1s ease-out;
      box-shadow: 0 0 0 4px \${type === 'hover' ? 'rgba(199, 146, 62, 0.2)' : 'rgba(16, 185, 129, 0.25)'};
    \`;
    if (type === 'hover') {
      highlightOverlay = overlay;
    } else {
      selectedOverlay = overlay;
    }
    document.body.appendChild(overlay);
    return overlay;
  }
  
  // Position overlay over an element
  function positionOverlay(overlay, element) {
    if (!element || !overlay) return;
    const rect = element.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.display = 'block';
  }
  
  // Hide overlay
  function hideOverlay(overlay) {
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
  
  /**
   * Generate a unique CSS selector for an element
   * Strategy: ID > data attributes > semantic classes > nth-child path
   * Designed to be stable across page loads
   */
  function generateSelector(element) {
    if (!element || element === document.body || element === document.documentElement) {
      return null;
    }
    
    // Strategy 1: ID (most stable)
    if (element.id && !element.id.match(/^\\d/) && !element.id.match(/[:\\[\\]]/)) {
      const idSelector = '#' + CSS.escape(element.id);
      try {
        if (document.querySelectorAll(idSelector).length === 1) {
          return idSelector;
        }
      } catch { /* invalid selector */ }
    }
    
    // Strategy 2: Data attributes (often semantic)
    const dataAttrs = ['data-testid', 'data-product-id', 'data-sku', 'data-item-id', 'data-name'];
    for (const attr of dataAttrs) {
      const val = element.getAttribute(attr);
      if (val) {
        const selector = '[' + attr + '="' + CSS.escape(val) + '"]';
        try {
          if (document.querySelectorAll(selector).length === 1) {
            return selector;
          }
        } catch { /* invalid selector */ }
      }
    }
    
    // Strategy 3: Build path with meaningful classes
    const path = [];
    let current = element;
    
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      
      // Check for unique ID on any ancestor
      if (current.id && !current.id.match(/^\\d/) && !current.id.match(/[:\\[\\]]/)) {
        const idSelector = '#' + CSS.escape(current.id);
        try {
          if (document.querySelectorAll(idSelector).length === 1) {
            path.unshift(idSelector);
            break;
          }
        } catch { /* invalid */ }
      }
      
      // Add semantic/meaningful classes (skip utility classes)
      const meaningfulClasses = Array.from(current.classList || [])
        .filter(c => {
          if (!c || c.length < 2) return false;
          // Skip dynamic/state classes
          if (c.match(/^(js-|is-|has-|active|hover|focus|visible|hidden|show|hide|open|closed|loading|error)/i)) return false;
          // Skip Tailwind/utility classes
          if (c.match(/^(w-|h-|p-|m-|flex|grid|bg-|text-|border-|rounded|space-|gap-|col-|row-|sm:|md:|lg:|xl:)/)) return false;
          // Skip generated/hash classes
          if (c.match(/^[a-z]{1,2}[0-9]{3,}|__[a-z]+|--[a-z]+|^_/i)) return false;
          return true;
        })
        .slice(0, 2);
      
      if (meaningfulClasses.length > 0) {
        selector += '.' + meaningfulClasses.map(c => CSS.escape(c)).join('.');
      }
      
      // Add nth-child if needed for uniqueness among siblings
      const parent = current.parentElement;
      if (parent) {
        try {
          const siblings = Array.from(parent.children).filter(child => {
            try { return child.matches(selector); } catch { return false; }
          });
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += ':nth-child(' + index + ')';
          }
        } catch { /* invalid selector */ }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      
      // Test if current path is unique
      const testSelector = path.join(' > ');
      try {
        if (document.querySelectorAll(testSelector).length === 1) {
          return testSelector;
        }
      } catch { /* invalid selector */ }
      
      // Limit path depth
      if (path.length > 7) break;
    }
    
    // Fallback: return the path we built
    const finalSelector = path.join(' > ');
    try {
      document.querySelectorAll(finalSelector);
      return finalSelector;
    } catch {
      return null;
    }
  }
  
  /**
   * Get preview content from an element
   */
  function getPreviewContent(element) {
    const tagName = element.tagName.toLowerCase();
    
    // For images, return the src
    if (tagName === 'img') {
      return element.src || element.getAttribute('data-src') || '[Image]';
    }
    
    // For links with images inside
    if (tagName === 'a' && element.querySelector('img')) {
      const img = element.querySelector('img');
      return img.src || img.getAttribute('data-src') || '[Image]';
    }
    
    // For elements with background images
    const bgImage = window.getComputedStyle(element).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\\(["']?([^"')]+)["']?\\)/);
      if (urlMatch) return urlMatch[1];
    }
    
    // For text content - get direct text, trimmed
    const text = element.textContent?.trim() || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }
  
  /**
   * Determine element type for better UI feedback
   */
  function getElementType(element) {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'img') return 'image';
    if (tagName === 'a' && element.querySelector('img')) return 'image';
    
    const bgImage = window.getComputedStyle(element).backgroundImage;
    if (bgImage && bgImage !== 'none') return 'image';
    
    // Check for price patterns
    const text = element.textContent?.trim() || '';
    if (text.match(/^[\\$\\€\\£\\¥]\\s*[\\d,.]+|[\\d,.]+\\s*[\\$\\€\\£\\¥]|USD|EUR/)) {
      return 'price';
    }
    
    return 'text';
  }
  
  // Elements to ignore
  const IGNORE_TAGS = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'META', 'LINK', 'HEAD', 'HTML'];
  
  function shouldIgnore(element) {
    if (!element || !element.tagName) return true;
    if (IGNORE_TAGS.includes(element.tagName)) return true;
    if (element.closest('[data-trove-overlay]')) return true;
    
    // Ignore very small elements
    const rect = element.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return true;
    
    // Ignore elements with no visible content
    if (!element.textContent?.trim() && !element.querySelector('img') && 
        window.getComputedStyle(element).backgroundImage === 'none') {
      return true;
    }
    
    return false;
  }
  
  // Initialize
  createOverlay('hover');
  createOverlay('selected');
  
  // Disable all links and forms
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });
  document.querySelectorAll('form').forEach(f => {
    f.addEventListener('submit', e => e.preventDefault());
  });
  
  // Handle mouse movement
  document.addEventListener('mouseover', function(e) {
    const target = e.target;
    if (shouldIgnore(target)) return;
    
    currentHovered = target;
    positionOverlay(highlightOverlay, target);
    
    // Send hover info to parent
    window.parent.postMessage({
      type: 'trove:hover',
      tagName: target.tagName.toLowerCase(),
      preview: getPreviewContent(target).substring(0, 50),
    }, '*');
  }, true);
  
  document.addEventListener('mouseout', function(e) {
    if (e.target === currentHovered) {
      hideOverlay(highlightOverlay);
      currentHovered = null;
    }
  }, true);
  
  // Handle clicks
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target;
    if (shouldIgnore(target)) return;
    
    // Catalog row mode: selections must be within the row
    if (catalogRowElement) {
      if (!catalogRowElement.contains(target)) {
        // Clicked outside the row - ignore
        return;
      }
      
      // Generate relative selector
      const relativeSelector = generateRelativeSelector(target, catalogRowElement);
      if (!relativeSelector) return;
      
      // Highlight within row
      positionOverlay(highlightOverlay, target);
      highlightOverlay.style.border = '2px solid #8B5CF6';
      highlightOverlay.style.background = 'rgba(139, 92, 246, 0.15)';
      
      // Send selection with relative selector
      window.parent.postMessage({
        type: 'trove:select',
        selector: relativeSelector,
        preview: getPreviewContent(target),
        elementType: getElementType(target),
        tagName: target.tagName.toLowerCase(),
        isRelative: true,
        rect: target.getBoundingClientRect().toJSON(),
      }, '*');
      
      return;
    }
    
    // Normal mode: generate absolute selector
    const selector = generateSelector(target);
    if (!selector) return;
    
    // Show selected overlay
    positionOverlay(selectedOverlay, target);
    
    // Send selection to parent
    window.parent.postMessage({
      type: 'trove:select',
      selector: selector,
      preview: getPreviewContent(target),
      elementType: getElementType(target),
      tagName: target.tagName.toLowerCase(),
      rect: target.getBoundingClientRect().toJSON(),
    }, '*');
  }, true);
  
  // Listen for commands from parent
  window.addEventListener('message', function(e) {
    if (e.data.type === 'trove:clearSelection') {
      hideOverlay(selectedOverlay);
    }
    if (e.data.type === 'trove:highlightSelector') {
      try {
        const element = document.querySelector(e.data.selector);
        if (element) {
          positionOverlay(selectedOverlay, element);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch {}
    }
    
    // Catalog mode: Detect row pattern
    if (e.data.type === 'trove:detectRowPattern') {
      const clicked = document.querySelector(e.data.clickedSelector);
      if (!clicked) return;
      
      // Find the closest repeating parent (table row, list item, or repeated div)
      let rowElement = findRepeatingParent(clicked);
      if (!rowElement) {
        rowElement = clicked;
      }
      
      // Generate selector for the row pattern
      const rowSelector = generateRowSelector(rowElement);
      const siblingCount = rowSelector ? document.querySelectorAll(rowSelector).length : 1;
      
      window.parent.postMessage({
        type: 'trove:catalogRow',
        rowSelector: rowSelector,
        preview: getPreviewContent(rowElement),
        siblingCount: siblingCount,
        rect: rowElement.getBoundingClientRect().toJSON(),
      }, '*');
      
      // Highlight all matching rows
      if (siblingCount > 1) {
        highlightAllRows(rowSelector);
      }
    }
    
    // Catalog mode: Enter row selection mode
    if (e.data.type === 'trove:enterRowMode') {
      enterRowMode(e.data.rowSelector);
    }
    
    // Catalog mode: Exit row selection mode
    if (e.data.type === 'trove:exitRowMode') {
      exitRowMode();
    }
  });
  
  // Catalog mode state
  let catalogRowSelector = null;
  let catalogRowElement = null;
  let rowOverlays = [];
  
  /**
   * Find the closest repeating parent element
   * Looks for table rows, list items, or divs with similar siblings
   */
  function findRepeatingParent(element) {
    let current = element;
    while (current && current !== document.body) {
      const parent = current.parentElement;
      if (!parent) break;
      
      // Check if this element has siblings with similar structure
      const tagName = current.tagName.toLowerCase();
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName.toLowerCase() === tagName && child !== current
      );
      
      // If we found 2+ similar siblings, this is likely a repeated row
      if (siblings.length >= 2) {
        // Verify siblings have similar child structure
        const childCount = current.children.length;
        const similarSiblings = siblings.filter(sib => 
          Math.abs(sib.children.length - childCount) <= 2
        );
        
        if (similarSiblings.length >= 2) {
          return current;
        }
      }
      
      // Check for semantic row elements
      if (['tr', 'li', 'article'].includes(tagName)) {
        if (siblings.length >= 1) {
          return current;
        }
      }
      
      current = parent;
    }
    return null;
  }
  
  /**
   * Generate a selector that matches all similar rows
   */
  function generateRowSelector(element) {
    if (!element || !element.parentElement) return null;
    
    const parent = element.parentElement;
    const tagName = element.tagName.toLowerCase();
    
    // Try to find a common class among siblings
    const siblings = Array.from(parent.children).filter(c => 
      c.tagName.toLowerCase() === tagName
    );
    
    if (siblings.length < 2) return generateSelector(element);
    
    // Find common classes
    const allClasses = siblings.map(sib => Array.from(sib.classList || []));
    const commonClasses = allClasses[0]?.filter(cls => 
      allClasses.every(classes => classes.includes(cls))
    ) || [];
    
    // Filter out utility/dynamic classes
    const meaningfulCommon = commonClasses.filter(c => {
      if (!c || c.length < 2) return false;
      if (c.match(/^(w-|h-|p-|m-|flex|grid|bg-|text-|border-)/)) return false;
      if (c.match(/^[a-z]{1,2}[0-9]{3,}/i)) return false;
      return true;
    });
    
    // Build selector
    let rowSelector = tagName;
    if (meaningfulCommon.length > 0) {
      rowSelector += '.' + meaningfulCommon.slice(0, 2).map(c => CSS.escape(c)).join('.');
    }
    
    // Add parent context for uniqueness
    const parentSelector = generateSelector(parent);
    if (parentSelector) {
      rowSelector = parentSelector + ' > ' + rowSelector;
    }
    
    // Verify it matches multiple elements
    try {
      const matches = document.querySelectorAll(rowSelector);
      if (matches.length >= 2) {
        return rowSelector;
      }
    } catch {}
    
    // Fallback to simple parent + tag
    return parentSelector ? parentSelector + ' > ' + tagName : tagName;
  }
  
  /**
   * Highlight all rows matching the selector
   */
  function highlightAllRows(selector) {
    // Clear existing overlays
    rowOverlays.forEach(o => o.remove());
    rowOverlays = [];
    
    try {
      const rows = document.querySelectorAll(selector);
      rows.forEach(row => {
        const overlay = document.createElement('div');
        overlay.style.cssText = \`
          position: absolute;
          pointer-events: none;
          z-index: 2147483646;
          border: 1px dashed #C7923E;
          background: rgba(199, 146, 62, 0.05);
          border-radius: 2px;
        \`;
        overlay.setAttribute('data-trove-row-overlay', 'true');
        
        const rect = row.getBoundingClientRect();
        overlay.style.top = (rect.top + window.scrollY) + 'px';
        overlay.style.left = (rect.left + window.scrollX) + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        
        document.body.appendChild(overlay);
        rowOverlays.push(overlay);
      });
    } catch {}
  }
  
  /**
   * Enter row mode - restrict selections to within the row
   */
  function enterRowMode(rowSelector) {
    catalogRowSelector = rowSelector;
    try {
      catalogRowElement = document.querySelector(rowSelector);
      if (catalogRowElement) {
        // Highlight the selected row more prominently
        positionOverlay(selectedOverlay, catalogRowElement);
        selectedOverlay.style.border = '3px solid #10B981';
        selectedOverlay.style.background = 'rgba(16, 185, 129, 0.1)';
      }
    } catch {}
  }
  
  /**
   * Exit row mode
   */
  function exitRowMode() {
    catalogRowSelector = null;
    catalogRowElement = null;
    rowOverlays.forEach(o => o.remove());
    rowOverlays = [];
    hideOverlay(selectedOverlay);
  }
  
  /**
   * Generate a selector relative to the row element
   */
  function generateRelativeSelector(element, rowElement) {
    if (!element || !rowElement || !rowElement.contains(element)) {
      return generateSelector(element);
    }
    
    // Build path from element up to (but not including) row
    const path = [];
    let current = element;
    
    while (current && current !== rowElement) {
      let selector = current.tagName.toLowerCase();
      
      // Add distinguishing classes
      const meaningfulClasses = Array.from(current.classList || [])
        .filter(c => {
          if (!c || c.length < 2) return false;
          if (c.match(/^(w-|h-|p-|m-|flex|grid|bg-|text-|border-)/)) return false;
          if (c.match(/^[a-z]{1,2}[0-9]{3,}/i)) return false;
          return true;
        })
        .slice(0, 2);
      
      if (meaningfulClasses.length > 0) {
        selector += '.' + meaningfulClasses.map(c => CSS.escape(c)).join('.');
      }
      
      // Add nth-child if needed
      const parent = current.parentElement;
      if (parent && parent !== rowElement) {
        const siblings = Array.from(parent.children).filter(c => {
          try { return c.matches(selector); } catch { return false; }
        });
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += ':nth-child(' + index + ')';
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }
  
  // Notify parent that script is ready
  window.parent.postMessage({ type: 'trove:ready' }, '*');
  
  // Handle scroll to update overlay positions
  window.addEventListener('scroll', function() {
    if (currentHovered) {
      positionOverlay(highlightOverlay, currentHovered);
    }
  }, true);
  
  console.log('[Trove] Element selector initialized');
})();
</script>
`;

/**
 * GET /api/proxy-page?url=...
 * 
 * Proxies a webpage with an injected element selector script.
 * Used by the teach-site iframe to enable click-to-select functionality.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }
  
  // Validate URL
  const validation = proxyPageSchema.safeParse({ url });
  if (!validation.success) {
    return new NextResponse('Invalid URL', { status: 400 });
  }
  
  // Parse and validate
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new NextResponse('Invalid URL format', { status: 400 });
  }
  
  // SSRF Protection
  if (isPrivateOrReservedIP(parsedUrl.hostname)) {
    return new NextResponse('URL points to a private network', { status: 400 });
  }
  
  // Only allow http and https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return new NextResponse('Only HTTP/HTTPS URLs allowed', { status: 400 });
  }
  
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch: ${response.status}`, { status: 502 });
    }
    
    let html = await response.text();
    
    // Get the base URL for rewriting relative paths
    const baseUrl = `${parsedUrl.origin}${parsedUrl.pathname.replace(/\/[^/]*$/, '/')}`;
    
    // Inject base tag to fix relative URLs
    const baseTag = `<base href="${baseUrl}">`;
    
    // Fix relative URLs for key attributes that base tag doesn't handle
    // This handles srcset, data-src, and other attributes
    html = html.replace(/(srcset|data-src|data-srcset|data-background-image)=["'](?!https?:\/\/|\/\/|data:)([^"']+)["']/gi, 
      (match, attr, url) => `${attr}="${new URL(url, baseUrl).href}"`
    );
    
    // Inject our selector script before </body> or at the end
    if (html.toLowerCase().includes('</body>')) {
      html = html.replace(/<\/body>/i, `${SELECTOR_INJECTION_SCRIPT}</body>`);
    } else {
      html += SELECTOR_INJECTION_SCRIPT;
    }
    
    // Inject base tag and meta tags after <head>
    const headInjection = `
      ${baseTag}
      <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self' *;">
      <style>
        /* Trove: Prevent text selection while mapping */
        body.trove-selecting * {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      </style>
    `;
    
    if (html.toLowerCase().includes('<head>')) {
      html = html.replace(/<head>/i, `<head>${headInjection}`);
    } else if (html.toLowerCase().includes('<html>')) {
      html = html.replace(/<html([^>]*)>/i, `<html$1><head>${headInjection}</head>`);
    } else {
      html = `<head>${headInjection}</head>` + html;
    }
    
    // Return the modified HTML
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Remove X-Frame-Options to allow embedding
        'X-Frame-Options': 'ALLOWALL',
        // Allow framing
        'Content-Security-Policy': "frame-ancestors 'self' *",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Failed to fetch: ${message}`, { status: 502 });
  }
}
