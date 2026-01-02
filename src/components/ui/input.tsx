import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const inputId = id || props.name;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            // Base styles with 44px minimum touch target
            'w-full px-4 py-2.5 min-h-[44px]',
            'bg-[var(--color-surface)] text-[var(--color-text)]',
            'placeholder:text-[var(--color-text-muted)]',
            'transition-colors duration-150',
            // Focus states with gold accent
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
            // Border states
            error 
              ? 'border border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]' 
              : 'border border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]',
            // Disabled
            'disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-tertiary)] disabled:cursor-not-allowed',
            className
          )}
          style={{ borderRadius: 'var(--radius-md)' }}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
