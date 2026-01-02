'use client';

/**
 * Trove Treasure Chest Logos
 * 
 * Four distinct chest designs matching each theme:
 * - Vellum: Book-binding aesthetic, Vatican Library warmth
 * - Obsidian: Angular jewel box, candlelit study
 * - Vesper: Nordic minimal, birch/steel
 * - Scriptorium: Organic dome, cathedral grove
 * 
 * Each features a Tau (T) keyhole - dual purpose:
 * 1. "T for Trove" branding
 * 2. Franciscan Tau cross symbolism (for those who recognize it)
 */

import React from 'react';

interface ChestProps {
  size?: number;
  className?: string;
}

// ============================================
// VELLUM CHEST - Vatican Library / Book-binding
// Slightly arched top, horizontal bands, corner flourishes
// ============================================
export function VellumChest({ size = 48, className = '' }: ChestProps) {
  const height = size * 0.85;
  
  return (
    <svg 
      width={size} 
      height={height}
      viewBox="0 0 100 85" 
      fill="none" 
      className={className}
      role="img" 
      aria-label="Trove treasure chest - Vellum theme"
    >
      <defs>
        <linearGradient id="vellumBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C7923E"/>
          <stop offset="100%" stopColor="#A67830"/>
        </linearGradient>
        <linearGradient id="vellumLid" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#B8852F"/>
          <stop offset="100%" stopColor="#D4A84E"/>
        </linearGradient>
      </defs>
      
      {/* Body with subtle arch at top corners */}
      <path 
        d="M16,52 L16,84 Q16,88 20,88 L80,88 Q84,88 84,84 L84,52 Q84,50 80,50 L20,50 Q16,50 16,52 Z" 
        fill="url(#vellumBody)"
      />
      
      {/* Binding-style horizontal bands */}
      <rect x="16" y="62" width="68" height="3" fill="#8B6914" opacity="0.25" rx="1"/>
      <rect x="16" y="74" width="68" height="3" fill="#8B6914" opacity="0.2" rx="1"/>
      
      {/* Corner flourishes - book binding style */}
      <path d="M16,50 L16,60 L24,60 L24,56 L20,56 L20,50 Z" fill="#B8852F" opacity="0.8"/>
      <path d="M84,50 L84,60 L76,60 L76,56 L80,56 L80,50 Z" fill="#B8852F" opacity="0.8"/>
      <path d="M16,88 L16,78 L24,78 L24,82 L20,82 L20,88 Z" fill="#8B6914" opacity="0.6"/>
      <path d="M84,88 L84,78 L76,78 L76,82 L80,82 L80,88 Z" fill="#8B6914" opacity="0.6"/>
      
      {/* Tau Keyhole */}
      <rect x="36" y="54" width="28" height="28" rx="4" fill="#1A1612" opacity="0.9"/>
      <path d="M41,59 L59,59 L59,64 L54,64 L54,79 L46,79 L46,64 L41,64 Z" fill="#D4A84E"/>
      <path d="M42,60 L58,60 L58,63 L53,63 L53,78 L47,78 L47,63 L42,63 Z" fill="#FFE878" opacity="0.4"/>
      
      {/* Rim */}
      <rect x="12" y="44" width="76" height="8" rx="3" fill="#B8852F"/>
      <rect x="12" y="44" width="76" height="3" fill="#D4A84E" opacity="0.5"/>
      
      {/* Lid with arch */}
      <path d="M14,20 Q14,16 20,16 L80,16 Q86,16 86,20 L86,44 L14,44 Z" fill="#B8852F"/>
      <path d="M18,24 Q18,20 24,20 L76,20 Q82,20 82,24 L82,44 L18,44 Z" fill="url(#vellumLid)"/>
      
      {/* Lid highlight - arch shape for book feel */}
      <path d="M26,26 Q50,22 74,26 L74,32 Q50,28 26,32 Z" fill="white" opacity="0.15"/>
      
      {/* Binding detail on lid */}
      <rect x="18" y="38" width="64" height="3" fill="#8B6914" opacity="0.4"/>
    </svg>
  );
}

// ============================================
// OBSIDIAN CHEST - Candlelit Study / Angular Jewel Box
// Faceted, trapezoidal, brass studs and gold accents
// ============================================
export function ObsidianChest({ size = 48, className = '' }: ChestProps) {
  const height = size * 0.85;
  
  return (
    <svg 
      width={size} 
      height={height}
      viewBox="0 0 100 85" 
      fill="none" 
      className={className}
      role="img" 
      aria-label="Trove treasure chest - Obsidian theme"
    >
      <defs>
        <linearGradient id="obsidianBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A3632"/>
          <stop offset="50%" stopColor="#2A2622"/>
          <stop offset="100%" stopColor="#1A1612"/>
        </linearGradient>
        <linearGradient id="obsidianLid" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2A2622"/>
          <stop offset="100%" stopColor="#4A4642"/>
        </linearGradient>
      </defs>
      
      {/* Ambient surface glow */}
      <ellipse cx="55" cy="70" rx="38" ry="18" fill="#FFD700" opacity="0.06"/>
      
      {/* Body - Angular jewel box, slightly trapezoidal */}
      <path d="M14,50 L12,86 Q12,90 16,90 L84,90 Q88,90 88,86 L86,50 Z" fill="url(#obsidianBody)"/>
      
      {/* Beveled edge highlights */}
      <path d="M14,50 L12,86 L16,86 L18,54 Z" fill="#4A4642" opacity="0.4"/>
      <path d="M86,50 L88,86 L84,86 L82,54 Z" fill="#1A1612" opacity="0.5"/>
      
      {/* Gold accent lines */}
      <line x1="14" y1="60" x2="86" y2="60" stroke="#C7923E" strokeWidth="1.5" opacity="0.6"/>
      <line x1="13" y1="74" x2="87" y2="74" stroke="#C7923E" strokeWidth="1" opacity="0.4"/>
      
      {/* Corner studs - brass */}
      <rect x="14" y="50" width="10" height="10" fill="#C7923E" opacity="0.5"/>
      <rect x="76" y="50" width="10" height="10" fill="#C7923E" opacity="0.5"/>
      <rect x="12" y="78" width="10" height="10" fill="#8B6914" opacity="0.4"/>
      <rect x="78" y="78" width="10" height="10" fill="#8B6914" opacity="0.4"/>
      <rect x="15" y="51" width="4" height="4" fill="#FFD700" opacity="0.3"/>
      <rect x="77" y="51" width="4" height="4" fill="#FFD700" opacity="0.3"/>
      
      {/* Tau Keyhole */}
      <rect x="35" y="54" width="30" height="30" rx="2" fill="#0A0806"/>
      <path d="M40,59 L60,59 L60,64 L55,64 L55,81 L45,81 L45,64 L40,64 Z" fill="#D4A84E"/>
      <path d="M41,60 L59,60 L59,63 L54,63 L54,80 L46,80 L46,63 L41,63 Z" fill="#FFD700" opacity="0.45"/>
      
      {/* Rim - Angular */}
      <path d="M10,42 L12,50 L88,50 L90,42 L86,42 L84,48 L16,48 L14,42 Z" fill="#2A2622"/>
      <path d="M10,42 L90,42 L88,46 L12,46 Z" fill="#C7923E" opacity="0.5"/>
      
      {/* Lid - Angular */}
      <path d="M10,16 L14,12 L86,12 L90,16 L90,42 L10,42 Z" fill="#1A1612"/>
      <path d="M14,20 L18,16 L82,16 L86,20 L86,42 L14,42 Z" fill="url(#obsidianLid)"/>
      
      {/* Gold accent line on lid */}
      <line x1="18" y1="34" x2="82" y2="34" stroke="#C7923E" strokeWidth="1.5" opacity="0.6"/>
      
      {/* Lid highlight */}
      <path d="M22,22 L78,22 L76,28 L24,28 Z" fill="white" opacity="0.08"/>
    </svg>
  );
}

// ============================================
// VESPER CHEST - Nordic Sanctuary / Minimal
// Pure rectangle, soft corners, birch/steel palette
// ============================================
export function VesperChest({ size = 48, className = '' }: ChestProps) {
  const height = size * 0.85;
  
  return (
    <svg 
      width={size} 
      height={height}
      viewBox="0 0 100 85" 
      fill="none" 
      className={className}
      role="img" 
      aria-label="Trove treasure chest - Vesper theme"
    >
      <defs>
        <linearGradient id="vesperBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8ECF0"/>
          <stop offset="100%" stopColor="#C8D0D8"/>
        </linearGradient>
        <linearGradient id="vesperLid" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#D0D8E0"/>
          <stop offset="100%" stopColor="#F4F6F8"/>
        </linearGradient>
      </defs>
      
      {/* Body - Pure rectangle with soft corners */}
      <rect x="18" y="52" width="64" height="34" rx="4" fill="url(#vesperBody)"/>
      
      {/* Single subtle line - minimal */}
      <line x1="18" y1="69" x2="82" y2="69" stroke="#A0B0C0" strokeWidth="1" opacity="0.5"/>
      
      {/* Subtle side shadows for depth */}
      <rect x="18" y="52" width="3" height="34" fill="#B8C4D0" opacity="0.4" rx="1"/>
      <rect x="79" y="52" width="3" height="34" fill="#A0B0C0" opacity="0.3" rx="1"/>
      
      {/* Tau Keyhole - Higher contrast */}
      <rect x="38" y="56" width="24" height="26" rx="3" fill="#1A2A3A" opacity="0.95"/>
      <path d="M43,61 L57,61 L57,65 L53,65 L53,79 L47,79 L47,65 L43,65 Z" fill="#5A8AAA"/>
      <path d="M44,62 L56,62 L56,64 L52,64 L52,78 L48,78 L48,64 L44,64 Z" fill="#8AB4D0" opacity="0.5"/>
      
      {/* Rim - Simple band */}
      <rect x="16" y="46" width="68" height="8" rx="2" fill="#B0C0D0"/>
      <rect x="16" y="46" width="68" height="2" fill="#D8E4EC" opacity="0.6"/>
      
      {/* Lid - Clean rectangle */}
      <rect x="16" y="22" width="68" height="24" rx="3" fill="#A8B8C8"/>
      <rect x="20" y="26" width="60" height="20" rx="2" fill="url(#vesperLid)"/>
      
      {/* Single accent line */}
      <line x1="20" y1="36" x2="80" y2="36" stroke="#4A7C9B" strokeWidth="1.5" opacity="0.35"/>
    </svg>
  );
}

// ============================================
// SCRIPTORIUM CHEST - Cathedral Grove / Organic
// Domed lid, living wood form, forest green/amber
// ============================================
export function ScriptoriumChest({ size = 48, className = '' }: ChestProps) {
  const height = size * 0.85;
  
  return (
    <svg 
      width={size} 
      height={height}
      viewBox="0 0 100 85" 
      fill="none" 
      className={className}
      role="img" 
      aria-label="Trove treasure chest - Scriptorium theme"
    >
      <defs>
        <linearGradient id="scriptBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A322A"/>
          <stop offset="100%" stopColor="#1C211C"/>
        </linearGradient>
        <linearGradient id="scriptLid" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#232923"/>
          <stop offset="100%" stopColor="#3A4A3A"/>
        </linearGradient>
      </defs>
      
      {/* Ambient forest floor glow */}
      <ellipse cx="50" cy="77" rx="45" ry="22" fill="#D4A03C" opacity="0.06"/>
      
      {/* Body - Organic living wood form */}
      <path 
        d="M8,54 Q4,54 4,62 L4,80 Q4,92 18,92 L82,92 Q96,92 96,80 L96,62 Q96,54 92,54 Z" 
        fill="url(#scriptBody)"
      />
      
      {/* Wood grain - organic curves */}
      <path d="M10,58 Q30,67 50,60 Q70,54 90,62" stroke="#3A4A3A" strokeWidth="2.5" fill="none" opacity="0.45"/>
      <path d="M6,74 Q35,84 50,78 Q65,72 94,82" stroke="#1C211C" strokeWidth="2" fill="none" opacity="0.35"/>
      
      {/* Moss/knot details */}
      <ellipse cx="14" cy="58" rx="8" ry="6" fill="#2A322A" opacity="0.5"/>
      <ellipse cx="86" cy="60" rx="6" ry="7" fill="#2A322A" opacity="0.45"/>
      <ellipse cx="10" cy="84" rx="7" ry="8" fill="#1C211C" opacity="0.4"/>
      <ellipse cx="90" cy="86" rx="5" ry="6" fill="#1C211C" opacity="0.35"/>
      
      {/* Tau Keyhole */}
      <ellipse cx="50" cy="72" rx="14" ry="16" fill="#0A0F0A" opacity="0.9"/>
      <path d="M40,62 L60,62 L60,67 L55,67 L55,84 L45,84 L45,67 L40,67 Z" fill="#D4A03C"/>
      <path d="M41,63 L59,63 L59,66 L54,66 L54,83 L46,83 L46,66 L41,66 Z" fill="#F8E0A0" opacity="0.45"/>
      
      {/* Rim - Organic curve */}
      <path 
        d="M2,46 Q2,40 14,38 L86,38 Q98,40 98,46 L98,52 Q98,56 90,56 L10,56 Q2,56 2,52 Z" 
        fill="#232923"
      />
      <path d="M14,38 Q50,32 86,38" stroke="#3A4A3A" strokeWidth="2" fill="none" opacity="0.45"/>
      
      {/* Lid - Organic dome */}
      <path d="M10,46 L10,34 Q10,14 30,8 Q50,2 70,8 Q90,14 90,34 L90,46 Z" fill="#1C211C"/>
      <path d="M14,46 L14,36 Q14,18 32,12 Q50,6 68,12 Q86,18 86,36 L86,46 Z" fill="url(#scriptLid)"/>
      
      {/* Wood grain on lid */}
      <path d="M24,22 Q50,14 76,22" stroke="#4A5A4A" strokeWidth="2.5" fill="none" opacity="0.4"/>
      <path d="M18,34 Q50,28 82,34" stroke="#2A322A" strokeWidth="2" fill="none" opacity="0.45"/>
      
      {/* Central grain line */}
      <path d="M50,8 Q52,26 50,46" stroke="#3A4A3A" strokeWidth="2" fill="none" opacity="0.3"/>
    </svg>
  );
}

// ============================================
// THEME-AWARE CHEST
// Renders the appropriate chest based on current theme
// ============================================
export type ThemeId = 'vellum' | 'obsidian' | 'vesper' | 'scriptorium';

interface ThemedChestProps extends ChestProps {
  theme?: ThemeId;
}

export function TroveChest({ theme = 'vellum', size = 48, className = '' }: ThemedChestProps) {
  const ChestComponent = {
    vellum: VellumChest,
    obsidian: ObsidianChest,
    vesper: VesperChest,
    scriptorium: ScriptoriumChest,
  }[theme];
  
  return <ChestComponent size={size} className={className} />;
}

// ============================================
// CHEST SHOWCASE
// Display all four chest designs
// ============================================
export function ChestShowcase() {
  const themes: { id: ThemeId; name: string; tagline: string; bg: string; text: string }[] = [
    { id: 'vellum', name: 'Vellum', tagline: 'The Vatican Library', bg: '#FAF8F5', text: '#1A1612' },
    { id: 'obsidian', name: 'Obsidian', tagline: 'The Candlelit Study', bg: '#1A1714', text: '#E8E4DD' },
    { id: 'vesper', name: 'Vesper', tagline: 'The Nordic Sanctuary', bg: '#F0F4F8', text: '#1A1612' },
    { id: 'scriptorium', name: 'Scriptorium', tagline: 'The Cathedral Grove', bg: '#1C211C', text: '#EAF0E8' },
  ];
  
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold text-[var(--color-text)] mb-2">
          Treasure Chest Logos
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Four distinct designs matching each theme world. Each features a Tau (T) keyhole—"T for Trove."
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {themes.map(({ id, name, tagline, bg, text }) => (
          <div 
            key={id}
            className="p-6 rounded-xl border-2 border-[var(--color-border)] flex flex-col items-center text-center"
            style={{ backgroundColor: bg, color: text }}
          >
            <TroveChest theme={id} size={80} />
            <h3 className="font-semibold mt-4">{name}</h3>
            <p className="text-sm opacity-70">{tagline}</p>
          </div>
        ))}
      </div>
      
      {/* Size tests */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Size Tests (Vellum)</h3>
        <div className="flex items-end gap-8">
          {[24, 32, 48, 64, 96].map(size => (
            <div key={size} className="text-center">
              <VellumChest size={size} />
              <span className="block text-xs text-[var(--color-text-muted)] mt-2">{size}px</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Full logo combinations */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Logo + Wordmark</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {themes.map(({ id, name, bg, text }) => (
            <div 
              key={id}
              className="p-4 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: bg, color: text }}
            >
              <TroveChest theme={id} size={40} />
              <span className="font-serif text-xl font-semibold">Trove</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TroveChest;
