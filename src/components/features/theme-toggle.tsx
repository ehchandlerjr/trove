'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme, type Theme } from '@/components/providers/theme-provider';
import { Sun, Moon, Snowflake, TreePine, Monitor } from 'lucide-react';

const themes: { value: Theme; label: string; icon: typeof Sun; description: string; font: string }[] = [
  { 
    value: 'vellum', 
    label: 'Vellum', 
    icon: Sun,
    description: 'A beautiful book',
    font: 'Georgia serif · Soft corners · Airy'
  },
  { 
    value: 'obsidian', 
    label: 'Obsidian', 
    icon: Moon,
    description: 'A candlelit study',
    font: 'Georgia serif · Soft corners · Warm'
  },
  { 
    value: 'vesper', 
    label: 'Vesper', 
    icon: Snowflake,
    description: 'A Nordic sanctuary',
    font: 'Inter humanist · Clean lines · Measured'
  },
  { 
    value: 'scriptorium', 
    label: 'Scriptorium', 
    icon: TreePine,
    description: 'A cathedral grove',
    font: 'Nunito organic · Soft shapes · Breathing'
  },
  { 
    value: 'system', 
    label: 'System', 
    icon: Monitor,
    description: 'Match your device',
    font: 'Auto light/dark'
  },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % themes.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + themes.length) % themes.length);
          break;
        case 'Tab':
          closeMenu();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(themes.findIndex(t => t.value === theme));
    }
  }, [isOpen, theme]);

  // Get current icon
  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = theme === 'system' 
    ? (resolvedTheme === 'obsidian' || resolvedTheme === 'vesper' || resolvedTheme === 'scriptorium' ? Moon : Sun)
    : currentTheme.icon;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className="p-2 min-h-11 min-w-11 flex items-center justify-center hover:bg-[var(--color-bg-subtle)] transition-colors"
        style={{ borderRadius: 'var(--radius-md)' }}
        aria-label={`Theme: ${currentTheme.label}. Click to change.`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <CurrentIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeMenu}
          />
          <div 
            className="absolute right-0 top-full mt-2 w-72 bg-[var(--color-surface)] shadow-[var(--shadow-xl)] border border-[var(--color-border-subtle)] py-2 z-20"
            style={{ borderRadius: 'var(--radius-lg)' }}
            role="menu"
          >
            <div className="px-4 py-2 border-b border-[var(--color-border)]">
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Choose Your World
              </p>
            </div>
            {themes.map((t, index) => {
              const Icon = t.icon;
              const isSelected = theme === t.value;
              const isFocused = focusedIndex === index;
              
              return (
                <button
                  key={t.value}
                  ref={el => { menuItemsRef.current[index] = el; }}
                  onClick={() => {
                    setTheme(t.value);
                    closeMenu();
                  }}
                  className={`flex items-start gap-3 px-4 py-3 w-full text-left transition-colors outline-none ${
                    isFocused ? 'bg-[var(--color-bg-subtle)]' : ''
                  } ${isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={-1}
                >
                  <div className={`mt-0.5 p-1.5 rounded ${isSelected ? 'bg-[var(--color-accent-subtle)]' : 'bg-[var(--color-bg-subtle)]'}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-[var(--color-accent)]' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
                        {t.label}
                      </p>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {t.description}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono" style={{ fontSize: '10px' }}>
                      {t.font}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
