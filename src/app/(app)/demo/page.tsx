'use client';

import { useState } from 'react';
import { ElementSelector } from '@/components/features/element-selector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ElementSelectorDemo() {
  const [showSelector, setShowSelector] = useState(false);
  const [savedMapping, setSavedMapping] = useState<{
    mappings: Record<string, { selector: string; preview: string }>;
    domain: string;
  } | null>(null);

  const handleComplete = (
    mappings: Record<string, { selector: string; preview: string }>,
    domain: string
  ) => {
    setSavedMapping({ mappings, domain });
    setShowSelector(false);
  };

  if (showSelector) {
    return (
      <ElementSelector 
        onComplete={handleComplete}
        onCancel={() => setShowSelector(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <Badge variant="info" className="mb-4">Prototype</Badge>
        <h1 className="text-3xl font-bold text-[var(--color-text)] font-display tracking-tight">
          Element Selector
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 max-w-2xl">
          This is the core innovation of Trove—the UI that teaches the system to understand 
          any website through an intuitive point-and-click interface.
        </p>
      </div>

      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-[var(--color-accent-subtle)] to-[var(--color-warning-bg)] border-[var(--color-accent)]">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-20 h-20 bg-[var(--color-accent-subtle)] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-10 w-10 text-[var(--color-accent)]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              Try the Element Selector
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Experience how users will teach Trove to understand new websites. 
              This flow will appear when someone adds a product from an unmapped site.
            </p>
            <Button onClick={() => setShowSelector(true)}>
              Launch Demo
            </Button>
          </div>
        </div>
      </Card>

      {/* Saved Mapping Result */}
      {savedMapping && (
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <Code className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <h3 className="font-semibold text-[var(--color-text)]">Mapping Result</h3>
          </div>
          
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Domain: <code className="bg-[var(--color-bg-subtle)] px-2 py-1 rounded text-[var(--color-text)]">{savedMapping.domain}</code>
          </p>
          
          <div className="bg-[var(--color-text)] text-[var(--color-bg)] rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
              {JSON.stringify(savedMapping.mappings, null, 2)}
            </pre>
          </div>
          
          <p className="text-sm text-[var(--color-text-secondary)] mt-4">
            In production, this would be saved to the site_mappings table and used 
            to automatically extract product data from {savedMapping.domain}.
          </p>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4">How It Works</h3>
        <div className="space-y-4 text-[var(--color-text-secondary)]">
          <p>
            <strong className="text-[var(--color-text)]">1. User adds a product</strong> from a website we don&apos;t recognize yet.
          </p>
          <p>
            <strong className="text-[var(--color-text)]">2. We capture the page HTML</strong> and display it in a sandboxed preview.
          </p>
          <p>
            <strong className="text-[var(--color-text)]">3. User clicks on elements</strong> to identify the title, price, image, etc.
          </p>
          <p>
            <strong className="text-[var(--color-text)]">4. We generate CSS selectors</strong> from their clicks and save them.
          </p>
          <p>
            <strong className="text-[var(--color-text)]">5. Future users benefit</strong>—the mapping is shared globally.
          </p>
        </div>
      </Card>

      {/* Design Principles */}
      <Card>
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Design Principles</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-medium text-[var(--color-text)] mb-1">🧓 Grandma Test</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Anyone should understand &quot;click on the price&quot; without explanation.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)] mb-1">👨‍💻 Engineer Test</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Power users get keyboard shortcuts and see the generated selectors.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)] mb-1">✨ Satisfying Feedback</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Every click feels good—visual, instant, celebratory.
            </p>
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)] mb-1">🎯 Progressive Disclosure</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Simple by default, with hints available on demand.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
