'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium',
      // Spring-like transform transitions (CSS approximation of spring physics)
      'transition-all duration-150 ease-out',
      'active:scale-[0.98] hover:scale-[1.02]',
      'focus-visible:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'disabled:hover:scale-100 disabled:active:scale-100'
    );
    
    // Border radius from theme CSS variables
    const radiusStyle = { borderRadius: 'var(--radius-md)' };
    
    // Warm palette using design tokens
    // P0 WCAG FIX: Dark text on gold buttons (white on gold fails contrast)
    const variants = {
      primary: cn(
        'bg-[var(--color-accent)] text-[var(--color-button-text)]',
        'hover:bg-[var(--color-accent-hover)]',
        'shadow-md hover:shadow-lg',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2'
      ),
      secondary: cn(
        'bg-[var(--color-bg-subtle)] text-[var(--color-text)]',
        'hover:bg-[var(--color-border)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-text-tertiary)] focus-visible:ring-offset-2'
      ),
      ghost: cn(
        'text-[var(--color-text-secondary)]',
        'hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-text-tertiary)] focus-visible:ring-offset-2'
      ),
      danger: cn(
        'bg-[var(--color-danger)] text-white',
        'hover:brightness-90',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-2'
      ),
      outline: cn(
        'border border-[var(--color-border)] text-[var(--color-text)]',
        'hover:border-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-subtle)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2'
      ),
    };
    
    // 8pt grid spacing (4, 8, 16, 24, 32, 48px)
    const sizes = {
      sm: 'px-2 py-1 text-sm gap-1 min-h-[32px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
      lg: 'px-6 py-2 text-base gap-2 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={radiusStyle}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
