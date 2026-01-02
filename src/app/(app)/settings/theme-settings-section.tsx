'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTheme, type Theme } from '@/components/providers/theme-provider';
import { Sun, Moon, Trees, Library, Monitor, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'vellum', label: 'Vellum', icon: Sun },
  { value: 'obsidian', label: 'Obsidian', icon: Moon },
  { value: 'vesper', label: 'Vesper', icon: Library },
  { value: 'scriptorium', label: 'Scriptorium', icon: Trees },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeSettingsSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose your visual world. Each theme has its own typography, colors, and interaction feel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Theme Grid */}
          <div className="grid grid-cols-5 gap-2">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`
                    flex flex-col items-center gap-2 p-4 transition-all duration-200
                    border-2
                    ${isActive 
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]' 
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent-muted)] bg-[var(--color-surface)]'
                    }
                  `}
                  style={{ borderRadius: 'var(--radius-lg)' }}
                >
                  <Icon 
                    className={`h-5 w-5 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} 
                  />
                  <span 
                    className={`text-xs font-medium ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* System theme indicator */}
          {theme === 'system' && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Currently showing <strong className="text-[var(--color-text)]">{resolvedTheme}</strong> based on your device settings.
            </p>
          )}

          {/* Link to full showcase */}
          <Link 
            href="/themes"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors mt-2"
          >
            Explore all theme details
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
