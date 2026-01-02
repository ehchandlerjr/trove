'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus Trap Hook
 * 
 * Traps focus within a container for modal dialogs.
 * Implements WCAG 2.1 SC 2.4.3 Focus Order requirement.
 * 
 * Usage:
 * const { containerRef, focusFirst } = useFocusTrap(isOpen);
 * <div ref={containerRef}>...</div>
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => el.offsetParent !== null); // Only visible elements
  }, []);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  // Handle tab key to trap focus
  useEffect(() => {
    if (!isActive) return;

    // Store currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first element after a brief delay (for animation)
    const timeoutId = setTimeout(focusFirst, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab from first element -> go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab from last element -> go to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to previous element when closing
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, focusFirst, getFocusableElements]);

  return { containerRef, focusFirst };
}

export default useFocusTrap;
