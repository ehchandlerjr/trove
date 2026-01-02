# Teach-Site Feature: Site Compatibility Guide

## How It Works

The teach-site feature allows users to train Trove to understand product pages from any website through a point-and-click interface.

### Technical Flow

1. **User enters product URL** → `/teach-site?url=...`
2. **Proxy fetches page** → `/api/proxy-page?url=...` fetches HTML with injected selector script
3. **Page loads in sandboxed iframe** → `sandbox="allow-same-origin allow-scripts"`
4. **User clicks elements** → postMessage sends selector + preview to parent
5. **Mappings saved** → Stored in `site_mappings` table with domain/path/selectors

### Multi-Image Support

Users can select multiple product images:
- Click the first image → counter shows "1 image selected"
- Click additional images → counter increments
- Click "Done with images" → moves to next field
- All image selectors are stored as an array

## Catalog-Style Sites (No Product URLs)

Some sites don't have individual product pages—they show inventory lists where you pick items.

**Examples:**
- mycomicshop.com (comic book inventory)
- Auction sites (lots without stable URLs)
- Restaurant menus
- B2B wholesale catalogs

### The Problem

These sites break the "one URL = one product" assumption:
- No stable URL to link back to
- No way to track price changes
- Product identified by position in a list, not by URL

### Current Limitation

Trove currently cannot fully support catalog-style sites because:
1. We can't store a URL that goes directly to the product
2. We can't automatically re-check prices without a stable URL
3. The item's position in the list may change over time

### Future Solution: Catalog Mode

A planned enhancement would:
1. Let user select a **row pattern** (the repeating element)
2. Map fields **relative to the row** (title, price, image within each row)
3. Store a **search query** instead of URL (title, issue, grade, etc.)
4. Re-search to find the item for price updates

**Data structure for catalog items:**
```typescript
interface CatalogItem {
  type: 'catalog';
  domain: 'mycomicshop.com';
  searchQuery: {
    title: 'Amazing Spider-Man',
    issue: '129',
    grade: 'VF 8.0',
  };
  // To check price, we re-search and find matching row
}
```

### Workaround for Now

For catalog sites, users can:
1. Manually add the item with all details
2. Accept that price tracking won't work for this store
3. Use the notes field to record search terms for finding it again

### Sites That Work Well

✅ **Works out of the box:**
- Sites with server-rendered HTML
- Sites that don't block iframes (no `X-Frame-Options: DENY`)
- Sites without aggressive bot detection
- Sites with semantic HTML structure (IDs, data attributes, meaningful classes)

**Examples likely to work:**
- Small boutique shops (custom Shopify, Squarespace, Wix)
- Many independent retailers
- Sites built with older frameworks

### Sites That May Have Issues

⚠️ **May require workarounds:**

| Issue | Symptoms | Workaround |
|-------|----------|------------|
| **X-Frame-Options: DENY** | Iframe refuses to load | We inject permissive CSP headers, but browser may still block |
| **CSP frame-ancestors** | Iframe blocked | Same as above |
| **Heavy client-side rendering** | Content appears blank or incomplete | Wait for page load, some content may never appear |
| **Bot detection** | CAPTCHA, blank page, or redirect | User may need to try different product |
| **Lazy-loaded images** | Image selector returns placeholder | User should scroll to load images first |

**Sites known to have issues:**
- Amazon (aggressive bot detection, dynamic rendering)
- Target (strong CSP policies)
- Walmart (bot detection)
- Nike (heavy SPA architecture)

### Best Practices for Users

1. **Try a specific product page**, not a category or homepage
2. **Wait for page to fully load** before clicking elements
3. **Scroll down** to trigger lazy-loaded images
4. **If blocked**, try a different product on the same site
5. **For stubborn sites**, add items manually and teach a different site

### Fallback Behavior

When iframe loading fails:
- 20-second timeout shows friendly error message
- User can click "See Original" to open page in new tab
- Manual entry remains always available

### Future Improvements

- [ ] Browser extension can bypass iframe restrictions
- [ ] Screenshot-based selection as fallback
- [ ] Pre-built mappings for popular sites (Amazon, Target, etc.)
- [ ] Machine learning to auto-detect product elements

## Selector Generation Strategy

The injected script generates stable CSS selectors using this priority:

1. **ID** (most stable) - `#product-title`
2. **Data attributes** - `[data-testid="price"]`, `[data-sku="123"]`
3. **Semantic path** - `article.product-card > h1.title`
4. **nth-child fallback** - `div:nth-child(2) > span:nth-child(1)`

### What Makes Good Selectors

- Unique IDs that don't change per page load
- Data attributes (often used for testing, very stable)
- Semantic class names (`.product-name`, not `.text-lg`)
- Short paths (fewer levels = more stable)

### What Makes Bad Selectors

- Dynamic IDs (`#react-component-89237`)
- Hash-based classes (`.css-1a2b3c`)
- Deep nth-child paths (fragile to layout changes)
- Generated utility classes (`.flex.mt-4.text-sm`)

## Multi-Strategy Extraction System

The `/api/parse-url` endpoint uses a "dialect library" approach—trying multiple extraction strategies in order of reliability:

### Strategy Priority

| Order | Strategy | Confidence | Description |
|-------|----------|------------|-------------|
| 1 | JSON-LD | 95% | Structured data in `<script type="application/ld+json">` |
| 2 | Site Mapping | 80% | Crowdsourced selectors from teach-site |
| 3 | Open Graph | 80% | `og:title`, `og:image`, `product:price:amount` |
| 4 | Pattern Library | 60-70% | Known selectors for Amazon, Shopify, Etsy, etc. |
| 5 | Heuristic | 30% | Regex for prices, first `<h1>` for title |
| 6 | Meta Tags | 40% | `<title>` and `<meta name="description">` |

### Pattern Library

Built-in patterns for popular e-commerce platforms:

- **amazon-style** - Works on amazon.com, .co.uk, .de, .ca
- **shopify-style** - Common Shopify themes
- **woocommerce-style** - WordPress WooCommerce sites
- **etsy-style** - Etsy listings
- **ebay-style** - eBay item pages
- **target-style** - Target.com (tricky due to React)

### Learning from Teach-Site

When users teach a new site:
1. Their selectors are stored in `site_mappings` table
2. Future extractions for that domain use the learned selectors
3. Confidence increases as more users verify the same selectors
4. Pattern similarity analysis can suggest mappings for related sites
