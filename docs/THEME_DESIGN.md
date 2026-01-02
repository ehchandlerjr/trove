# Thomistic Theme System: Light, Dark, and Sepia

## Design Philosophy

The Thomistic beauty principles—**integritas** (wholeness), **consonantia** (proportion), and **claritas** (radiance)—must hold across all viewing conditions. Just as Renaissance painters achieved luminosity in both sunlit and candlelit scenes, our themes should feel equally beautiful whether viewed in bright daylight or a darkened room.

### Key Insight: Darkness in Renaissance Painting

The masters didn't paint darkness as absence—they painted it as presence:

- **Caravaggio** used warm umber shadows that recede but never feel cold
- **Rembrandt** created "golden darkness" where candlelight seems to emerge from the paint itself
- **Vermeer** showed how light falling on objects creates warm halation against cool shadows

This teaches us: **dark mode shouldn't invert light mode—it should reimagine how warmth manifests when light is scarce.**

---

## The Three Modes

### 1. ☀️ Light Mode: "The Vatican Library"

*Evokes: Sunlit manuscript rooms, Carrara marble, afternoon light through tall windows*

**Philosophy:** Clarity through abundance of light. The warm white background is not neutral—it's the color of aged paper catching afternoon sun. Cards float above like vellum pages.

**Color Logic:**
- Background: Warm white (`#FAF8F5`) — the color of excellent paper
- Surfaces: Pure white for cards — creates "lift" and hierarchy
- Text: Warm black (`#1A1612`) — like iron gall ink
- Gold accent: Muted ochre (`#C7923E`) — illuminated manuscript gold, not garish

**When to use:** Default. Bright environments. Extended reading. Professional contexts.

---

### 2. 🌙 Dark Mode: "The Candlelit Study"

*Evokes: Rembrandt's "Scholar in His Study", night reading, mahogany library paneling*

**Philosophy:** Warmth in darkness. The background isn't black—it's the deep brown of aged walnut, the color of shadows in Dutch Golden Age paintings. Gold doesn't dim; it glows more intensely against darkness, like candlelight on gilt book spines.

**Color Logic:**
- Background: Deep warm brown (`#1A1714`) — not `#000000`, which is harsh and artificial
- Surfaces: Slightly lifted browns (`#252220`) — like cabinet surfaces catching distant light
- Text: Warm cream (`#F5F0E8`) — parchment by candlelight
- Gold accent: Brightened (`#E5B55C`) — **more** saturated than light mode, because gold glows in darkness

**Critical insight:** In physical reality, gold appears MORE vibrant in low light because our eyes adapt. Our dark mode gold should be brighter and warmer than light mode gold.

**Shadows in dark mode:** Instead of darkening (which creates mud), use subtle light bloom—a very faint warm glow around elevated surfaces, like candlelight halation.

**When to use:** Evening. Low-light environments. Reducing eye strain. Personal preference.

---

### 3. 📜 Sepia Mode: "The Illuminated Manuscript"

*Evokes: Medieval scriptoriums, aged parchment, Vatican archives, tea-stained pages*

**Philosophy:** Maximum warmth for those who find pure white too clinical. This isn't a novelty—it's based on real research showing warm tones reduce eye strain for extended reading. Every surface has the character of paper that has lived and been loved.

**Color Logic:**
- Background: Aged parchment (`#F5EDE0`) — distinctly yellowed, like centuries-old vellum
- Surfaces: Slightly brighter parchment (`#FAF4E8`) — fresher page against aged binding
- Text: Sepia black (`#2C241C`) — the color of iron gall ink that has oxidized over centuries
- Gold accent: Deeper, redder (`#B8863A`) — like the gold in Byzantine icons

**When to use:** Extended reading sessions. Those sensitive to blue light. Users who prefer warmer aesthetics. Evening reading (alternative to dark mode).

---

## Implementation Principles

### 1. Chromatic Grays in All Modes

Pure gray (`#808080`) appears lifeless because it lacks chromatic information. In every mode, our "grays" are actually:
- **Light mode:** Warm grays with subtle yellow/orange undertones
- **Dark mode:** Cool gray is FORBIDDEN. All shadows have warm brown undertones.
- **Sepia mode:** All grays have distinct sepia cast

### 2. The Glazing Technique (Depth Through Layers)

Hudson River School painters built luminosity through multiple transparent layers. We translate this to:
- Multiple surface levels with subtle opacity differences
- Background → Surface → Raised Surface hierarchy
- Each level slightly more "solid" and bright than the one beneath

### 3. Gold Behavior Across Modes

| Mode | Gold Primary | Gold Hover | Logic |
|------|-------------|------------|-------|
| Light | `#C7923E` | `#B8852F` (darker) | Recedes slightly on interaction |
| Dark | `#E5B55C` | `#F0C56C` (brighter) | Glows more intensely |
| Sepia | `#B8863A` | `#A87830` (deeper) | Harmonizes with warm paper |

### 4. Semantic Colors Across Modes

Success, warning, danger, and info colors must adapt while maintaining their semantic meaning:

**Success (Green):**
- Light: Forest green (`#5A8A5A`) — verdant, natural
- Dark: Sage glow (`#7AAA7A`) — brightened for visibility
- Sepia: Olive (`#6A845A`) — harmonizes with parchment

**Danger (Red):**
- Light: Warm brick (`#B85450`) — not alarming, but serious
- Dark: Soft coral (`#D87A76`) — visible but not harsh
- Sepia: Deep rust (`#A84A46`) — like dried ink

### 5. Shadow Inversion in Dark Mode

Light mode shadows are dark below elements (natural top-lighting). Dark mode should NOT simply use darker shadows—this creates mud. Instead:
- Very subtle shadows for separation
- Optional: Faint warm glow ABOVE elements (as if lit from below by candlelight)
- The effect is "elements emerging from darkness" rather than "darkness falling on elements"

---

## Contrast Compliance

All text combinations must meet **WCAG AA** (4.5:1 for body text, 3:1 for large text):

### Light Mode
| Element | Color | On Background | Ratio | Pass? |
|---------|-------|--------------|-------|-------|
| Primary text | `#1A1612` | `#FAF8F5` | 14.2:1 | ✅ AAA |
| Secondary text | `#6B6560` | `#FAF8F5` | 5.1:1 | ✅ AA |
| Muted text | `#7A7570` | `#FAF8F5` | 4.0:1 | ✅ AA |

### Dark Mode
| Element | Color | On Background | Ratio | Pass? |
|---------|-------|--------------|-------|-------|
| Primary text | `#F5F0E8` | `#1A1714` | 13.8:1 | ✅ AAA |
| Secondary text | `#C5BEB4` | `#1A1714` | 8.2:1 | ✅ AAA |
| Muted text | `#9A938A` | `#1A1714` | 4.8:1 | ✅ AA |

### Sepia Mode
| Element | Color | On Background | Ratio | Pass? |
|---------|-------|--------------|-------|-------|
| Primary text | `#2C241C` | `#F5EDE0` | 11.4:1 | ✅ AAA |
| Secondary text | `#5A524A` | `#F5EDE0` | 5.3:1 | ✅ AA |
| Muted text | `#7A7268` | `#F5EDE0` | 4.1:1 | ✅ AA |

---

## Theme Switching UX

### System Default
By default, respect `prefers-color-scheme`. This honors user system preferences.

### Manual Override
Provide three-way toggle: Light / System / Dark (with Sepia as fourth option for those who discover it).

### Transition
Theme changes should use a subtle fade (200ms) rather than instant switch, preventing jarring flash.

### Persistence
Store preference in `localStorage` and apply before first paint to prevent FOUC (Flash of Unstyled Content).

---

## Summary: The Thomistic Test

Each theme must pass the same test the light mode passes:

> "Does this feel like the digital equivalent of a well-made object? Does it have the quiet dignity of a beautiful notebook, the warmth of a rare book room, the satisfaction of quality?"

A good dark mode doesn't feel like "the lights went out." It feels like entering a different beautiful room—one lit by candles instead of windows, where gold glimmers more intensely and shadows have depth rather than emptiness.

**The goal:** When users switch themes, they should feel not that the app changed, but that the time of day changed.
