'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'vellum' | 'obsidian' | 'vesper' | 'scriptorium' | 'system';
export type ResolvedTheme = 'vellum' | 'obsidian' | 'vesper' | 'scriptorium';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'trove-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'vellum';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'obsidian' : 'vellum';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('vellum');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    
    // Add transition class
    document.documentElement.classList.add('theme-transitioning');
    
    // Apply data attribute
    if (newTheme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    
    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 200);
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage not available
    }
  }, [applyTheme]);

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && ['vellum', 'obsidian', 'vesper', 'scriptorium', 'system'].includes(stored)) {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        applyTheme('system');
      }
    } catch {
      applyTheme('system');
    }
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Script to prevent FOUC - inject into <head>
export const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('${STORAGE_KEY}');
    var validThemes = ['vellum', 'obsidian', 'vesper', 'scriptorium', 'system'];
    if (theme && validThemes.indexOf(theme) !== -1 && theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (e) {}
})();
`;
