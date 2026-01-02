'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Check, 
  Rows3,
  MousePointer,
  Undo2,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

/**
 * Catalog Mode for Teach-Site
 * 
 * Used for sites like mycomicshop.com where products are rows in a table,
 * not individual product pages. The teaching flow is:
 * 
 * 1. User clicks on a ROW (we detect the repeating pattern)
 * 2. Within that row, user maps: title, price, grade, image, etc.
 * 3. We store:
 *    - rowSelector: how to find all item rows
 *    - relativeSelectors: how to find fields within each row
 *    - identityFields: which fields uniquely identify an item
 * 
 * For price tracking, we:
 * 1. Re-fetch the catalog URL
 * 2. Find all rows using rowSelector
 * 3. Match to stored item by identityFields
 * 4. Extract current price from matching row
 */

interface CatalogModeProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  domain: string;
  url: string;
  iframeReady: boolean;
  onComplete: (mapping: CatalogMapping) => void;
  onCancel: () => void;
}

export interface CatalogMapping {
  type: 'catalog';
  domain: string;
  pathPattern: string;
  rowSelector: string;
  relativeSelectors: {
    title?: string;
    price?: string;
    originalPrice?: string;
    grade?: string;
    image?: string;
    link?: string;
  };
  identityFields: string[];  // e.g., ['title', 'grade']
  confidence: number;
}

interface RowSelection {
  selector: string;
  preview: string;
  childCount: number;
}

interface FieldSelection {
  selector: string;  // Relative to row
  preview: string;
}

const CATALOG_FIELDS = [
  { 
    id: 'title', 
    label: 'Item Name', 
    description: 'The name/title of each item',
    required: true, 
    isIdentity: true,
    icon: '📝',
  },
  { 
    id: 'price', 
    label: 'Price', 
    description: 'The current price',
    required: true, 
    isIdentity: false,
    icon: '💰',
  },
  { 
    id: 'grade', 
    label: 'Grade/Condition', 
    description: 'Quality rating (VF, NM, etc.)',
    required: false, 
    isIdentity: true,  // Often needed to distinguish items
    icon: '⭐',
  },
  { 
    id: 'image', 
    label: 'Image', 
    description: 'Product thumbnail',
    required: false, 
    isIdentity: false,
    icon: '🖼️',
  },
  { 
    id: 'originalPrice', 
    label: 'Original Price', 
    description: 'If there\'s a sale price',
    required: false, 
    isIdentity: false,
    icon: '🏷️',
  },
];

type Phase = 'intro' | 'selectRow' | 'selectFields' | 'review';

export function CatalogMode({ 
  iframeRef, 
  domain, 
  url,
  iframeReady,
  onComplete, 
  onCancel 
}: CatalogModeProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [rowSelection, setRowSelection] = useState<RowSelection | null>(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldMappings, setFieldMappings] = useState<Record<string, FieldSelection>>({});
  const [hoverInfo, setHoverInfo] = useState<{ tagName: string; preview: string } | null>(null);
  const [lastSelection, setLastSelection] = useState<{ preview: string } | null>(null);
  
  const currentField = CATALOG_FIELDS[currentFieldIndex];
  
  // Listen for messages from iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data?.type?.startsWith('trove:')) return;
      
      switch (event.data.type) {
        case 'trove:hover':
          setHoverInfo({
            tagName: event.data.tagName,
            preview: event.data.preview,
          });
          break;
          
        case 'trove:select':
          if (phase === 'selectRow') {
            handleRowSelect(event.data);
          } else if (phase === 'selectFields') {
            handleFieldSelect(event.data);
          }
          break;
          
        case 'trove:catalogRow':
          // Special message when row is detected with sibling count
          setRowSelection({
            selector: event.data.rowSelector,
            preview: event.data.preview,
            childCount: event.data.siblingCount,
          });
          break;
      }
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [phase]);
  
  const handleRowSelect = useCallback((data: { selector: string; preview: string; tagName: string }) => {
    // Tell iframe to find the repeating pattern
    iframeRef.current?.contentWindow?.postMessage({
      type: 'trove:detectRowPattern',
      clickedSelector: data.selector,
    }, '*');
  }, [iframeRef]);
  
  const handleFieldSelect = useCallback((data: { selector: string; preview: string }) => {
    if (!currentField) return;
    
    setLastSelection({ preview: data.preview });
    
    // Store relative selector (we'll compute this properly in the iframe)
    setFieldMappings(prev => ({
      ...prev,
      [currentField.id]: {
        selector: data.selector,  // This should be relative to row
        preview: data.preview,
      },
    }));
    
    // Move to next field
    setTimeout(() => {
      if (currentFieldIndex < CATALOG_FIELDS.length - 1) {
        setCurrentFieldIndex(prev => prev + 1);
        setLastSelection(null);
      } else {
        setPhase('review');
      }
    }, 600);
  }, [currentField, currentFieldIndex]);
  
  const handleConfirmRow = () => {
    if (!rowSelection) return;
    setPhase('selectFields');
    setCurrentFieldIndex(0);
    
    // Tell iframe to highlight the row and prepare for field selection
    iframeRef.current?.contentWindow?.postMessage({
      type: 'trove:enterRowMode',
      rowSelector: rowSelection.selector,
    }, '*');
  };
  
  const handleComplete = () => {
    if (!rowSelection) return;
    
    // Build the identity fields list (required fields that are marked as identity)
    const identityFields = CATALOG_FIELDS
      .filter(f => f.isIdentity && fieldMappings[f.id])
      .map(f => f.id);
    
    const mapping: CatalogMapping = {
      type: 'catalog',
      domain,
      pathPattern: new URL(url).pathname,
      rowSelector: rowSelection.selector,
      relativeSelectors: {
        title: fieldMappings.title?.selector,
        price: fieldMappings.price?.selector,
        grade: fieldMappings.grade?.selector,
        image: fieldMappings.image?.selector,
        originalPrice: fieldMappings.originalPrice?.selector,
      },
      identityFields,
      confidence: 0.8,
    };
    
    onComplete(mapping);
  };
  
  const handleSkipField = () => {
    if (currentFieldIndex < CATALOG_FIELDS.length - 1) {
      setCurrentFieldIndex(prev => prev + 1);
    } else {
      setPhase('review');
    }
  };
  
  const handleUndo = () => {
    if (currentFieldIndex > 0) {
      const prevField = CATALOG_FIELDS[currentFieldIndex - 1];
      setFieldMappings(prev => {
        const updated = { ...prev };
        delete updated[prevField.id];
        return updated;
      });
      setCurrentFieldIndex(prev => prev - 1);
    }
  };

  // Intro phase
  if (phase === 'intro') {
    return (
      <Card className="m-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-[var(--color-accent-subtle)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Rows3 className="h-6 w-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">
              Catalog-Style Page Detected
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              This looks like a listing page with multiple items (like a search results or inventory page). 
              We&apos;ll teach Trove to understand the row pattern.
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--color-bg-subtle)] rounded-lg p-4 mb-4">
          <h3 className="font-medium text-[var(--color-text)] mb-2">How this works:</h3>
          <ol className="text-sm text-[var(--color-text-secondary)] space-y-2">
            <li><strong>Step 1:</strong> Click on any item row to identify the pattern</li>
            <li><strong>Step 2:</strong> Within that row, click on each field (name, price, etc.)</li>
            <li><strong>Step 3:</strong> We&apos;ll use this to track prices for any item on this page</li>
          </ol>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setPhase('selectRow')} variant="primary">
            <MousePointer className="h-4 w-4" />
            Start Teaching
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Use Normal Mode Instead
          </Button>
        </div>
      </Card>
    );
  }
  
  // Row selection phase
  if (phase === 'selectRow') {
    return (
      <Card className="m-4">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-3xl">📋</span>
          <div>
            <h2 className="font-semibold text-[var(--color-text)]">Step 1: Select an Item Row</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Click on any single item/product row in the listing
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--color-accent-subtle)] text-[var(--color-text)] p-3 rounded-lg mb-4">
          <MousePointer className="h-4 w-4 inline mr-2 text-[var(--color-accent)]" />
          Click on <strong>one complete row</strong> containing an item
        </div>
        
        {hoverInfo && iframeReady && (
          <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] p-2 rounded mb-4">
            <span className="text-[var(--color-text-tertiary)]">&lt;{hoverInfo.tagName}&gt;</span>{' '}
            {hoverInfo.preview}
          </div>
        )}
        
        {rowSelection && (
          <div className="bg-[var(--color-success-bg)] p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-[var(--color-success)] font-medium mb-2">
              <Check className="h-4 w-4" />
              Found {rowSelection.childCount} similar rows!
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              Preview: {rowSelection.preview.substring(0, 100)}...
            </p>
            <Button onClick={handleConfirmRow} size="sm">
              <Check className="h-4 w-4" />
              This is correct, continue
            </Button>
          </div>
        )}
        
        <Button onClick={onCancel} variant="ghost" size="sm">
          Cancel
        </Button>
      </Card>
    );
  }
  
  // Field selection phase
  if (phase === 'selectFields' && currentField) {
    return (
      <Card className="m-4">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-3xl">{currentField.icon}</span>
          <div>
            <h2 className="font-semibold text-[var(--color-text)]">
              Step 2: Map Fields ({currentFieldIndex + 1}/{CATALOG_FIELDS.length})
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Now click on the <strong>{currentField.label}</strong> within the highlighted row
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--color-accent-subtle)] text-[var(--color-text)] p-3 rounded-lg mb-4">
          <MousePointer className="h-4 w-4 inline mr-2 text-[var(--color-accent)]" />
          Click on the <strong>{currentField.label.toLowerCase()}</strong>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {currentField.description}
          </p>
        </div>
        
        {lastSelection && (
          <div className="bg-[var(--color-success-bg)] text-[var(--color-success)] text-sm p-3 rounded-lg mb-4">
            <Check className="h-4 w-4 inline mr-2" />
            Got it: <span className="font-medium">{lastSelection.preview.substring(0, 50)}</span>
          </div>
        )}
        
        {/* Progress */}
        <div className="space-y-1.5 mb-4">
          {CATALOG_FIELDS.map((field, i) => (
            <div 
              key={field.id}
              className={`flex items-center gap-2 text-sm ${
                i === currentFieldIndex ? 'text-[var(--color-accent)] font-medium' : 
                fieldMappings[field.id] ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {fieldMappings[field.id] ? (
                <Check className="h-4 w-4" />
              ) : i === currentFieldIndex ? (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--color-accent)]" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border)]" />
              )}
              <span>{field.icon}</span>
              <span>{field.label}</span>
              {!field.required && <span className="text-xs text-[var(--color-text-muted)]">(optional)</span>}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          {currentFieldIndex > 0 && (
            <Button onClick={handleUndo} variant="ghost" size="sm">
              <Undo2 className="h-4 w-4" />
              Undo
            </Button>
          )}
          {!currentField.required && (
            <Button onClick={handleSkipField} variant="ghost" size="sm">
              Skip this field
            </Button>
          )}
        </div>
      </Card>
    );
  }
  
  // Review phase
  if (phase === 'review') {
    const hasRequired = fieldMappings.title && fieldMappings.price;
    
    return (
      <Card className="m-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-[var(--color-success-bg)] rounded-xl flex items-center justify-center">
            <Check className="h-6 w-6 text-[var(--color-success)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Review Your Mapping</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Here&apos;s what Trove learned about this page
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--color-bg-subtle)] rounded-lg p-4 mb-4 space-y-2">
          {CATALOG_FIELDS.map(field => (
            <div key={field.id} className="flex items-center gap-2 text-sm">
              <span>{field.icon}</span>
              <span className="font-medium text-[var(--color-text)]">{field.label}:</span>
              {fieldMappings[field.id] ? (
                <span className="text-[var(--color-success)]">
                  ✓ {fieldMappings[field.id].preview.substring(0, 30)}...
                </span>
              ) : (
                <span className="text-[var(--color-text-muted)]">Not mapped</span>
              )}
            </div>
          ))}
        </div>
        
        {!hasRequired && (
          <div className="bg-[var(--color-warning-bg)] p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-text)]">
              Title and Price are required for price tracking to work.
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleComplete} 
            variant="primary"
            disabled={!hasRequired}
          >
            <Check className="h-4 w-4" />
            Save Mapping
          </Button>
          <Button 
            onClick={() => {
              setPhase('selectFields');
              setCurrentFieldIndex(0);
            }} 
            variant="ghost"
          >
            Start Over
          </Button>
        </div>
      </Card>
    );
  }
  
  return null;
}
