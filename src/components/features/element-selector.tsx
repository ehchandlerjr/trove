'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, SkipForward, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';

/**
 * Element Selector Prototype
 * 
 * This is the core innovation of Trove - the UI that teaches the system
 * to understand any website through an intuitive point-and-click interface.
 * 
 * Design principles:
 * - Grandma to Engineer: Must be obvious to non-tech users
 * - Progressive Disclosure: Simple surface, depth on demand
 * - Satisfying feedback: Every action feels good
 */

// Mock product page structure (in production, this comes from captured HTML)
const MOCK_PRODUCT = {
  domain: 'example-store.com',
  url: 'https://example-store.com/products/headphones-xm5',
  elements: [
    { 
      id: 'img', 
      type: 'image', 
      selector: 'img.product-hero', 
      content: '🎧',
      preview: '[Product Image]',
    },
    { 
      id: 'brand', 
      type: 'text', 
      selector: 'span.brand-name', 
      content: 'TechGear Pro',
      preview: 'TechGear Pro',
    },
    { 
      id: 'title', 
      type: 'text', 
      selector: 'h1.product-title', 
      content: 'Wireless Noise-Canceling Headphones XM5',
      preview: 'Wireless Noise-Canceling Headphones XM5',
    },
    { 
      id: 'rating', 
      type: 'text', 
      selector: 'div.rating-stars', 
      content: '★★★★☆ (2,847 reviews)',
      preview: '★★★★☆ (2,847)',
    },
    { 
      id: 'price', 
      type: 'text', 
      selector: 'span.current-price', 
      content: '$279.99',
      preview: '$279.99',
    },
    { 
      id: 'original-price', 
      type: 'text', 
      selector: 'span.original-price', 
      content: '$349.99',
      preview: '$349.99',
    },
    { 
      id: 'save', 
      type: 'text', 
      selector: 'span.savings-badge', 
      content: 'Save $70 (20%)',
      preview: 'Save 20%',
    },
    { 
      id: 'stock', 
      type: 'text', 
      selector: 'span.availability', 
      content: 'In Stock',
      preview: 'In Stock',
    },
    { 
      id: 'prime', 
      type: 'badge', 
      selector: 'span.shipping-badge', 
      content: '✓ Free Shipping',
      preview: 'Free Shipping',
    },
  ],
};

// Fields that users need to map
const FIELDS_TO_MAP = [
  { 
    id: 'title', 
    label: 'Product Title', 
    description: 'The main name of the product',
    hint: 'Usually the biggest text near the top',
    required: true, 
    icon: '📝',
  },
  { 
    id: 'price', 
    label: 'Current Price', 
    description: 'What it costs right now',
    hint: 'Look for the main price, not the original',
    required: true, 
    icon: '💰',
  },
  { 
    id: 'image', 
    label: 'Product Image', 
    description: 'The main product photo',
    hint: 'The biggest image of the product',
    required: true, 
    icon: '🖼️',
  },
  { 
    id: 'originalPrice', 
    label: 'Original Price', 
    description: 'Price before any sale (if shown)',
    hint: 'Often crossed out or smaller',
    required: false, 
    icon: '🏷️',
  },
  { 
    id: 'availability', 
    label: 'Stock Status', 
    description: '"In Stock", "Out of Stock", etc.',
    hint: 'Text saying if you can buy it',
    required: false, 
    icon: '📦',
  },
];

type MappingResult = {
  elementId: string;
  selector: string;
  preview: string;
};

type Mappings = Record<string, MappingResult>;

interface ElementSelectorProps {
  onComplete?: (mappings: Mappings, domain: string) => void;
  onCancel?: () => void;
}

export function ElementSelector({ onComplete, onCancel }: ElementSelectorProps) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [mappings, setMappings] = useState<Mappings>({});
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [mode, setMode] = useState<'intro' | 'selecting' | 'complete'>('intro');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentField = FIELDS_TO_MAP[currentFieldIndex];
  const progress = (currentFieldIndex / FIELDS_TO_MAP.length) * 100;

  // Handle element click
  const handleElementClick = useCallback((elementId: string) => {
    if (mode !== 'selecting') return;
    
    const element = MOCK_PRODUCT.elements.find(e => e.id === elementId);
    if (!element) return;

    // Save the mapping
    setMappings(prev => ({
      ...prev,
      [currentField.id]: { 
        elementId, 
        selector: element.selector, 
        preview: element.preview,
      },
    }));

    // Show success feedback
    setShowSuccess(true);
    setShowHint(false);
    
    setTimeout(() => {
      setShowSuccess(false);
      // Move to next field or complete
      if (currentFieldIndex < FIELDS_TO_MAP.length - 1) {
        setCurrentFieldIndex(prev => prev + 1);
      } else {
        setMode('complete');
      }
    }, 500);
  }, [mode, currentField, currentFieldIndex]);

  // Skip current field
  const handleSkip = () => {
    setShowHint(false);
    if (currentFieldIndex < FIELDS_TO_MAP.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    } else {
      setMode('complete');
    }
  };

  // Start over
  const handleReset = () => {
    setMode('intro');
    setCurrentFieldIndex(0);
    setMappings({});
    setHoveredElement(null);
    setShowHint(false);
  };

  // Complete and submit
  const handleComplete = () => {
    if (onComplete) {
      onComplete(mappings, MOCK_PRODUCT.domain);
    }
  };

  // Get styling for an element
  const getElementClasses = (elementId: string) => {
    const isHovered = hoveredElement === elementId;
    const isMapped = Object.values(mappings).some(m => m.elementId === elementId);
    
    let classes = 'cursor-pointer rounded px-1 transition-all duration-150 ';
    
    if (isMapped) {
      classes += 'bg-[var(--color-success-bg)] ring-2 ring-[var(--color-success)] ring-offset-1 ';
    } else if (isHovered && mode === 'selecting') {
      classes += 'bg-[var(--color-accent-subtle)] ring-2 ring-[var(--color-accent)] ring-offset-1 ';
    } else if (mode === 'selecting') {
      classes += 'hover:bg-[var(--color-accent-subtle)] ';
    }
    
    return classes;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'selecting') return;
      
      if (e.key === 'Escape') {
        onCancel?.();
      } else if (e.key === 's' || e.key === 'Tab') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === '?') {
        setShowHint(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onCancel]);

  // =========================================================================
  // RENDER: Intro Screen
  // =========================================================================
  if (mode === 'intro') {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <Card className="max-w-md text-center" padding="lg">
          <div className="w-16 h-16 bg-[var(--color-accent-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-[var(--color-accent)]" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 font-display">
            Help us understand this page
          </h2>
          
          <p className="text-[var(--color-text-secondary)] mb-6">
            We'll show you a product page and ask you to tap on a few things—like 
            the price and title. Takes about 30 seconds, and helps everyone!
          </p>
          
          <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">You'll identify:</p>
            <div className="flex flex-wrap gap-2">
              {FIELDS_TO_MAP.slice(0, 3).map(field => (
                <Badge key={field.id} variant="outline">
                  {field.icon} {field.label}
                </Badge>
              ))}
              <Badge variant="outline">+ {FIELDS_TO_MAP.length - 3} more</Badge>
            </div>
          </div>
          
          <div className="flex gap-4">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="flex-1">
                Not now
              </Button>
            )}
            <Button onClick={() => setMode('selecting')} className="flex-1">
              Let's do it →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // RENDER: Complete Screen
  // =========================================================================
  if (mode === 'complete') {
    const mappedCount = Object.keys(mappings).length;
    const requiredMapped = FIELDS_TO_MAP.filter(f => f.required && mappings[f.id]).length;
    const requiredTotal = FIELDS_TO_MAP.filter(f => f.required).length;
    
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <Card className="max-w-md text-center" padding="lg">
          <div className="w-16 h-16 bg-[var(--color-success-bg)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 font-display">
            You're amazing! 🎉
          </h2>
          
          <p className="text-[var(--color-text-secondary)] mb-6">
            You mapped {mappedCount} field{mappedCount !== 1 ? 's' : ''}. 
            This helps Trove understand {MOCK_PRODUCT.domain} for everyone.
          </p>
          
          {/* Summary of mappings */}
          <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">What you mapped:</p>
            <div className="space-y-2">
              {FIELDS_TO_MAP.map(field => (
                <div key={field.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{field.icon}</span>
                    <span className="text-[var(--color-text-secondary)]">{field.label}</span>
                  </span>
                  {mappings[field.id] ? (
                    <span className="text-[var(--color-success)] font-medium truncate max-w-[150px]">
                      {mappings[field.id].preview}
                    </span>
                  ) : (
                    <span className="text-[var(--color-text-muted)]">Skipped</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {requiredMapped < requiredTotal && (
            <p className="text-[var(--color-warning)] text-sm mb-4">
              ⚠️ Some required fields were skipped. The mapping may not work perfectly.
            </p>
          )}
          
          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Start over
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Save mapping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // RENDER: Selection Mode
  // =========================================================================
  return (
    <div className="min-h-[600px] bg-gradient-to-br from-[var(--color-warning-bg)] to-[var(--color-accent-subtle)] p-4">
      {/* Header with progress */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--color-text)] font-display">
            Trove
          </h1>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid gap-4 lg:grid-cols-[1fr,320px]">
        {/* Mock Product Page */}
        <Card className={`transition-all duration-300 ${showSuccess ? 'ring-4 ring-[var(--color-success)]' : ''}`}>
          <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] rounded-t-xl">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
              </div>
              <div className="flex-1 bg-white rounded px-4 py-1 text-xs truncate">
                {MOCK_PRODUCT.url}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Simulated product page */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product Image */}
              <div 
                className={`w-full sm:w-48 h-48 bg-[var(--color-bg-subtle)] rounded-xl flex items-center justify-center text-6xl ${getElementClasses('img')}`}
                onMouseEnter={() => setHoveredElement('img')}
                onMouseLeave={() => setHoveredElement(null)}
                onClick={() => handleElementClick('img')}
              >
                {MOCK_PRODUCT.elements.find(e => e.id === 'img')?.content}
              </div>
              
              {/* Product Details */}
              <div className="flex-1 space-y-4">
                {/* Brand */}
                <p 
                  className={`text-sm text-[var(--color-text-tertiary)] ${getElementClasses('brand')}`}
                  onMouseEnter={() => setHoveredElement('brand')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleElementClick('brand')}
                >
                  {MOCK_PRODUCT.elements.find(e => e.id === 'brand')?.content}
                </p>
                
                {/* Title */}
                <h2 
                  className={`text-xl font-semibold text-[var(--color-text)] ${getElementClasses('title')}`}
                  onMouseEnter={() => setHoveredElement('title')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleElementClick('title')}
                >
                  {MOCK_PRODUCT.elements.find(e => e.id === 'title')?.content}
                </h2>
                
                {/* Rating */}
                <p 
                  className={`text-sm text-[var(--color-warning)] ${getElementClasses('rating')}`}
                  onMouseEnter={() => setHoveredElement('rating')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleElementClick('rating')}
                >
                  {MOCK_PRODUCT.elements.find(e => e.id === 'rating')?.content}
                </p>
                
                {/* Price row */}
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span 
                    className={`text-2xl font-bold text-[var(--color-text)] ${getElementClasses('price')}`}
                    onMouseEnter={() => setHoveredElement('price')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => handleElementClick('price')}
                  >
                    {MOCK_PRODUCT.elements.find(e => e.id === 'price')?.content}
                  </span>
                  <span 
                    className={`text-lg text-[var(--color-text-muted)] line-through ${getElementClasses('original-price')}`}
                    onMouseEnter={() => setHoveredElement('original-price')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => handleElementClick('original-price')}
                  >
                    {MOCK_PRODUCT.elements.find(e => e.id === 'original-price')?.content}
                  </span>
                  <span 
                    className={`text-sm font-medium text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-1 rounded ${getElementClasses('save')}`}
                    onMouseEnter={() => setHoveredElement('save')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => handleElementClick('save')}
                  >
                    {MOCK_PRODUCT.elements.find(e => e.id === 'save')?.content}
                  </span>
                </div>
                
                {/* Availability */}
                <div className="flex items-center gap-4">
                  <span 
                    className={`text-sm text-[var(--color-success)] ${getElementClasses('stock')}`}
                    onMouseEnter={() => setHoveredElement('stock')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => handleElementClick('stock')}
                  >
                    {MOCK_PRODUCT.elements.find(e => e.id === 'stock')?.content}
                  </span>
                  <span 
                    className={`text-sm text-[var(--color-info)] ${getElementClasses('prime')}`}
                    onMouseEnter={() => setHoveredElement('prime')}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => handleElementClick('prime')}
                  >
                    {MOCK_PRODUCT.elements.find(e => e.id === 'prime')?.content}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instruction Panel */}
        <div className="space-y-4">
          <Card className={showSuccess ? 'bg-[var(--color-success-bg)] border-emerald-200' : ''}>
            {showSuccess ? (
              <div className="text-center py-4">
                <Check className="h-8 w-8 text-[var(--color-success)] mx-auto mb-2" />
                <p className="font-medium text-[var(--color-success)]">Got it!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{currentField.icon}</span>
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">{currentField.label}</p>
                    <p className="text-sm text-[var(--color-text-tertiary)]">{currentField.description}</p>
                  </div>
                </div>
                
                <p className="text-[var(--color-text-secondary)] mb-4">
                  Click on the <strong>{currentField.label.toLowerCase()}</strong> in the page preview.
                </p>
                
                {showHint && (
                  <div className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] text-sm p-4 rounded-lg mb-4">
                    💡 <strong>Hint:</strong> {currentField.hint}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    {showHint ? 'Hide hint' : 'Hint'}
                  </Button>
                  
                  {!currentField.required && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleSkip}
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Progress summary */}
          <Card padding="sm">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Progress</p>
            <div className="space-y-1.5">
              {FIELDS_TO_MAP.map((field, i) => (
                <div 
                  key={field.id}
                  className={`flex items-center gap-2 text-sm ${
                    i === currentFieldIndex ? 'text-[var(--color-accent)] font-medium' : 
                    mappings[field.id] ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {mappings[field.id] ? (
                    <Check className="h-4 w-4" />
                  ) : i === currentFieldIndex ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--color-accent)]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border)]" />
                  )}
                  <span>{field.icon}</span>
                  <span>{field.label}</span>
                  {!field.required && <span className="text-[var(--color-text-muted)] text-xs">(optional)</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* Keyboard shortcuts */}
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Press <kbd className="px-1.5 py-1 bg-[var(--color-bg-subtle)] rounded">?</kbd> for hint, 
            <kbd className="px-1.5 py-1 bg-[var(--color-bg-subtle)] rounded ml-1">S</kbd> to skip
          </p>
        </div>
      </div>
    </div>
  );
}
