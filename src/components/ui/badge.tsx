import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    // Warm, muted colors - not harsh primaries
    const variants = {
      default: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
      success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
      danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
      info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
      outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
    };
    
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
