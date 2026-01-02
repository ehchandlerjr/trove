# Trove Development Roadmap

## Philosophy: Concentric Circles

Each circle is a **complete, shippable product**. We don't build half-features. Each ring adds value while the core remains stable.

---

## Circle 1: The Perfect List ⬅️ CURRENT

**Goal**: The best manual wishlist app that exists.

### Features
- [x] User authentication (signup, login, logout)
- [x] Create wishlists with name, emoji, description
- [x] Add items manually (title, price, URL, notes)
- [x] View and manage lists
- [x] Share lists via unique link
- [x] Claim items (for gift givers)
- [ ] Edit items inline
- [ ] Reorder items (drag & drop)
- [ ] Delete lists
- [ ] User profile settings

### Deliverable
Users can:
1. Create an account
2. Make lists
3. Add items manually
4. Share via link
5. Have friends claim items without spoiling surprises

---

## Circle 2: The Price Edge

**Goal**: The HTML mapping innovation + price intelligence.

### Features
- Browser extension (Chrome)
- Auto-detect product info (Open Graph, JSON-LD, meta tags)
- "Help us understand this page" UI (element selector)
- Per-domain CSS selector storage
- Global mapping registry
- Price tracking with history
- Sale notifications

### Deliverable
Users can:
1. One-click add items from any website
2. Teach the system about new sites
3. See real-time prices
4. Get notified when prices drop

---

## Circle 3: The Gift Graph

**Goal**: Lists as nodes in a relationship network.

### Features
- Follow other users' public lists
- Event-based notifications
- Group lists (household, friend group)
- Gift coordination features
- Activity feed (new items, claims)

---

## Circle 4: Intelligence

**Goal**: AI-powered suggestions and insights.

### Features
- "Similar items" suggestions
- Gift ideas based on interests
- Price prediction
- "Best time to buy" insights
- Budget tracking

---

## Circle 5: Platform

**Goal**: Ecosystem and integrations.

### Features
- Public API
- Retailer partnerships
- Import from other wishlist services
- Export options
- Enterprise features (team gifting)

---

## Current Priority

Focus entirely on **Circle 1** until it's polished. The core list experience must be perfect before adding complexity.

### Next Actions
1. Add inline item editing
2. Implement drag-and-drop reordering
3. Add list deletion with confirmation
4. Build user settings page
5. Polish mobile experience
6. Add loading states and error handling throughout
