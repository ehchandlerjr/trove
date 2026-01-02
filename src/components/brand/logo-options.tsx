'use client';

/**
 * Trove Logo Design Options
 * 
 * Design Philosophy: Thomistic Beauty
 * - Integritas (wholeness): Complete, unified forms
 * - Consonantia (harmony): Balanced proportions, golden ratio
 * - Claritas (radiance): Clarity of purpose, luminous quality
 * 
 * Concept: "Trove" = treasure, collection, discovery
 * Visual metaphors: Gem, chest, collection, gift, discovery
 */

import React from 'react';

// Shared constants based on Thomistic design system
const COLORS = {
  gold: '#C7923E',        // Muted ochre - primary accent
  goldLight: '#D4A84E',   // Lighter gold for gradients
  goldDark: '#B8852F',    // Darker gold for depth
  warmBlack: '#1A1612',   // Text color
  warmWhite: '#FAF8F5',   // Background
  surface: '#FFFFFF',     // Card surface
};

/**
 * Option 1: The Faceted Gem
 * 
 * Concept: A cut gemstone viewed from above, showing facets
 * Thomistic alignment:
 * - Integritas: Single, complete geometric form
 * - Consonantia: Hexagonal symmetry, mathematical precision
 * - Claritas: Light plays across facets, radiant quality
 * 
 * Best for: App icon, favicons, compact spaces
 */
export function LogoGem({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
      aria-label="Trove logo - faceted gem"
    >
      {/* Outer hexagon - the gem's crown */}
      <polygon 
        points="20,2 36,11 36,29 20,38 4,29 4,11" 
        fill={COLORS.gold}
        opacity="0.9"
      />
      {/* Inner facet - lighter, creates depth */}
      <polygon 
        points="20,8 30,14 30,26 20,32 10,26 10,14" 
        fill={COLORS.goldLight}
      />
      {/* Center facet - brightest, the "table" of the gem */}
      <polygon 
        points="20,14 26,18 26,24 20,28 14,24 14,18" 
        fill={COLORS.surface}
        opacity="0.6"
      />
      {/* Top highlight - radiance */}
      <polygon 
        points="20,8 26,12 20,16 14,12" 
        fill={COLORS.surface}
        opacity="0.4"
      />
    </svg>
  );
}

/**
 * Option 2: The Open Chest
 * 
 * Concept: A treasure chest lid opening, revealing light within
 * Thomistic alignment:
 * - Integritas: Complete narrative in one image (discovery)
 * - Consonantia: Classical chest proportions, golden ratio lid angle
 * - Claritas: Light emanating from within = radiance of gifts
 * 
 * Best for: Marketing, larger displays
 */
export function LogoChest({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
      aria-label="Trove logo - treasure chest"
    >
      {/* Chest body */}
      <rect 
        x="4" y="18" 
        width="32" height="18" 
        rx="2" 
        fill={COLORS.goldDark}
      />
      {/* Chest lid - slightly open */}
      <path 
        d="M4,18 L4,12 C4,10 6,8 8,8 L32,8 C34,8 36,10 36,12 L36,18" 
        fill={COLORS.gold}
      />
      {/* Lid opening angle */}
      <path 
        d="M6,18 L6,10 C6,9 7,8 8,8 L32,8 C33,8 34,9 34,10 L34,14" 
        fill={COLORS.goldLight}
        transform="rotate(-15, 6, 18)"
      />
      {/* Light rays from inside */}
      <path 
        d="M18,16 L20,4 M22,16 L20,4 M16,17 L12,6 M24,17 L28,6" 
        stroke={COLORS.goldLight}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Lock clasp */}
      <circle cx="20" cy="22" r="3" fill={COLORS.warmBlack} opacity="0.3" />
    </svg>
  );
}

/**
 * Option 3: The Gathered Collection
 * 
 * Concept: Three overlapping circles/gems representing a curated collection
 * Thomistic alignment:
 * - Integritas: Trinity/triad = classical completeness
 * - Consonantia: Overlapping creates visual rhythm
 * - Claritas: Simplicity allows meaning to shine through
 * 
 * Best for: Modern, minimal contexts
 */
export function LogoCollection({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
      aria-label="Trove logo - collection"
    >
      {/* Three overlapping circles - Borromean-inspired */}
      <circle cx="14" cy="22" r="10" fill={COLORS.gold} opacity="0.8" />
      <circle cx="26" cy="22" r="10" fill={COLORS.goldLight} opacity="0.8" />
      <circle cx="20" cy="12" r="10" fill={COLORS.goldDark} opacity="0.8" />
      {/* Center intersection - brightest */}
      <circle cx="20" cy="18" r="4" fill={COLORS.surface} opacity="0.5" />
    </svg>
  );
}

/**
 * Option 4: The Gift Ribbon
 * 
 * Concept: A stylized "T" that evokes a gift ribbon bow
 * Thomistic alignment:
 * - Integritas: Letter + symbol unified
 * - Consonantia: Ribbon loops follow golden spiral proportions
 * - Claritas: Immediately readable as both "T" and "gift"
 * 
 * Best for: Text-adjacent use, wordmarks
 */
export function LogoRibbon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
      aria-label="Trove logo - gift ribbon T"
    >
      {/* Main T stem */}
      <rect x="17" y="14" width="6" height="22" rx="3" fill={COLORS.gold} />
      {/* T crossbar */}
      <rect x="6" y="8" width="28" height="6" rx="3" fill={COLORS.gold} />
      {/* Left ribbon loop */}
      <ellipse cx="12" cy="8" rx="6" ry="5" fill="none" stroke={COLORS.goldDark} strokeWidth="3" />
      {/* Right ribbon loop */}
      <ellipse cx="28" cy="8" rx="6" ry="5" fill="none" stroke={COLORS.goldDark} strokeWidth="3" />
      {/* Center knot */}
      <circle cx="20" cy="11" r="4" fill={COLORS.goldLight} />
    </svg>
  );
}

/**
 * Option 5: The Illuminated T (Recommended)
 * 
 * Concept: A drop cap "T" inspired by illuminated manuscripts
 * Thomistic alignment:
 * - Integritas: Complete letterform with integrated ornament
 * - Consonantia: Classical calligraphic proportions
 * - Claritas: Warm glow suggests both treasure and revelation
 * 
 * Best for: Primary brand mark, aligns with Vatican/manuscript theme
 */
export function LogoIlluminated({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
      aria-label="Trove logo - illuminated T"
    >
      {/* Background glow - the "illumination" */}
      <circle cx="20" cy="20" r="18" fill={COLORS.gold} opacity="0.15" />
      <circle cx="20" cy="20" r="14" fill={COLORS.gold} opacity="0.1" />
      
      {/* Decorative frame - manuscript border */}
      <rect 
        x="6" y="6" 
        width="28" height="28" 
        rx="2" 
        fill="none" 
        stroke={COLORS.gold}
        strokeWidth="1.5"
        opacity="0.4"
      />
      
      {/* The T - Georgia-inspired serif letterform */}
      <path 
        d="M10,12 L30,12 L30,16 L23,16 L23,32 L17,32 L17,16 L10,16 Z"
        fill={COLORS.gold}
      />
      
      {/* Serifs - classical detail */}
      <rect x="8" y="11" width="4" height="2" fill={COLORS.goldDark} rx="0.5" />
      <rect x="28" y="11" width="4" height="2" fill={COLORS.goldDark} rx="0.5" />
      <rect x="15" y="31" width="4" height="2" fill={COLORS.goldDark} rx="0.5" />
      <rect x="21" y="31" width="4" height="2" fill={COLORS.goldDark} rx="0.5" />
      
      {/* Inner highlight - claritas */}
      <rect x="18" y="17" width="4" height="14" fill={COLORS.surface} opacity="0.2" />
    </svg>
  );
}

/**
 * Full Logo with Wordmark
 * Combines icon with "Trove" text in Georgia
 */
interface FullLogoProps {
  icon?: 'gem' | 'chest' | 'collection' | 'ribbon' | 'illuminated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TroveLogo({ icon = 'gem', size = 'md', className = '' }: FullLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };
  
  const IconComponent = {
    gem: LogoGem,
    chest: LogoChest,
    collection: LogoCollection,
    ribbon: LogoRibbon,
    illuminated: LogoIlluminated,
  }[icon];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconComponent size={sizes[size].icon} />
      <span 
        className={`font-serif font-semibold ${sizes[size].text}`}
        style={{ 
          color: COLORS.warmBlack,
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.02em',
        }}
      >
        Trove
      </span>
    </div>
  );
}

/**
 * Logo Preview Component - for comparing all options
 */
export function LogoShowcase() {
  return (
    <div className="p-8 space-y-8 bg-[#FAF8F5]">
      <h2 className="text-2xl font-serif font-semibold text-[#1A1612]">
        Trove Logo Options
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Option 1 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E8E4DD]">
          <div className="flex items-center gap-3 mb-4">
            <LogoGem size={48} />
            <span className="font-serif text-2xl text-[#1A1612]">Trove</span>
          </div>
          <h3 className="font-medium text-[#1A1612] mb-1">1. Faceted Gem</h3>
          <p className="text-sm text-[#6B6560]">
            Geometric, precious, works at any size. Mathematical beauty.
          </p>
        </div>
        
        {/* Option 2 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E8E4DD]">
          <div className="flex items-center gap-3 mb-4">
            <LogoChest size={48} />
            <span className="font-serif text-2xl text-[#1A1612]">Trove</span>
          </div>
          <h3 className="font-medium text-[#1A1612] mb-1">2. Open Chest</h3>
          <p className="text-sm text-[#6B6560]">
            Narrative, discovery, light emerging. More illustrative.
          </p>
        </div>
        
        {/* Option 3 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E8E4DD]">
          <div className="flex items-center gap-3 mb-4">
            <LogoCollection size={48} />
            <span className="font-serif text-2xl text-[#1A1612]">Trove</span>
          </div>
          <h3 className="font-medium text-[#1A1612] mb-1">3. Gathered Collection</h3>
          <p className="text-sm text-[#6B6560]">
            Modern, abstract, emphasizes curation. Clean and contemporary.
          </p>
        </div>
        
        {/* Option 4 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E8E4DD]">
          <div className="flex items-center gap-3 mb-4">
            <LogoRibbon size={48} />
            <span className="font-serif text-2xl text-[#1A1612]">Trove</span>
          </div>
          <h3 className="font-medium text-[#1A1612] mb-1">4. Gift Ribbon</h3>
          <p className="text-sm text-[#6B6560]">
            Playful, gift-forward, clear T letterform. Friendly.
          </p>
        </div>
        
        {/* Option 5 - Recommended */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-[#C7923E]">
          <div className="flex items-center gap-3 mb-4">
            <LogoIlluminated size={48} />
            <span className="font-serif text-2xl text-[#1A1612]">Trove</span>
          </div>
          <h3 className="font-medium text-[#1A1612] mb-1">5. Illuminated T ⭐</h3>
          <p className="text-sm text-[#6B6560]">
            Manuscript-inspired, scholarly warmth, timeless. Aligns with Thomistic themes.
          </p>
          <span className="inline-block mt-2 text-xs font-medium text-[#C7923E] bg-[#C7923E]/10 px-2 py-1 rounded">
            Recommended
          </span>
        </div>
      </div>
      
      {/* Size/context tests */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E8E4DD]">
        <h3 className="font-medium text-[#1A1612] mb-4">Size Tests (Gem)</h3>
        <div className="flex items-end gap-6">
          <div className="text-center">
            <LogoGem size={16} />
            <span className="block text-xs text-[#6B6560] mt-1">16px</span>
          </div>
          <div className="text-center">
            <LogoGem size={24} />
            <span className="block text-xs text-[#6B6560] mt-1">24px</span>
          </div>
          <div className="text-center">
            <LogoGem size={32} />
            <span className="block text-xs text-[#6B6560] mt-1">32px</span>
          </div>
          <div className="text-center">
            <LogoGem size={48} />
            <span className="block text-xs text-[#6B6560] mt-1">48px</span>
          </div>
          <div className="text-center">
            <LogoGem size={64} />
            <span className="block text-xs text-[#6B6560] mt-1">64px</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoShowcase;
