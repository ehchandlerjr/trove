/**
 * Trove Logo Component
 * 
 * A Thomistic wordmark: clean, warm, dignified.
 * The "o" contains a subtle gem shape—a trove is discovered treasure.
 * 
 * Three variants:
 * - full: Wordmark + icon
 * - wordmark: Text only
 * - icon: Gem mark only (for favicon, app icon)
 */

interface LogoProps {
  variant?: 'full' | 'wordmark' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: { wordmark: 'h-5', icon: 'h-5 w-5' },
  md: { wordmark: 'h-7', icon: 'h-7 w-7' },
  lg: { wordmark: 'h-9', icon: 'h-9 w-9' },
  xl: { wordmark: 'h-12', icon: 'h-12 w-12' },
};

/**
 * The Trove icon mark: a faceted gem
 * Represents discovered treasure, hidden value, collected desires
 */
export function TroveIcon({ className = '', size = 'md' }: Omit<LogoProps, 'variant'>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizes[size].icon} ${className}`}
      aria-hidden="true"
    >
      {/* Gem shape - classic cut diamond silhouette */}
      <path
        d="M16 2L4 12L16 30L28 12L16 2Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Top facets */}
      <path
        d="M16 2L4 12H28L16 2Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      {/* Center line for depth */}
      <path
        d="M16 2V30M4 12H28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* Outer gem outline */}
      <path
        d="M16 2L4 12L16 30L28 12L16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkle accent - top right */}
      <path
        d="M24 6L25 5M26 8L27 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * The Trove wordmark
 * Georgia serif for warmth and gravitas
 */
export function TroveWordmark({ className = '', size = 'md' }: Omit<LogoProps, 'variant'>) {
  return (
    <svg
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizes[size].wordmark} ${className}`}
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
export function TroveLogo({ variant = 'full', className = '', size = 'md' }: LogoProps) {
  if (variant === 'icon') {
    return <TroveIcon className={className} size={size} />;
  }
  
  if (variant === 'wordmark') {
    return <TroveWordmark className={className} size={size} />;
  }
  
  // Full logo: icon + wordmark
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TroveIcon size={size} />
      <TroveWordmark size={size} />
    </div>
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

export default TroveLogo;
