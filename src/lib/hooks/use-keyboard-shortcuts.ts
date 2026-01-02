'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onNewItem?: () => void;
  onSearch?: () => void;
}

export function useKeyboardShortcuts({ onNewItem, onSearch }: KeyboardShortcuts) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    const isInputFocused = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable;
    
    if (isInputFocused) return;

    // 'n' - New item (focus the add item input)
    if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      onNewItem?.();
    }

    // '/' or Cmd+K - Search (future)
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !e.altKey) {
      e.preventDefault();
      onSearch?.();
    }
  }, [onNewItem, onSearch]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Help modal content for keyboard shortcuts
export const KEYBOARD_SHORTCUTS = [
  { key: 'n', description: 'Add new item' },
  { key: '/', description: 'Search (coming soon)' },
  { key: '⌘ + Enter', description: 'Save when editing' },
  { key: 'Esc', description: 'Cancel / close' },
] as const;
