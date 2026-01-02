'use client';

import React, { useMemo } from 'react';
import { useTheme } from '@/components/providers/theme-provider';
import { useEventTheme } from '@/components/providers/event-theme-provider';

// ============================================================================
// SHAPE DEFINITIONS
// ============================================================================

interface ShapeProps {
  color: string;
  size: number;
}

const shapes: Record<string, (props: ShapeProps) => React.ReactElement> = {
  balloon: ({ color, size }) => (
    <svg width={size} height={size * 1.3} viewBox="0 0 40 52" fill="none">
      <ellipse cx="20" cy="18" rx="16" ry="18" fill={color} opacity="0.9" />
      <path d="M20 36 L17 42 L23 42 Z" fill={color} opacity="0.8" />
      <path d="M20 42 Q22 48, 20 52" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <ellipse cx="14" cy="12" rx="4" ry="5" fill="white" opacity="0.3" />
    </svg>
  ),
  
  gift: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="14" width="32" height="22" rx="2" fill={color} opacity="0.85" />
      <rect x="2" y="10" width="36" height="8" rx="2" fill={color} />
      <rect x="18" y="10" width="4" height="26" fill="white" opacity="0.3" />
      <path d="M10 10 Q20 0, 20 10" stroke={color} strokeWidth="3" fill="none" />
      <path d="M30 10 Q20 0, 20 10" stroke={color} strokeWidth="3" fill="none" />
    </svg>
  ),
  
  confetti: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="4" height="8" rx="1" fill={color} opacity="0.9" transform="rotate(15 6 6)" />
    </svg>
  ),
  
  star: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path 
        d="M20 2 L24 14 L38 14 L27 22 L31 36 L20 28 L9 36 L13 22 L2 14 L16 14 Z" 
        fill={color} 
        opacity="0.85"
      />
    </svg>
  ),
  
  snowflake: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <g stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <line x1="20" y1="2" x2="20" y2="38" />
        <line x1="2" y1="20" x2="38" y2="20" />
        <line x1="7" y1="7" x2="33" y2="33" />
        <line x1="33" y1="7" x2="7" y2="33" />
        {/* Small branches */}
        <line x1="20" y1="8" x2="16" y2="4" />
        <line x1="20" y1="8" x2="24" y2="4" />
        <line x1="20" y1="32" x2="16" y2="36" />
        <line x1="20" y1="32" x2="24" y2="36" />
      </g>
    </svg>
  ),
  
  ornament: ({ color, size }) => (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none">
      <rect x="17" y="2" width="6" height="6" rx="1" fill={color} opacity="0.7" />
      <circle cx="20" cy="28" r="16" fill={color} opacity="0.85" />
      <ellipse cx="14" cy="22" rx="4" ry="5" fill="white" opacity="0.25" />
      <path d="M12 28 Q20 38, 28 28" stroke="white" strokeWidth="1.5" fill="none" opacity="0.2" />
    </svg>
  ),
  
  heart: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path 
        d="M20 36 C8 24, 2 16, 8 10 C14 4, 20 10, 20 14 C20 10, 26 4, 32 10 C38 16, 32 24, 20 36 Z" 
        fill={color} 
        opacity="0.85"
      />
    </svg>
  ),
  
  ring: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="22" r="14" stroke={color} strokeWidth="4" fill="none" opacity="0.8" />
      <circle cx="20" cy="8" r="6" fill={color} opacity="0.9" />
      <circle cx="20" cy="8" r="2" fill="white" opacity="0.5" />
    </svg>
  ),
  
  dove: ({ color, size }) => (
    <svg width={size} height={size * 0.7} viewBox="0 0 50 35" fill="none">
      <ellipse cx="20" cy="20" rx="14" ry="10" fill={color} opacity="0.85" />
      <ellipse cx="10" cy="18" rx="6" ry="4" fill={color} opacity="0.9" />
      <path d="M32 14 Q42 8, 48 12 Q42 14, 34 18" fill={color} opacity="0.8" />
      <path d="M32 22 Q40 28, 44 32 Q38 28, 34 24" fill={color} opacity="0.7" />
      <circle cx="8" cy="17" r="1.5" fill="#333" />
    </svg>
  ),
  
  egg: ({ color, size }) => (
    <svg width={size * 0.75} height={size} viewBox="0 0 30 40" fill="none">
      <ellipse cx="15" cy="22" rx="12" ry="16" fill={color} opacity="0.85" />
      <path d="M8 18 Q15 12, 22 18" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
      <ellipse cx="10" cy="16" rx="3" ry="4" fill="white" opacity="0.2" />
    </svg>
  ),
  
  tulip: ({ color, size }) => (
    <svg width={size * 0.6} height={size} viewBox="0 0 24 40" fill="none">
      <path d="M12 40 L12 20" stroke="#4A7C4A" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="8" ry="12" fill={color} opacity="0.85" />
      <path d="M6 14 Q12 6, 18 14" fill={color} opacity="0.9" />
      <ellipse cx="8" cy="10" rx="2" ry="3" fill="white" opacity="0.2" />
    </svg>
  ),
  
  bunny: ({ color, size }) => (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none">
      <ellipse cx="20" cy="32" rx="14" ry="12" fill={color} opacity="0.9" />
      <ellipse cx="20" cy="20" rx="10" ry="10" fill={color} opacity="0.95" />
      <ellipse cx="12" cy="6" rx="4" ry="14" fill={color} opacity="0.85" />
      <ellipse cx="28" cy="6" rx="4" ry="14" fill={color} opacity="0.85" />
      <ellipse cx="12" cy="8" rx="2" ry="10" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="28" cy="8" rx="2" ry="10" fill="#FFB6C1" opacity="0.5" />
      <circle cx="16" cy="18" r="2" fill="#333" />
      <circle cx="24" cy="18" r="2" fill="#333" />
      <ellipse cx="20" cy="23" rx="2" ry="1.5" fill="#FFB6C1" />
    </svg>
  ),
  
  butterfly: ({ color, size }) => (
    <svg width={size} height={size * 0.8} viewBox="0 0 50 40" fill="none">
      <ellipse cx="25" cy="20" rx="2" ry="12" fill="#333" opacity="0.7" />
      <ellipse cx="14" cy="14" rx="12" ry="10" fill={color} opacity="0.8" />
      <ellipse cx="36" cy="14" rx="12" ry="10" fill={color} opacity="0.8" />
      <ellipse cx="12" cy="28" rx="8" ry="7" fill={color} opacity="0.7" />
      <ellipse cx="38" cy="28" rx="8" ry="7" fill={color} opacity="0.7" />
      <circle cx="10" cy="12" r="3" fill="white" opacity="0.3" />
      <circle cx="40" cy="12" r="3" fill="white" opacity="0.3" />
    </svg>
  ),
  
  bat: ({ color, size }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none">
      <ellipse cx="30" cy="18" rx="8" ry="10" fill={color} opacity="0.9" />
      <path d="M22 18 Q10 6, 2 18 Q8 16, 14 20 Q18 14, 22 18" fill={color} opacity="0.85" />
      <path d="M38 18 Q50 6, 58 18 Q52 16, 46 20 Q42 14, 38 18" fill={color} opacity="0.85" />
      <circle cx="26" cy="14" r="2" fill="#FF6B6B" />
      <circle cx="34" cy="14" r="2" fill="#FF6B6B" />
      <path d="M26 10 L24 4" stroke={color} strokeWidth="2" />
      <path d="M34 10 L36 4" stroke={color} strokeWidth="2" />
    </svg>
  ),
  
  pumpkin: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 44 40" fill="none">
      <ellipse cx="22" cy="24" rx="18" ry="14" fill={color} opacity="0.9" />
      <ellipse cx="12" cy="24" rx="8" ry="12" fill={color} opacity="0.7" />
      <ellipse cx="32" cy="24" rx="8" ry="12" fill={color} opacity="0.7" />
      <rect x="19" y="4" width="6" height="8" rx="2" fill="#4A7C4A" />
      <path d="M22 12 Q16 8, 14 14" stroke="#4A7C4A" strokeWidth="2" fill="none" />
    </svg>
  ),
  
  ghost: ({ color, size }) => (
    <svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none">
      <path 
        d="M8 20 C8 10, 32 10, 32 20 L32 38 Q28 34, 24 38 Q20 34, 16 38 Q12 34, 8 38 Z" 
        fill={color} 
        opacity="0.9"
      />
      <circle cx="16" cy="20" r="4" fill="#333" />
      <circle cx="28" cy="20" r="4" fill="#333" />
      <ellipse cx="22" cy="28" rx="4" ry="3" fill="#333" opacity="0.7" />
    </svg>
  ),
  
  moon: ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" fill={color} opacity="0.85" />
      <circle cx="28" cy="20" r="12" fill="currentColor" style={{ color: 'var(--color-bg)' }} />
    </svg>
  ),
  
  cloud: ({ color, size }) => (
    <svg width={size * 1.3} height={size * 0.7} viewBox="0 0 52 28" fill="none">
      <ellipse cx="20" cy="18" rx="14" ry="10" fill={color} opacity="0.7" />
      <ellipse cx="34" cy="16" rx="12" ry="10" fill={color} opacity="0.8" />
      <ellipse cx="14" cy="14" rx="10" ry="8" fill={color} opacity="0.75" />
      <ellipse cx="40" cy="18" rx="8" ry="6" fill={color} opacity="0.7" />
    </svg>
  ),
  
  candle: ({ color, size }) => (
    <svg width={size * 0.4} height={size} viewBox="0 0 16 40" fill="none">
      <rect x="4" y="12" width="8" height="26" rx="1" fill={color} opacity="0.85" />
      <ellipse cx="8" cy="6" rx="4" ry="6" fill="#FFD700" opacity="0.9" />
      <ellipse cx="8" cy="4" rx="2" ry="3" fill="#FFF" opacity="0.5" />
    </svg>
  ),
  
  dreidel: ({ color, size }) => (
    <svg width={size * 0.7} height={size} viewBox="0 0 28 40" fill="none">
      <rect x="6" y="2" width="16" height="6" rx="2" fill={color} opacity="0.7" />
      <polygon points="14,40 4,14 24,14" fill={color} opacity="0.85" />
      <rect x="10" y="8" width="8" height="8" fill={color} opacity="0.9" />
    </svg>
  ),
  
  diploma: ({ color, size }) => (
    <svg width={size * 1.2} height={size * 0.8} viewBox="0 0 48 32" fill="none">
      <rect x="4" y="4" width="40" height="24" rx="2" fill={color} opacity="0.15" stroke={color} strokeWidth="2" />
      <line x1="12" y1="12" x2="36" y2="12" stroke={color} strokeWidth="2" opacity="0.5" />
      <line x1="12" y1="18" x2="36" y2="18" stroke={color} strokeWidth="2" opacity="0.5" />
      <circle cx="24" cy="24" r="4" fill={color} opacity="0.8" />
    </svg>
  ),
  
  cap: ({ color, size }) => (
    <svg width={size} height={size * 0.8} viewBox="0 0 44 36" fill="none">
      <polygon points="22,4 4,16 22,20 40,16" fill={color} opacity="0.9" />
      <rect x="8" y="16" width="28" height="4" fill={color} opacity="0.7" />
      <line x1="38" y1="16" x2="42" y2="32" stroke={color} strokeWidth="2" />
      <circle cx="42" cy="32" r="3" fill="#FFD700" />
    </svg>
  ),
  
  fleurDeLis: ({ color, size }) => (
    <svg width={size * 0.8} height={size} viewBox="0 0 32 40" fill="none">
      <path 
        d="M16 2 C16 8, 8 12, 8 20 C8 26, 12 28, 16 32 C20 28, 24 26, 24 20 C24 12, 16 8, 16 2" 
        fill={color} 
        opacity="0.85"
      />
      <circle cx="16" cy="16" r="4" fill={color} opacity="0.6" />
      <path d="M6 24 Q2 20, 6 16" stroke={color} strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M26 24 Q30 20, 26 16" stroke={color} strokeWidth="3" fill="none" opacity="0.7" />
    </svg>
  ),
};

// ============================================================================
// POISSON DISK SAMPLING for natural distribution
// ============================================================================

function poissonDiskSampling(
  width: number, 
  height: number, 
  minDist: number, 
  maxAttempts: number,
  seed: number
): { x: number; y: number }[] {
  // Simple seeded random
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  const points: { x: number; y: number }[] = [];
  const cellSize = minDist / Math.sqrt(2);
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  const grid: (number | null)[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));
  
  const addPoint = (x: number, y: number) => {
    const point = { x, y };
    points.push(point);
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    if (gridY >= 0 && gridY < gridHeight && gridX >= 0 && gridX < gridWidth) {
      grid[gridY][gridX] = points.length - 1;
    }
    return point;
  };
  
  const isValid = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const ny = gridY + dy;
        const nx = gridX + dx;
        if (ny >= 0 && ny < gridHeight && nx >= 0 && nx < gridWidth && grid[ny][nx] !== null) {
          const neighbor = points[grid[ny][nx]!];
          const dist = Math.sqrt((x - neighbor.x) ** 2 + (y - neighbor.y) ** 2);
          if (dist < minDist) return false;
        }
      }
    }
    return true;
  };
  
  // Start with a point
  addPoint(width * seededRandom(), height * seededRandom());
  
  const activeList = [0];
  
  while (activeList.length > 0 && points.length < 30) {
    const idx = Math.floor(seededRandom() * activeList.length);
    const point = points[activeList[idx]];
    let found = false;
    
    for (let i = 0; i < maxAttempts; i++) {
      const angle = seededRandom() * Math.PI * 2;
      const dist = minDist + seededRandom() * minDist;
      const newX = point.x + Math.cos(angle) * dist;
      const newY = point.y + Math.sin(angle) * dist;
      
      if (isValid(newX, newY)) {
        activeList.push(points.length);
        addPoint(newX, newY);
        found = true;
        break;
      }
    }
    
    if (!found) {
      activeList.splice(idx, 1);
    }
  }
  
  return points;
}

// ============================================================================
// FLOATING SHAPES COMPONENT
// ============================================================================

interface FloatingShapesProps {
  className?: string;
}

export function FloatingShapes({ className }: FloatingShapesProps) {
  const { eventTheme, eventThemeId } = useEventTheme();
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'obsidian' || resolvedTheme === 'scriptorium';
  
  const particles = useMemo(() => {
    if (eventThemeId === 'none' || eventTheme.floatingShapes.length === 0) {
      return [];
    }
    
    // Generate seed from event theme for consistent positioning
    const seed = eventThemeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const points = poissonDiskSampling(100, 100, 15, 30, seed);
    
    return points.slice(0, 12).map((point, i) => ({
      id: i,
      shape: eventTheme.floatingShapes[i % eventTheme.floatingShapes.length],
      x: point.x,
      y: point.y,
      size: 24 + (i % 4) * 8,
      rotation: (i * 23) % 40 - 20,
      delay: (i * 1.5) % 8,
      duration: 25 + (i % 5) * 5,
      opacity: 0.06 + (i % 3) * 0.02,
    }));
  }, [eventThemeId, eventTheme.floatingShapes]);
  
  if (particles.length === 0) {
    return null;
  }
  
  const color = isDark ? eventTheme.accentDark : eventTheme.accent;
  
  return (
    <div 
      className={className}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        overflow: 'hidden', 
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const ShapeComponent = shapes[p.shape];
        if (!ShapeComponent) return null;
        
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              transform: `rotate(${p.rotation}deg)`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          >
            <ShapeComponent color={color} size={p.size} />
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: rotate(${0}deg) translateY(0px); }
          50% { transform: rotate(${0}deg) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
