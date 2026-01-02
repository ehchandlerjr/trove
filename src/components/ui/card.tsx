'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    // Warm palette variants using design tokens
    const variants = {
      default: cn(
        'bg-[var(--color-surface)]',
        'shadow-[var(--shadow-md)]',
        'border border-[var(--color-border-subtle)]'
      ),
      interactive: cn(
        'bg-[var(--color-surface)]',
        'shadow-[var(--shadow-md)]',
        'border border-[var(--color-border-subtle)]',
        'cursor-pointer',
        // Theme-specific hover behaviors defined in globals.css
        'card-interactive'
      ),
      outline: cn(
        'bg-[var(--color-surface)]',
        'border border-[var(--color-border)]'
      ),
    };
    
    // 8pt grid spacing
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'surface-grain',
          variants[variant],
          paddings[padding],
          className
        )}
        style={{ borderRadius: 'var(--radius-xl)' }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 
      ref={ref} 
      className={cn(
        'text-lg font-semibold text-[var(--color-text)]',
        className
      )} 
      {...props} 
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn(
        'text-sm text-[var(--color-text-secondary)] mt-1',
        className
      )} 
      {...props} 
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        'mt-4 pt-4 border-t border-[var(--color-border-subtle)]',
        className
      )} 
      {...props} 
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
