'use client';

/**
 * Trove Logo Component - Theme-Aware Treasure Chest
 * 
 * A treasure chest that adapts to the current theme:
 * - Vellum: Book-binding aesthetic, Vatican Library warmth
 * - Obsidian: Angular jewel box, candlelit study
 * - Vesper: Nordic minimal, birch/steel
 * - Scriptorium: Organic dome, cathedral grove
 * 
 * Each features a Tau (T) keyhole:
 * 1. "T for Trove" branding
 * 2. Franciscan Tau cross symbolism (dual justification)
 */

import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

type ThemeId = 'vellum' | 'obsidian' | 'vesper' | 'scriptorium';

/**
 * Detects the current theme from CSS custom properties
 */
function useCurrentTheme(): ThemeId {
  const [theme, setTheme] = useState<ThemeId>('vellum');

  useEffect(() => {
    const detectTheme = () => {
      // Check data-theme attribute on html element
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      if (htmlTheme && ['vellum', 'obsidian', 'vesper', 'scriptorium'].includes(htmlTheme)) {
        setTheme(htmlTheme as ThemeId);
        return;
      }
      
      // Fallback: check CSS custom property --color-bg
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
      if (bg === '#1A1714' || bg.includes('1A1714')) {
        setTheme('obsidian');
      } else if (bg === '#1C211C' || bg.includes('1C211C')) {
        setTheme('scriptorium');
      } else if (bg === '#F0F4F8' || bg.includes('F0F4F8') || bg === '#F7F8FA') {
        setTheme('vesper');
      } else {
        setTheme('vellum');
      }
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme', 'class', 'style'] 
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

// ============================================
// VELLUM CHEST - Vatican Library / Book-binding
// ============================================
function VellumChest({ size }: { size: number }) {
  const height = size * 0.85;
  const id = `vellum-${Math.random().toString(36).slice(2, 9)}`;
  
  return (
    <svg width={size} height={height} viewBox="0 0 100 85" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C7923E"/>
          <stop offset="100%" stopColor="#A67830"/>
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#B8852F"/>
          <stop offset="100%" stopColor="#D4A84E"/>
        </linearGradient>
      </defs>
      
      {/* Body */}
      <path d="M16,52 L16,84 Q16,88 20,88 L80,88 Q84,88 84,84 L84,52 Q84,50 80,50 L20,50 Q16,50 16,52 Z" fill={`url(#${id}-body)`}/>
      
      {/* Binding bands */}
      <rect x="16" y="62" width="68" height="3" fill="#8B6914" opacity="0.25" rx="1"/>
      <rect x="16" y="74" width="68" height="3" fill="#8B6914" opacity="0.2" rx="1"/>
      
      {/* Corner flourishes */}
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
      
      {/* Lid */}
      <path d="M14,20 Q14,16 20,16 L80,16 Q86,16 86,20 L86,44 L14,44 Z" fill="#B8852F"/>
      <path d="M18,24 Q18,20 24,20 L76,20 Q82,20 82,24 L82,44 L18,44 Z" fill={`url(#${id}-lid)`}/>
      
      {/* Lid highlight */}
      <path d="M26,26 Q50,22 74,26 L74,32 Q50,28 26,32 Z" fill="white" opacity="0.15"/>
      <rect x="18" y="38" width="64" height="3" fill="#8B6914" opacity="0.4"/>
    </svg>
  );
}

// ============================================
// OBSIDIAN CHEST - Candlelit Study / Angular
// ============================================
function ObsidianChest({ size }: { size: number }) {
  const height = size * 0.85;
  const id = `obsidian-${Math.random().toString(36).slice(2, 9)}`;
  
  return (
    <svg width={size} height={height} viewBox="0 0 100 85" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A3632"/>
          <stop offset="50%" stopColor="#2A2622"/>
          <stop offset="100%" stopColor="#1A1612"/>
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2A2622"/>
          <stop offset="100%" stopColor="#4A4642"/>
        </linearGradient>
      </defs>
      
      {/* Ambient glow */}
      <ellipse cx="55" cy="70" rx="38" ry="18" fill="#FFD700" opacity="0.06"/>
      
      {/* Body - Angular */}
      <path d="M14,50 L12,86 Q12,90 16,90 L84,90 Q88,90 88,86 L86,50 Z" fill={`url(#${id}-body)`}/>
      
      {/* Beveled edges */}
      <path d="M14,50 L12,86 L16,86 L18,54 Z" fill="#4A4642" opacity="0.4"/>
      <path d="M86,50 L88,86 L84,86 L82,54 Z" fill="#1A1612" opacity="0.5"/>
      
      {/* Gold accents */}
      <line x1="14" y1="60" x2="86" y2="60" stroke="#C7923E" strokeWidth="1.5" opacity="0.6"/>
      <line x1="13" y1="74" x2="87" y2="74" stroke="#C7923E" strokeWidth="1" opacity="0.4"/>
      
      {/* Corner studs */}
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
      
      {/* Rim */}
      <path d="M10,42 L12,50 L88,50 L90,42 L86,42 L84,48 L16,48 L14,42 Z" fill="#2A2622"/>
      <path d="M10,42 L90,42 L88,46 L12,46 Z" fill="#C7923E" opacity="0.5"/>
      
      {/* Lid */}
      <path d="M10,16 L14,12 L86,12 L90,16 L90,42 L10,42 Z" fill="#1A1612"/>
      <path d="M14,20 L18,16 L82,16 L86,20 L86,42 L14,42 Z" fill={`url(#${id}-lid)`}/>
      
      {/* Lid accent */}
      <line x1="18" y1="34" x2="82" y2="34" stroke="#C7923E" strokeWidth="1.5" opacity="0.6"/>
      <path d="M22,22 L78,22 L76,28 L24,28 Z" fill="white" opacity="0.08"/>
    </svg>
  );
}

// ============================================
// VESPER CHEST - Nordic Sanctuary / Minimal
// ============================================
function VesperChest({ size }: { size: number }) {
  const height = size * 0.85;
  const id = `vesper-${Math.random().toString(36).slice(2, 9)}`;
  
  return (
    <svg width={size} height={height} viewBox="0 0 100 85" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8ECF0"/>
          <stop offset="100%" stopColor="#C8D0D8"/>
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#D0D8E0"/>
          <stop offset="100%" stopColor="#F4F6F8"/>
        </linearGradient>
      </defs>
      
      {/* Body */}
      <rect x="18" y="52" width="64" height="34" rx="4" fill={`url(#${id}-body)`}/>
      
      {/* Subtle line */}
      <line x1="18" y1="69" x2="82" y2="69" stroke="#A0B0C0" strokeWidth="1" opacity="0.5"/>
      
      {/* Side shadows */}
      <rect x="18" y="52" width="3" height="34" fill="#B8C4D0" opacity="0.4" rx="1"/>
      <rect x="79" y="52" width="3" height="34" fill="#A0B0C0" opacity="0.3" rx="1"/>
      
      {/* Tau Keyhole */}
      <rect x="38" y="56" width="24" height="26" rx="3" fill="#1A2A3A" opacity="0.95"/>
      <path d="M43,61 L57,61 L57,65 L53,65 L53,79 L47,79 L47,65 L43,65 Z" fill="#5A8AAA"/>
      <path d="M44,62 L56,62 L56,64 L52,64 L52,78 L48,78 L48,64 L44,64 Z" fill="#8AB4D0" opacity="0.5"/>
      
      {/* Rim */}
      <rect x="16" y="46" width="68" height="8" rx="2" fill="#B0C0D0"/>
      <rect x="16" y="46" width="68" height="2" fill="#D8E4EC" opacity="0.6"/>
      
      {/* Lid */}
      <rect x="16" y="22" width="68" height="24" rx="3" fill="#A8B8C8"/>
      <rect x="20" y="26" width="60" height="20" rx="2" fill={`url(#${id}-lid)`}/>
      
      {/* Accent line */}
      <line x1="20" y1="36" x2="80" y2="36" stroke="#4A7C9B" strokeWidth="1.5" opacity="0.35"/>
    </svg>
  );
}

// ============================================
// SCRIPTORIUM CHEST - Cathedral Grove / Organic
// ============================================
function ScriptoriumChest({ size }: { size: number }) {
  const height = size * 0.85;
  const id = `script-${Math.random().toString(36).slice(2, 9)}`;
  
  return (
    <svg width={size} height={height} viewBox="0 0 100 85" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A322A"/>
          <stop offset="100%" stopColor="#1C211C"/>
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#232923"/>
          <stop offset="100%" stopColor="#3A4A3A"/>
        </linearGradient>
      </defs>
      
      {/* Ambient glow */}
      <ellipse cx="50" cy="77" rx="45" ry="22" fill="#D4A03C" opacity="0.06"/>
      
      {/* Body - Organic */}
      <path d="M8,54 Q4,54 4,62 L4,80 Q4,92 18,92 L82,92 Q96,92 96,80 L96,62 Q96,54 92,54 Z" fill={`url(#${id}-body)`}/>
      
      {/* Wood grain */}
      <path d="M10,58 Q30,67 50,60 Q70,54 90,62" stroke="#3A4A3A" strokeWidth="2.5" fill="none" opacity="0.45"/>
      <path d="M6,74 Q35,84 50,78 Q65,72 94,82" stroke="#1C211C" strokeWidth="2" fill="none" opacity="0.35"/>
      
      {/* Knots */}
      <ellipse cx="14" cy="58" rx="8" ry="6" fill="#2A322A" opacity="0.5"/>
      <ellipse cx="86" cy="60" rx="6" ry="7" fill="#2A322A" opacity="0.45"/>
      <ellipse cx="10" cy="84" rx="7" ry="8" fill="#1C211C" opacity="0.4"/>
      <ellipse cx="90" cy="86" rx="5" ry="6" fill="#1C211C" opacity="0.35"/>
      
      {/* Tau Keyhole */}
      <ellipse cx="50" cy="72" rx="14" ry="16" fill="#0A0F0A" opacity="0.9"/>
      <path d="M40,62 L60,62 L60,67 L55,67 L55,84 L45,84 L45,67 L40,67 Z" fill="#D4A03C"/>
      <path d="M41,63 L59,63 L59,66 L54,66 L54,83 L46,83 L46,66 L41,66 Z" fill="#F8E0A0" opacity="0.45"/>
      
      {/* Rim - Organic */}
      <path d="M2,46 Q2,40 14,38 L86,38 Q98,40 98,46 L98,52 Q98,56 90,56 L10,56 Q2,56 2,52 Z" fill="#232923"/>
      <path d="M14,38 Q50,32 86,38" stroke="#3A4A3A" strokeWidth="2" fill="none" opacity="0.45"/>
      
      {/* Lid - Domed */}
      <path d="M10,46 L10,34 Q10,14 30,8 Q50,2 70,8 Q90,14 90,34 L90,46 Z" fill="#1C211C"/>
      <path d="M14,46 L14,36 Q14,18 32,12 Q50,6 68,12 Q86,18 86,36 L86,46 Z" fill={`url(#${id}-lid)`}/>
      
      {/* Lid grain */}
      <path d="M24,22 Q50,14 76,22" stroke="#4A5A4A" strokeWidth="2.5" fill="none" opacity="0.4"/>
      <path d="M18,34 Q50,28 82,34" stroke="#2A322A" strokeWidth="2" fill="none" opacity="0.45"/>
      <path d="M50,8 Q52,26 50,46" stroke="#3A4A3A" strokeWidth="2" fill="none" opacity="0.3"/>
    </svg>
  );
}

/**
 * Theme-aware Trove Icon (Treasure Chest)
 * Automatically adapts to current theme
 */
export function TroveIcon({ className = '', size = 'md' }: LogoProps) {
  const theme = useCurrentTheme();
  const pixelSize = sizes[size];
  
  const ChestComponent = {
    vellum: VellumChest,
    obsidian: ObsidianChest,
    vesper: VesperChest,
    scriptorium: ScriptoriumChest,
  }[theme];
  
  return (
    <span className={className} role="img" aria-label="Trove logo">
      <ChestComponent size={pixelSize} />
    </span>
  );
}

/**
 * Text-only logo for contexts where SVG is overkill
 * Uses CSS classes that adapt to theme
 */
export function TroveText({ className = '' }: { className?: string }) {
  return (
    <span 
      className={`font-display font-semibold tracking-tight ${className}`}
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      Trove
    </span>
  );
}

/**
 * The Trove wordmark as SVG
 */
export function TroveWordmark({ className = '', size = 'md' }: LogoProps) {
  const textSizes = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
    xl: 'h-12',
  };
  
  return (
    <svg
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${textSizes[size]} ${className}`}
      role="img"
      aria-label="Trove"
    >
      <text
        x="0"
        y="24"
        fill="currentColor"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: '26px',
          fontWeight: 400,
          letterSpacing: '-0.02em',
        }}
      >
        Trove
      </text>
    </svg>
  );
}

/**
 * Full Trove logo: icon + wordmark
 */
export function TroveLogo({ className = '', size = 'md' }: LogoProps & { variant?: 'full' | 'icon' | 'wordmark' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TroveIcon size={size} />
      <TroveText className={size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-xl'} />
    </div>
  );
}

export default TroveLogo;
