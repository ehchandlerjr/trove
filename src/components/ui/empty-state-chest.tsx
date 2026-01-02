'use client';

/**
 * Empty State Chest
 * 
 * A larger treasure chest icon for empty states.
 * Client component wrapper for use in server components.
 */

import { TroveIcon } from '@/components/ui/logo';

interface EmptyStateChestProps {
  className?: string;
  size?: 'md' | 'lg' | 'xl' | '2xl';
}

export function EmptyStateChest({ className = '', size = 'xl' }: EmptyStateChestProps) {
  // Map sizes to scale factors - xl is default (64px), 2xl is 96px
  const scaleMap = {
    md: 1,      // 64px
    lg: 1.25,   // 80px
    xl: 1.5,    // 96px
    '2xl': 2,   // 128px
  };
  
  const scale = scaleMap[size];
  
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
    >
      <TroveIcon size="xl" />
    </div>
  );
}

export default EmptyStateChest;
