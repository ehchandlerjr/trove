# Trove Product Specification

## Vision Statement
Create the definitive gift list experience—so good that using anything else feels like a compromise.

## Target Users
- **Primary**: Anyone who makes wishlists (birthdays, holidays, weddings, baby showers)
- **Secondary**: Gift givers who want to coordinate purchases
- **Tertiary**: Groups coordinating shared gifts

## Core Value Propositions

### 1. Universal Compatibility
Works with ANY website, not just Amazon or specific retailers. The crowdsourced HTML mapping system means the community teaches the app to understand new sites.

### 2. True Price Intelligence
Real-time price tracking from the actual source. See price history, get notified of drops, know when you're getting a deal.

### 3. Coordination Without Spoilers
Gift givers see what's been claimed. List owners don't. No duplicate gifts, no ruined surprises.

### 4. Beautiful Simplicity
Every feature passes the "grandma test" (intuitive enough for non-tech users) AND the "engineer test" (powerful enough for demanding users).

## Feature Categories

### List Management
- Create unlimited wishlists with custom names, emojis, descriptions
- Add items manually or via URL
- Organize with priorities, notes, quantities
- Archive/unarchive lists
- Set event dates with countdown

### Item Intelligence
- Auto-detect product info from URLs (title, image, price)
- Manual field mapping for unsupported sites
- Price tracking with history
- Sale detection and notifications
- Support for any currency

### Sharing & Collaboration
- Share via unique link (no account required to view)
- Privacy controls (private/shared/public)
- Claim items to prevent duplicates
- Anonymous claiming option
- Group lists for shared households

### Browser Extension
- One-click "Add to Wishlist" from any page
- Capture current page state
- Quick-add vs. detailed add options
- Price tracking opt-in

## Non-Goals (Explicit Exclusions)
- Social networking features (no feeds, no discovery)
- Marketplace/purchasing (we don't sell anything)
- Generic note-taking (focused on gifts)
- Complex permission systems (keep it simple)

## Success Metrics
1. Time to create first list < 60 seconds
2. Time to add item from URL < 10 seconds
3. Successful price detection > 80% of popular sites
4. User activation (create list + add item) > 50%
5. Share rate (lists shared) > 30%

## Design Principles
1. **Calm Interface**: No aggressive notifications, no dark patterns
2. **Progressive Disclosure**: Simple by default, powerful on demand
3. **Mobile-First**: Every feature works beautifully on phones
4. **Fast**: Perceived load time < 1 second
5. **Accessible**: WCAG 2.1 AA compliance
