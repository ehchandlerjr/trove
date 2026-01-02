# Thomistic Design System: Four Distinct Worlds

## The Core Insight

**Not color variations. Four different visual languages.**

Users perceive themes through 3-4 dominant signals:
1. **Font family** (serif vs humanist sans vs rounded sans)
2. **Corner radius** (soft vs clean vs pill)
3. **Density** (airy vs measured vs breathing)
4. **Light/Dark** (brightness)

---

## The Four Worlds

| Theme | Font | Corners | Density | Accent | Vibe |
|-------|------|---------|---------|--------|------|
| **Vellum** | Georgia (serif) | Soft 8px | Airy | Warm Gold | *A beautiful book* |
| **Obsidian** | Georgia (serif) | Soft 8px | Airy | Glowing Gold | *A candlelit study* |
| **Vesper** | Inter (humanist) | Clean 6px | Measured | Fjord Blue | *A Nordic sanctuary* |
| **Scriptorium** | Nunito (organic) | Pill 20px | Breathing | Amber | *A cathedral grove* |

---

## Detailed Specifications

### Vellum: "The Vatican Library"

*A beautiful book. Warm afternoon light on excellent paper.*

Georgia serif, soft corners, airy spacing, warm gold.

**When to use:** Default. Bright environments. Extended reading.

---

### Obsidian: "The Candlelit Study"

*Same design language as Vellum, but dark. Gold glows brighter in darkness.*

Georgia serif, soft corners, airy spacing, glowing gold.

**Key insight:** In physical reality, gold appears MORE vibrant in low light.

**When to use:** Evening. Night owls. Reducing eye strain.

---

### Vesper: "The Nordic Sanctuary"

*Morning light on a fjord. Clean Scandinavian furniture. Hygge.*

Human warmth expressed through clarity and restraint. Not a hacker's terminal—
a place of calm focus where everything has its place.

Inter (humanist sans-serif), clean geometry, measured spacing, fjord blue.

**Design notes:**
- Inter is humanist, not geometric—it has warmth
- Clean 6px corners feel modern but not harsh
- Measured spacing is balanced, not cramped
- Fjord blue is natural, not technical
- Very subtle grain—clean but not sterile
- LIGHT theme (not dark)

**When to use:** Focus work. People who prefer clean, minimal aesthetics.

---

### Scriptorium: "The Cathedral Grove"

*"In every walk with nature one receives far more than he seeks." — John Muir*

The forest floor as sanctuary. Dappled light through the canopy.
Where the redwoods are the columns and the sky is the dome.

Nunito (organic, rounded), pill shapes, breathing space, amber light through leaves.

**Design notes:**
- Nunito's letterforms feel organic, like they grew rather than were drawn
- Pill-shaped corners (20px+) feel like river stones, natural forms
- Extra breathing room—clearings in the forest
- Amber accent like sunlight filtering through the canopy
- Heavy grain texture—bark, forest floor, natural materials
- Soft, diffuse shadows like mist in the valley

**When to use:** Those who find screens cold. Nature lovers. Contemplative work.

---

## Thomistic Principles Applied

| Principle | Application |
|-----------|-------------|
| **Integritas** (Wholeness) | Each theme is internally consistent |
| **Consonantia** (Harmony) | Variables work together, nothing clashes |
| **Claritas** (Radiance) | Each theme has clear, unambiguous identity |

---

## Technical Architecture

All variation through CSS variables. Components use:

```tsx
style={{ borderRadius: 'var(--radius-md)' }}
```

Switching themes is instant. Zero JS logic changes needed.

### Fonts Required

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
```

Georgia is a system font (no import needed).

---

## Interactive Behaviors

Each theme has distinct hover/interaction physics that reinforce its character:

| Theme | Card Hover | Button Feel | Transitions |
|-------|------------|-------------|-------------|
| **Vellum** | Scale + lift (floats off paper) | Bouncy spring | 200ms cubic-bezier |
| **Obsidian** | Golden glow intensifies | Weighted, deliberate | 250ms smooth |
| **Vesper** | Border highlight (no scale) | Instant, no bounce | 120ms fast |
| **Scriptorium** | Grounded warmth shift | Gentle, organic | 300ms slow |

**Key insight:** Vellum and Obsidian cards *float* when hovered. Vesper and Scriptorium cards stay *grounded*.

---

## Integration Status

### Completed ✅
- [x] Four-theme CSS variables in `globals.css`
- [x] Theme provider with localStorage persistence
- [x] System preference detection (Vellum/Obsidian fallback)
- [x] Flash-of-wrong-theme prevention (inline script)
- [x] Theme toggle in app header
- [x] Theme section in Settings page
- [x] Theme showcase page (`/themes`)
- [x] Interactive cards using `card-interactive` class
- [x] Theme-specific button physics
- [x] Google Fonts for Inter and Nunito
- [x] Smooth transitions between themes

### Usage

**Cards:**
```tsx
<Card variant="interactive">...</Card>
```

**Accessing theme programmatically:**
```tsx
const { theme, resolvedTheme, setTheme } = useTheme();
```

**Available theme values:**
- `'vellum'` - Light, warm, serif
- `'obsidian'` - Dark, warm, serif  
- `'vesper'` - Light, clean, sans-serif
- `'scriptorium'` - Dark, organic, rounded
- `'system'` - Auto (Vellum/Obsidian based on OS)

---

## Event Themes (Per-List Overlay)

Event themes layer ON TOP of base themes, adding festive decorations while preserving the user's preferred reading experience.

### Available Events

| Event | Icon | Accent Color | Decorations |
|-------|------|--------------|-------------|
| `none` | ✨ | (uses base) | None |
| `birthday` | 🎂 | Pink (#E85A9A) | Balloons, gifts, confetti |
| `christmas` | 🎄 | Red (#C41E3A) | Snowflakes, ornaments, pine trees |
| `wedding` | 💒 | Gold (#B8860B) | Hearts, rings, roses, arch |
| `easter` | 🐰 | Purple (#9B59B6) | Eggs, tulips, bunnies |
| `baby` | 👶 | Blue (#5DADE2) | Stars, clouds, moon |
| `halloween` | 🎃 | Orange (#E67E22) | Bats, pumpkins, tombstones |
| `hanukkah` | 🕎 | Blue (#1E5AA8) | Stars, menorah, dreidels |
| `graduation` | 🎓 | Navy (#2C3E50) | Caps, diplomas, confetti |

### Components

**FloatingShapes** - Animated shapes that float in the background (balloons, snowflakes, etc.)

**GroundIllustration** - SVG scene at the bottom of the page (grass, trees, snow, etc.)

**ListEventThemeWrapper** - Wraps list content with event decorations

### Database

```sql
-- Add to existing lists table
ALTER TABLE lists 
ADD COLUMN event_theme TEXT DEFAULT 'none';
```

### Usage

```tsx
// In list creation form
const [eventTheme, setEventTheme] = useState<EventThemeId>('none');

// In list page
<ListEventThemeWrapper eventThemeId={list.event_theme || 'none'}>
  {/* list content */}
</ListEventThemeWrapper>
```
