# Fixes Applied During Audit

## Critical Fixes

### S-1: SSRF Vulnerability in parse-url (FIXED ✅)
- Added comprehensive IP blocking for private/reserved ranges
- Handles case variations (LOCALHOST, LocalHost)
- Blocks IPv4-mapped IPv6 addresses (::ffff:127.0.0.1)
- Blocks full IPv6 loopback formats
- Blocks cloud metadata endpoints (169.254.169.254, metadata.google.internal)
- Added protocol validation (only HTTP/HTTPS allowed)

### A-1: Missing alt text fallback (FIXED ✅)
- Changed `alt={product.title || 'Product'}` to `alt={product.title || 'Product image'}`
- Location: `/src/app/(app)/add-from-url/page.tsx:279`

### A-2: Missing lang attribute (VERIFIED ✅)
- Already present in both Chrome and Firefox extension popup.html
- `<html lang="en">`

## Medium Fixes

### M-3: GIFTWISE_URL hardcoded (FIXED ✅)
- Added environment variable support with fallback
- Pattern: `typeof __GIFTWISE_URL__ !== 'undefined' ? __GIFTWISE_URL__ : 'http://localhost:3000'`
- Updated in: extension/background.js, extension/popup.js, extension-firefox/background.js, extension-firefox/popup.js

### A-3: Missing ARIA labels on teach-site buttons (FIXED ✅)
- Added `aria-label` to all simulated selection buttons
- Added `aria-hidden="true"` to decorative icons
- Added `role="group"` to element container

### A-4: Progress not announced to screen readers (FIXED ✅)
- Added `aria-live="polite"` region with field change announcements
- Added sr-only class to globals.css

### A-5: Select not properly labeled (FIXED ✅)
- Added `id="list-select"` to select element
- Added `htmlFor="list-select"` to label

### J-1: Add-from-URL not discoverable on mobile (FIXED ✅)
- Added "Add from URL" button to dashboard header (desktop)
- Added prominent card link for mobile users

### Domain validation in site-mappings (FIXED ✅)
- Added proper domain validation regex
- Rejects URLs with protocol (https://)
- Rejects domains with paths
- Validates hostname format

### XSS in extension popup.js (FIXED ✅)
- Added `escapeHtml()` to `product.source` output
- Added `escapeHtml()` to list.id in option values

## Accessibility Improvements

### Added sr-only utility class
- Location: `/src/app/globals.css`
- Screen-reader-only text for accessibility

### Added focus-visible utility
- For keyboard navigation highlighting

## Still TODO

### C-1: Teach-site iframe implementation
- Currently shows placeholder with simulated elements
- Needs real sandboxed iframe with postMessage communication
- This is 2-3 days of work

### M-2: Rate limiting
- Should add rate limiting to parse-url and other endpoints
- Can use Next.js middleware or external service

### M-4: Auth token refresh
- Extension doesn't handle expired tokens
- Should implement refresh flow

### L-1: Dashboard search for many lists
- Need search/filter when user has 10+ lists

### L-3: Extension list dropdown search
- Need filter input when user has 10+ lists
