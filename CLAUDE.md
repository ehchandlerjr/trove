# Trove - Project Context

## Vision
The "Notion of gift apps"—quiet excellence across every dimension. Not one clever trick, but hyper-usability across a complete feature set. The app that makes people say "oh, it does that too?" every time they need something.

**Core Innovation**: Crowdsourced HTML mapping—users teach the system to understand any website through an intuitive point-and-click interface. These mappings are shared globally, creating a self-maintaining registry.

**Design Philosophy**: Thomistic beauty—integritas (wholeness), consonantia (harmony), claritas (radiance). Beauty emerges from such complete fitness to purpose that nothing can be added or removed.

## Documentation
- **`/docs/PRODUCT_SPEC.md`**: Complete feature specification (the north star)
- **`/docs/ROADMAP.md`**: Development sequence (concentric circles)
- **`/docs/TEACH_SITE_GUIDE.md`**: Site compatibility and selector strategy
- **This file**: Quick reference for development sessions

## Key Principles
- **Progressive Disclosure**: Simple surface, depth on demand
- **Grandma to Engineer**: Every feature passes both tests
- **Concentric Circles**: Each development stage is a complete, shippable product
- **Extend, Never Refactor**: Architecture supports Circle 5 from day one

## Current State - Circle 1 COMPLETE ✅ + Circle 2 AUDITED & HARDENED ✅

### What's Built
- ✅ Next.js 15 + Supabase + Tailwind v4 foundation
- ✅ Type system with branded IDs and Result types
- ✅ Database schema with RLS policies
- ✅ Landing page with hero and features
- ✅ Auth flow (login, signup, callback)
- ✅ Dashboard with lists grid + Add from URL link
- ✅ Create new lists with emoji, description, visibility
- ✅ List detail view with items
- ✅ Add items (manual entry)
- ✅ **Inline item editing** (click to edit, keyboard shortcuts)
- ✅ Delete items with confirmation
- ✅ **Delete lists** with type-to-confirm safeguard
- ✅ Share lists via unique code
- ✅ Shared list public view (`/share/[code]`)
- ✅ Claim items (for gift givers)
- ✅ **User settings page** (profile editing)
- ✅ **Element Selector Prototype** (the core innovation!)
- ✅ **Thomistic Design System** (warm colors, spring physics, 8pt grid)
- ✅ **Error pages** (404 not-found, runtime error with recovery)
- ✅ **OpenGraph images** (dynamic social previews for shared lists)
- ✅ **iOS viewport fix** (prevents zoom on input focus)
- ✅ **Global loading state**
- ✅ **Security hardening** (SSRF protection, XSS escaping, input validation)
- ✅ **Accessibility improvements** (ARIA labels, sr-only, keyboard nav)

## Design System - Thomistic Beauty

Based on Aquinas's conditions for beauty: integritas, consonantia, claritas.

### Four Theme Worlds

Not color variations—four distinct visual languages:

| Theme | Font | Corners | Vibe |
|-------|------|---------|------|
| **Vellum** | Georgia serif | Soft 8px | A beautiful book |
| **Obsidian** | Georgia serif | Soft 8px | A candlelit study |
| **Vesper** | Inter humanist | Clean 6px | A Nordic sanctuary |
| **Scriptorium** | Nunito organic | Pill 20px | A cathedral grove |

### Event Themes (Per-List Overlay)

Festive decorations that layer on top of base themes:
- `birthday` 🎂 - Balloons, confetti, gifts
- `christmas` 🎄 - Snowflakes, pine trees, ornaments
- `wedding` 💒 - Hearts, rings, roses
- `easter` 🐰 - Eggs, tulips, bunnies
- `halloween` 🎃 - Bats, pumpkins, tombstones
- And more (baby, hanukkah, graduation)

### Color Palette (Chromatic Warmth)
```css
--color-bg: #FAF8F5;           /* Warm white */
--color-surface: #FFFFFF;       /* Pure white cards */
--color-text: #1A1612;          /* Warm black */
--color-text-secondary: #6B6560;
--color-accent: #C7923E;        /* Muted ochre gold */
--color-accent-hover: #B8852F;
```

### Typography
- **Display**: Georgia serif for headings (humanist warmth)
- **Body**: System fonts for readability
- **Scale**: Major Third (1.25 ratio)

### Spacing
- **8pt Grid**: All spacing uses multiples of 8 (8, 16, 24, 32, 48, 64px)
- **Internal ≤ External**: Padding inside elements ≤ margin outside

### Motion
- CSS transforms for spring-like feel (scale on hover/tap)
- Reserved for meaningful moments, not decoration
- Framer Motion available for complex animations

### Visual Depth
- Chromatic grays (warm-tinted, not pure gray)
- Layered shadows with warm tints
- Subtle grain texture on surfaces (`.surface-grain`)

### Routes
```
/                 - Landing page
/login            - Sign in
/signup           - Create account
/dashboard        - Lists overview (protected)
/lists/new        - Create list (protected)
/lists/[id]       - List detail + items (protected)
/settings         - User profile (protected)
/demo             - Element selector prototype (protected)
/share/[code]     - Public shared list view
/add-from-url     - Add item by pasting URL (protected)
/teach-site       - Teach Trove about new sites (protected)
```

### Key Components
```
components/
├── ui/                    # Design system
│   ├── button.tsx         # Spring-like transforms, warm gold
│   ├── input.tsx          # Warm borders, gold focus ring
│   ├── textarea.tsx       
│   ├── card.tsx           # Grain texture, interactive lift
│   ├── badge.tsx          # Muted semantic colors
│   └── avatar.tsx
└── features/              # Feature components
    ├── app-header.tsx     # Navigation + user menu
    ├── add-item-form.tsx  # Add items to list
    ├── editable-item.tsx  # Inline item editing w/ Framer Motion
    ├── item-card.tsx      # Item display (read-only)
    ├── share-dialog.tsx   # Share link modal
    ├── claim-button.tsx   # Claim item for gifters
    ├── delete-list-button.tsx  # Delete with confirmation
    ├── profile-form.tsx   # Edit user profile
    └── element-selector.tsx    # ⭐ THE CORE INNOVATION
```

### API Routes (Circle 2)
```
/api/lists          - GET user's lists (for extension)
/api/items          - POST create item (for extension)
/api/site-mappings  - GET/POST/PATCH crowdsourced selectors
/api/parse-url      - POST extract product from URL
/api/proxy-page     - GET proxied page with selector injection
```

## Development Circles

### Circle 1: The Perfect List ✅ COMPLETE
A fully functional manual wishlist app with Thomistic design system.

### Circle 2: The Price Edge ✅ CORE COMPLETE (Audited)
- ✅ Chrome Extension (Manifest V3)
  - Content script: JSON-LD, Open Graph, meta tag, DOM extraction
  - Background service worker: auth, context menu, API calls
  - Popup UI: product preview, list selection, add flow
- ✅ Firefox Extension (Manifest V3 + polyfill)
- ✅ API Routes
  - `/api/lists` - Get user's lists
  - `/api/items` - Create items from extension (records price snapshots)
  - `/api/site-mappings` - Crowdsourced selector registry
  - `/api/parse-url` - Server-side product extraction with SSRF protection
  - `/api/proxy-page` - Proxied page loading with selector injection
- ✅ Add from URL page (with "Teach this site" fallback)
- ✅ Teach Site page with real iframe implementation (core innovation!)
- ✅ **Multi-image support** - Users can select multiple product photos
- ✅ **Multi-strategy extraction system** - JSON-LD → OpenGraph → Patterns → Heuristics
- ✅ **Pattern library** - Known selectors for Amazon, Shopify, Etsy, eBay, etc.
- ✅ Types for site mappings and price tracking
- ✅ Multi-persona audit complete (see CIRCLE_2_AUDIT.md)
- ✅ Teach-site iframe with postMessage communication
- ✅ CSS selector generation from clicked elements
- ✅ SSRF protection in parse-url and proxy-page (IP blocking, protocol validation)
- ✅ Price history display on items (sparkline + expandable details)
- ✅ Site compatibility documented (see docs/TEACH_SITE_GUIDE.md)
- ✅ **Catalog mode** for sites without product URLs (mycomicshop-style)
  - Row pattern detection and sibling matching
  - Relative selector generation within rows
  - Identity fields for item matching across fetches
- [ ] Sale notifications (email/push)
- [ ] Mobile share sheet (PWA)

### Circle 3: The Gift Graph
- [ ] Follow other users
- [ ] Notifications
- [ ] Group lists
- [ ] Activity feed

### Circle 4: Intelligence
- [ ] AI suggestions
- [ ] Gift ideas
- [ ] Price predictions

### Circle 5: Platform
- [ ] Public API
- [ ] Integrations
- [ ] Enterprise features

## Recommended Audits Before Circle 2
1. **UX Walkthrough** — Can grandma create a list? Can engineer find what they need?
2. **Edge Case Audit** — Empty states, loading states, error states, long text, mobile
3. **Accessibility Audit** — Keyboard nav, screen readers, color contrast
4. **Security Audit** — RLS policies actually work? Auth flows secure?

## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS v4 |
| Auth | Supabase Auth |
| Validation | Zod |
| Icons | Lucide React |
| Animation | Framer Motion (optional) |

## Key Files
- `/supabase/schema.sql` - Database schema (run in Supabase SQL editor)
- `/src/app/globals.css` - Design system tokens and utilities
- `/src/lib/core/types.ts` - Type definitions with branded IDs
- `/src/lib/core/schemas.ts` - Zod validation schemas
- `/src/lib/db/server.ts` - Server-side Supabase client
- `/src/lib/db/client.ts` - Browser Supabase client
- `/src/lib/db/database.types.ts` - Database type definitions
- `/src/lib/extraction/extraction-service.ts` - Multi-strategy extraction (dialect library)
- `/src/components/ui/` - Reusable UI components
- `/src/components/features/` - Feature-specific components
- `/src/components/features/catalog-mode.tsx` - Catalog site teaching UI
- `/src/components/features/price-history.tsx` - Price sparkline component

## Commands
```bash
npm run dev          # Development server
npm run build        # Production build  
npm run typecheck    # TypeScript check
```

## Setup Instructions
1. Create a Supabase project at supabase.com
2. Run `/supabase/schema.sql` in the SQL editor
3. Copy `.env.example` to `.env.local`
4. Add your Supabase URL and anon key
5. Run `npm install && npm run dev`

## Architecture Notes

### Type Safety
- Branded IDs prevent mixing `UserId` with `ListId`
- Result types for explicit error handling
- Zod schemas for runtime validation at API boundaries

### Component Design
- UI components are generic, stateless, composable
- Feature components encapsulate business logic
- Server components for data fetching, client components for interactivity

### Database Design
- Row Level Security (RLS) for multi-tenant data isolation
- Triggers for auto-timestamps and profile creation
- Indexes on foreign keys and frequently queried columns

### Code Quality Assessment (B+)
**Strengths**: Branded IDs, Result types, proper RLS, clean separation
**For Gold Standard**: Would need service layer, proper error boundaries, tests
