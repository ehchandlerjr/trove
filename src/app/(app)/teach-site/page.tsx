'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Check, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Eye,
  MousePointer,
  ArrowLeft,
  RefreshCw,
  Undo2,
} from 'lucide-react';

// Fields that users can map
const FIELDS_TO_MAP = [
  { 
    id: 'title', 
    label: 'Product Name', 
    description: 'What is this thing called?',
    hint: 'The big, bold text—usually near the top',
    required: true, 
    icon: '📝',
    multiple: false,
  },
  { 
    id: 'price', 
    label: 'Current Price', 
    description: 'What it costs today',
    hint: 'The main price, not the crossed-out one',
    required: true, 
    icon: '💰',
    multiple: false,
  },
  { 
    id: 'image', 
    label: 'Product Photos', 
    description: 'All the product images',
    hint: 'Click the main image, then any additional photos. Click "Done with images" when finished.',
    required: true, 
    icon: '🖼️',
    multiple: true,  // Allow multiple selections
  },
  { 
    id: 'originalPrice', 
    label: 'Original Price', 
    description: 'The "before" price, if there\'s a sale',
    hint: 'Often crossed out or in smaller text',
    required: false, 
    icon: '🏷️',
    multiple: false,
  },
  { 
    id: 'description', 
    label: 'Product Description', 
    description: 'A summary or details',
    hint: 'Usually a paragraph below the title',
    required: false, 
    icon: '📄',
    multiple: false,
  },
];

interface Mapping {
  selector: string;
  preview: string;
  elementType?: string;
}

// For fields that allow multiple selections (like images)
interface MultiMapping {
  items: Mapping[];
}

type Mappings = Record<string, Mapping | MultiMapping>;

function isMultiMapping(m: Mapping | MultiMapping): m is MultiMapping {
  return 'items' in m;
}

export default function TeachSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url') || '';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Mapping state
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [mappings, setMappings] = useState<Mappings>({});
  const [mode, setMode] = useState<'input' | 'selecting' | 'complete'>('input');
  const [showHint, setShowHint] = useState(false);
  const [lastSelection, setLastSelection] = useState<{ selector: string; preview: string } | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ tagName: string; preview: string } | null>(null);
  
  const currentField = FIELDS_TO_MAP[currentFieldIndex];
  const progress = (currentFieldIndex / FIELDS_TO_MAP.length) * 100;
  
  // Get current image count for multi-select fields
  const currentImageCount = currentField?.multiple && mappings[currentField.id] 
    ? (mappings[currentField.id] as MultiMapping).items?.length || 0 
    : 0;
  
  // Handle element selection callback - needs to be stable
  const handleElementSelectCallback = useCallback((selector: string, preview: string, elementType?: string) => {
    if (!currentField) return;
    
    setLastSelection({ selector, preview });
    
    // Handle multi-select fields (like images)
    if (currentField.multiple) {
      setMappings(prev => {
        const existing = prev[currentField.id] as MultiMapping | undefined;
        const existingItems = existing?.items || [];
        
        // Check if this selector is already added (avoid duplicates)
        if (existingItems.some(item => item.selector === selector)) {
          return prev;
        }
        
        return {
          ...prev,
          [currentField.id]: {
            items: [...existingItems, { selector, preview, elementType }],
          },
        };
      });
      
      // For multi-select, DON'T auto-advance. Show feedback and stay on same field.
      // The "Done with images" button will advance.
      setTimeout(() => {
        setLastSelection(null);
        // Don't clear selection - let user see what they've selected
      }, 1500);
      
    } else {
      // Single-select field (original behavior)
      setMappings(prev => ({
        ...prev,
        [currentField.id]: { selector, preview, elementType },
      }));
      
      // Move to next field after a brief delay for feedback
      setTimeout(() => {
        if (currentFieldIndex < FIELDS_TO_MAP.length - 1) {
          setCurrentFieldIndex(prev => prev + 1);
          setShowHint(false);
          setLastSelection(null);
          // Clear selection highlight in iframe
          iframeRef.current?.contentWindow?.postMessage({ type: 'trove:clearSelection' }, '*');
        } else {
          setMode('complete');
        }
      }, 600);
    }
  }, [currentField, currentFieldIndex]);
  
  // Handle "Done with images" for multi-select fields
  const handleDoneWithMultiSelect = useCallback(() => {
    if (currentFieldIndex < FIELDS_TO_MAP.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
      setShowHint(false);
      setLastSelection(null);
      iframeRef.current?.contentWindow?.postMessage({ type: 'trove:clearSelection' }, '*');
    } else {
      setMode('complete');
    }
  }, [currentFieldIndex]);
  
  // Fetch page when URL is provided
  useEffect(() => {
    if (initialUrl) {
      handleFetchPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Listen for postMessage from iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Verify message is from our iframe
      if (event.data?.type?.startsWith('trove:')) {
        switch (event.data.type) {
          case 'trove:ready':
            setIframeReady(true);
            setLoading(false);
            break;
            
          case 'trove:hover':
            setHoverInfo({
              tagName: event.data.tagName,
              preview: event.data.preview,
            });
            break;
            
          case 'trove:select':
            handleElementSelectCallback(event.data.selector, event.data.preview, event.data.elementType);
            break;
        }
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleElementSelectCallback]);
  
  async function handleFetchPage() {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setIframeReady(false);
    
    try {
      // Extract domain for display
      const parsedUrl = new URL(url);
      setDomain(parsedUrl.hostname.replace(/^www\./, ''));
      setMode('selecting');
      
      // The iframe will load via the proxy endpoint
      // Loading state is cleared when iframe sends 'ready' message
      
      // Set a timeout in case the page doesn't load
      setTimeout(() => {
        if (!iframeReady) {
          setError('This page is taking a while. Some stores don\'t allow previews—you might try a different product or add it manually.');
          setLoading(false);
        }
      }, 20000);
      
    } catch {
      setError('Something went wrong loading that page. Mind trying again?');
      setLoading(false);
    }
  }
  
  // Skip current field
  function handleSkip() {
    setShowHint(false);
    if (currentFieldIndex < FIELDS_TO_MAP.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    } else {
      setMode('complete');
    }
  }
  
  // Undo last selection
  function handleUndo() {
    if (currentFieldIndex > 0) {
      const prevIndex = currentFieldIndex - 1;
      const prevField = FIELDS_TO_MAP[prevIndex];
      
      // Remove the previous mapping
      setMappings(prev => {
        const newMappings = { ...prev };
        delete newMappings[prevField.id];
        return newMappings;
      });
      
      setCurrentFieldIndex(prevIndex);
      setShowHint(false);
    }
  }
  
  // Save mapping to database
  async function handleSave() {
    // Check required fields
    const missingRequired = FIELDS_TO_MAP
      .filter(f => f.required && !mappings[f.id])
      .map(f => f.label);
    
    if (missingRequired.length > 0) {
      setError(`We still need the ${missingRequired.join(' and ')} to make this work.`);
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Convert mappings to selectors format, handling both single and multi-select
      const selectors: Record<string, string | string[]> = {};
      for (const [field, mapping] of Object.entries(mappings)) {
        if (isMultiMapping(mapping)) {
          // Multi-select: store array of selectors
          selectors[field] = mapping.items.map(item => item.selector);
        } else {
          // Single select: store single selector
          selectors[field] = mapping.selector;
        }
      }
      
      const response = await fetch('/api/site-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          pathPattern: '*',
          selectors,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Couldn\'t save that. Want to try again?');
        return;
      }
      
      setSuccess(true);
    } catch {
      setError('Couldn\'t save that. Want to try again?');
    } finally {
      setSaving(false);
    }
  }
  
  // Reset to start over
  function handleReset() {
    setMode('input');
    setCurrentFieldIndex(0);
    setMappings({});
    setShowHint(false);
    setIframeReady(false);
    setLastSelection(null);
    setHoverInfo(null);
  }
  
  // Go back to edit from complete screen
  function handleBackToEdit() {
    setMode('selecting');
    // Go to first unmapped required field, or last field
    const firstUnmapped = FIELDS_TO_MAP.findIndex(f => f.required && !mappings[f.id]);
    setCurrentFieldIndex(firstUnmapped >= 0 ? firstUnmapped : FIELDS_TO_MAP.length - 1);
  }
  
  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[var(--color-success-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2 font-display">
            You&apos;ve unlocked {domain}
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            From now on, anyone adding something from this store will have it just work—because you took thirty seconds to show us around.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push(`/add-from-url?url=${encodeURIComponent(url)}`)} variant="primary">
              Add This to My List
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="ghost">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Review screen
  if (mode === 'complete') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4 font-display">
              Does this look right?
            </h2>
            
            <p className="text-[var(--color-text-secondary)] mb-6">
              Here&apos;s what you showed us about <strong>{domain}</strong>:
            </p>
            
            <div className="space-y-3 mb-6">
              {FIELDS_TO_MAP.map((field) => {
                const mapping = mappings[field.id];
                const getPreview = () => {
                  if (!mapping) return null;
                  if (isMultiMapping(mapping)) {
                    return `${mapping.items.length} item${mapping.items.length !== 1 ? 's' : ''} selected`;
                  }
                  return mapping.preview;
                };
                return (
                  <div 
                    key={field.id}
                    className="flex items-center gap-3 p-3 bg-[var(--color-bg-subtle)] rounded-lg"
                  >
                    <span className="text-2xl" aria-hidden="true">{field.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-text)]">{field.label}</p>
                      {mapping ? (
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {getPreview()}
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--color-text-muted)] italic">
                          Not found on this page
                        </p>
                      )}
                    </div>
                    {mapping && (
                      <Check className="h-5 w-5 text-[var(--color-success)] flex-shrink-0" aria-label="Found" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {error && (
              <div className="p-4 bg-[var(--color-danger-bg)] rounded-lg mb-6" role="alert">
                <div className="flex items-center gap-3 text-[var(--color-danger)]">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button onClick={handleBackToEdit} variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={handleSave} disabled={saving} variant="primary" className="flex-1">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Looks Good'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  // Selection mode with real iframe
  if (mode === 'selecting') {
    const proxyUrl = `/api/proxy-page?url=${encodeURIComponent(url)}`;
    
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        {/* Header */}
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[var(--color-accent)]" aria-hidden="true" />
              <h1 className="font-semibold text-[var(--color-text)]">
                Showing Trove around <span className="text-[var(--color-accent)]">{domain}</span>
              </h1>
            </div>
            <Button onClick={handleReset} variant="ghost" size="sm">
              Never mind
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="max-w-7xl mx-auto mt-3">
            <div 
              className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Mapping progress"
            >
              <div 
                className="h-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Page Preview - Iframe */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="p-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] flex items-center gap-2">
              <Eye className="h-4 w-4 text-[var(--color-text-tertiary)]" aria-hidden="true" />
              <span className="text-sm text-[var(--color-text-tertiary)]">Page Preview</span>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)] ml-2" />
              )}
              {iframeReady && (
                <span className="text-xs text-[var(--color-success)] ml-auto flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ready
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setIframeReady(false);
                  setLoading(true);
                  const iframe = iframeRef.current;
                  if (iframe) {
                    iframe.src = proxyUrl;
                  }
                }}
                className="ml-2"
                aria-label="Reload page"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 relative bg-white">
              {loading && !iframeReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg)] z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)] mb-4" />
                  <p className="text-[var(--color-text-secondary)]">Loading the page...</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">This can take a moment</p>
                </div>
              )}
              
              {error && mode === 'selecting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg)] z-10 p-8">
                  <AlertCircle className="h-12 w-12 text-[var(--color-danger)] mb-4" />
                  <p className="text-[var(--color-text)] font-medium mb-2">This page won&apos;t load</p>
                  <p className="text-[var(--color-text-secondary)] text-center mb-4 max-w-sm">{error}</p>
                  <div className="flex gap-3">
                    <Button onClick={handleReset} variant="outline">
                      Try a Different Page
                    </Button>
                    <Button 
                      onClick={() => window.open(url, '_blank')} 
                      variant="ghost"
                    >
                      <ExternalLink className="h-4 w-4" />
                      See Original
                    </Button>
                  </div>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                src={proxyUrl}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
                title="Product page preview"
                onLoad={() => {
                  // The iframe script will send a 'ready' message
                  // This is a fallback timeout
                  setTimeout(() => {
                    if (!iframeReady) {
                      setLoading(false);
                    }
                  }, 5000);
                }}
                onError={() => {
                  setError('Failed to load page');
                  setLoading(false);
                }}
              />
            </div>
          </div>
          
          {/* Instructions Panel */}
          <aside className="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Current Field Card */}
              <Card>
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl" aria-hidden="true">{currentField?.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--color-text)]">{currentField?.label}</p>
                    <p className="text-sm text-[var(--color-text-tertiary)]">{currentField?.description}</p>
                  </div>
                </div>
                
                <div className="bg-[var(--color-accent-subtle)] text-[var(--color-text)] p-3 rounded-lg mb-4">
                  <MousePointer className="h-4 w-4 inline mr-2 text-[var(--color-accent)]" aria-hidden="true" />
                  Point to the <strong>{currentField?.label.toLowerCase()}</strong> and click it
                </div>
                
                {/* Hover preview */}
                {hoverInfo && iframeReady && (
                  <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] p-2 rounded mb-4 truncate">
                    <span className="text-[var(--color-text-tertiary)]">&lt;{hoverInfo.tagName}&gt;</span>{' '}
                    {hoverInfo.preview}
                  </div>
                )}
                
                {/* Last selection feedback */}
                {lastSelection && (
                  <div className="bg-[var(--color-success-bg)] text-[var(--color-success)] text-sm p-3 rounded-lg mb-4 animate-pulse">
                    <Check className="h-4 w-4 inline mr-2" aria-hidden="true" />
                    Got it: <span className="font-medium truncate inline-block max-w-[180px] align-bottom">{lastSelection.preview}</span>
                  </div>
                )}
                
                {showHint && (
                  <div className="bg-[var(--color-warning-bg)] text-[var(--color-text)] text-sm p-4 rounded-lg mb-4">
                    💡 {currentField?.hint}
                  </div>
                )}
                
                {/* Multi-select counter (for images) */}
                {currentField?.multiple && currentImageCount > 0 && (
                  <div className="bg-[var(--color-bg-subtle)] text-[var(--color-text)] text-sm p-3 rounded-lg mb-4">
                    <span className="font-semibold">{currentImageCount}</span> image{currentImageCount !== 1 ? 's' : ''} selected
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(mappings[currentField.id] as MultiMapping)?.items?.map((item, i) => (
                        <span 
                          key={i} 
                          className="inline-block px-2 py-0.5 bg-[var(--color-surface)] rounded text-xs truncate max-w-[120px]"
                          title={item.preview}
                        >
                          {item.preview.startsWith('http') ? `Image ${i + 1}` : item.preview.slice(0, 20)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {/* Done with multi-select button */}
                  {currentField?.multiple && currentImageCount > 0 && (
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={handleDoneWithMultiSelect}
                    >
                      <Check className="h-4 w-4" />
                      Done with images
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    {showHint ? 'Hide hint' : 'Need a hint?'}
                  </Button>
                  
                  {currentFieldIndex > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleUndo}
                    >
                      <Undo2 className="h-4 w-4" />
                      Undo
                    </Button>
                  )}
                  
                  {!currentField?.required && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleSkip}
                    >
                      Can&apos;t find it
                    </Button>
                  )}
                </div>
              </Card>
              
              {/* Progress List */}
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
                        <Check className="h-4 w-4 flex-shrink-0" aria-label="Completed" />
                      ) : i === currentFieldIndex ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[var(--color-accent)] flex-shrink-0" aria-label="Current" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border)] flex-shrink-0" aria-label="Pending" />
                      )}
                      <span aria-hidden="true">{field.icon}</span>
                      <span className="truncate">{field.label}</span>
                      {/* Show count for multi-select fields */}
                      {field.multiple && mappings[field.id] && isMultiMapping(mappings[field.id]) && (
                        <span className="text-xs bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-1.5 py-0.5 rounded-full">
                          {(mappings[field.id] as MultiMapping).items.length}
                        </span>
                      )}
                      {!field.required && !mappings[field.id] && <span className="text-[var(--color-text-muted)] text-xs flex-shrink-0">(if visible)</span>}
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Quick Actions */}
              <div className="text-center">
                <Button 
                  onClick={() => setMode('complete')} 
                  variant="outline"
                  size="sm"
                  disabled={!Object.values(mappings).some(m => m)}
                >
                  I&apos;m Done
                </Button>
              </div>
              
              {/* Screen reader announcement */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                Looking for the {currentField?.label}. {currentField?.hint}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }
  
  // Initial URL input mode
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-accent-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-[var(--color-accent)]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2 font-display">
            New store? Show us around.
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Trove doesn&apos;t recognize this site yet. Point out where the product name, 
            price, and photo are—takes about thirty seconds—and we&apos;ll remember it forever.
          </p>
        </div>
        
        <Card>
          <label htmlFor="website-url" className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Product page URL
          </label>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Input
                id="website-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchPage()}
                disabled={loading}
                aria-describedby="url-help"
              />
            </div>
            <Button 
              onClick={handleFetchPage} 
              disabled={loading || !url}
              variant="primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {loading ? 'Loading...' : 'Let&apos;s Go'}
            </Button>
          </div>
          
          <p id="url-help" className="text-sm text-[var(--color-text-muted)]">
            Paste the link to any product you want to add. We&apos;ll load it so you can click on the important bits.
          </p>
          
          {error && (
            <div className="p-4 bg-[var(--color-danger-bg)] rounded-lg mt-4" role="alert">
              <div className="flex items-center gap-3 text-[var(--color-danger)]">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </Card>
        
        <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          After this, anyone adding products from this store will have them recognized instantly.
        </p>
      </div>
    </div>
  );
}
