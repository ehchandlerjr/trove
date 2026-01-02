'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TroveIcon } from '@/components/ui/logo';
import { ArrowLeft, Heart, Star, Sparkles, Moon, Sun, Trees, Library, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useTheme, type Theme, type ResolvedTheme } from '@/components/providers/theme-provider';

const themes: { id: Theme; name: string; description: string; icon: typeof Sun }[] = [
  { 
    id: 'vellum', 
    name: 'Vellum', 
    description: 'The Vatican Library — warm afternoon light on excellent paper',
    icon: Sun
  },
  { 
    id: 'obsidian', 
    name: 'Obsidian', 
    description: 'The Candlelit Study — Rembrandt\'s golden darkness',
    icon: Moon
  },
  { 
    id: 'vesper', 
    name: 'Vesper', 
    description: 'The Nordic Sanctuary — clean Scandinavian clarity',
    icon: Library
  },
  { 
    id: 'scriptorium', 
    name: 'Scriptorium', 
    description: 'The Cathedral Grove — where redwoods are columns',
    icon: Trees
  },
  { 
    id: 'system', 
    name: 'System', 
    description: 'Match your device — follows OS light/dark preference',
    icon: Monitor
  },
];

export default function ThemeShowcase() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // For display purposes, show which theme is actually active
  const activeTheme: ResolvedTheme = resolvedTheme;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <Badge variant="info" className="mb-4">Four Worlds</Badge>
        <h1 className="text-3xl font-bold text-[var(--color-text)] font-display tracking-tight">
          Theme Showcase
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 max-w-2xl">
          Not just color schemes—four distinct visual languages. Each theme has unique typography, 
          geometry, interaction physics, and emotional character.
        </p>
      </div>

      {/* Theme Switcher */}
      <Card padding="lg">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Select a World</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`
                  p-4 rounded-xl text-left transition-all duration-200
                  border-2
                  ${isActive 
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]' 
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-subtle)] bg-[var(--color-surface)]'
                  }
                `}
              >
                <Icon className={`h-6 w-6 mb-2 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                <p className={`font-semibold ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
                  {t.name}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1 line-clamp-2">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
        {theme === 'system' && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-4">
            Currently showing: <strong className="text-[var(--color-text)]">{activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1)}</strong> (based on your device settings)
          </p>
        )}
      </Card>

      {/* Interactive Cards Demo */}
      <div>
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Interactive Cards</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Hover over these cards to see theme-specific interaction behavior.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Card variant="interactive" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                <TroveIcon size="sm" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">Birthday Wishlist</p>
                <p className="text-sm text-[var(--color-text-secondary)]">12 items</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Shared with 5 people
            </p>
          </Card>
          
          <Card variant="interactive" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-danger-bg)] flex items-center justify-center">
                <Heart className="h-5 w-5 text-[var(--color-danger)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">Wedding Registry</p>
                <p className="text-sm text-[var(--color-text-secondary)]">24 items</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Shared with 42 people
            </p>
          </Card>
          
          <Card variant="interactive" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-bg)] flex items-center justify-center">
                <Star className="h-5 w-5 text-[var(--color-warning)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">Holiday Favorites</p>
                <p className="text-sm text-[var(--color-text-secondary)]">8 items</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Private list
            </p>
          </Card>
        </div>
      </div>

      {/* Button Demo */}
      <Card>
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Buttons</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Each theme has distinct button physics—from bouncy (Vellum) to instant (Vesper) to deliberate (Scriptorium).
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">
            <Sparkles className="h-4 w-4" />
            Primary Action
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Card>

      {/* Theme Details */}
      <Card>
        <h2 className="font-semibold text-[var(--color-text)] mb-4">
          {themes.find(t => t.id === activeTheme)?.name || activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1)} Details
        </h2>
        
        {activeTheme === 'vellum' && (
          <div className="space-y-3 text-sm">
            <p><strong className="text-[var(--color-text)]">Typography:</strong> <span className="text-[var(--color-text-secondary)]">Georgia serif — humanist, pen-influenced</span></p>
            <p><strong className="text-[var(--color-text)]">Corners:</strong> <span className="text-[var(--color-text-secondary)]">Soft 8px — like aged paper edges</span></p>
            <p><strong className="text-[var(--color-text)]">Shadows:</strong> <span className="text-[var(--color-text-secondary)]">Drop shadows — objects lift off paper</span></p>
            <p><strong className="text-[var(--color-text)]">Hover:</strong> <span className="text-[var(--color-text-secondary)]">Scale up + lift — cards float when touched</span></p>
            <p><strong className="text-[var(--color-text)]">Accent:</strong> <span className="text-[var(--color-text-secondary)]">Warm gold — afternoon sunlight</span></p>
          </div>
        )}
        
        {activeTheme === 'obsidian' && (
          <div className="space-y-3 text-sm">
            <p><strong className="text-[var(--color-text)]">Typography:</strong> <span className="text-[var(--color-text-secondary)]">Georgia serif — same as Vellum, its light twin</span></p>
            <p><strong className="text-[var(--color-text)]">Corners:</strong> <span className="text-[var(--color-text-secondary)]">Soft 8px — continuity with Vellum</span></p>
            <p><strong className="text-[var(--color-text)]">Shadows:</strong> <span className="text-[var(--color-text-secondary)]">Inner glow — surfaces radiate golden warmth</span></p>
            <p><strong className="text-[var(--color-text)]">Hover:</strong> <span className="text-[var(--color-text-secondary)]">Glow brighter — gold intensifies like candlelight</span></p>
            <p><strong className="text-[var(--color-text)]">Accent:</strong> <span className="text-[var(--color-text-secondary)]">Bright gold — glows against darkness</span></p>
          </div>
        )}
        
        {activeTheme === 'vesper' && (
          <div className="space-y-3 text-sm">
            <p><strong className="text-[var(--color-text)]">Typography:</strong> <span className="text-[var(--color-text-secondary)]">Inter humanist sans — clean but warm</span></p>
            <p><strong className="text-[var(--color-text)]">Corners:</strong> <span className="text-[var(--color-text-secondary)]">Clean 6px — precise, geometric</span></p>
            <p><strong className="text-[var(--color-text)]">Shadows:</strong> <span className="text-[var(--color-text-secondary)]">Minimal — restraint and clarity</span></p>
            <p><strong className="text-[var(--color-text)]">Hover:</strong> <span className="text-[var(--color-text-secondary)]">Border highlight, no scale — instant, no bounce</span></p>
            <p><strong className="text-[var(--color-text)]">Accent:</strong> <span className="text-[var(--color-text-secondary)]">Fjord blue — deep Nordic waters</span></p>
          </div>
        )}
        
        {activeTheme === 'scriptorium' && (
          <div className="space-y-3 text-sm">
            <p><strong className="text-[var(--color-text)]">Typography:</strong> <span className="text-[var(--color-text-secondary)]">Nunito organic sans — round, friendly, natural</span></p>
            <p><strong className="text-[var(--color-text)]">Corners:</strong> <span className="text-[var(--color-text-secondary)]">Pill 20px — like river stones</span></p>
            <p><strong className="text-[var(--color-text)]">Shadows:</strong> <span className="text-[var(--color-text-secondary)]">Soft diffuse — like mist in a valley</span></p>
            <p><strong className="text-[var(--color-text)]">Hover:</strong> <span className="text-[var(--color-text-secondary)]">Grounded warmth — no scale, subtle amber glow</span></p>
            <p><strong className="text-[var(--color-text)]">Accent:</strong> <span className="text-[var(--color-text-secondary)]">Amber — sunlight filtering through the canopy</span></p>
          </div>
        )}
      </Card>

      {/* Thomistic Framework */}
      <Card className="border-[var(--color-accent)] border-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-2">The Thomistic Principle</h3>
            <p className="text-[var(--color-text-secondary)]">
              Beauty emerges from <strong className="text-[var(--color-text)]">integritas</strong> (wholeness), 
              <strong className="text-[var(--color-text)]"> consonantia</strong> (proportion), and 
              <strong className="text-[var(--color-text)]"> claritas</strong> (radiance). 
              Each theme achieves these through different technical means—but the result is always an interface 
              where every element serves purpose with such precision that aesthetic pleasure becomes inevitable.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
