'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Link as LinkIcon, 
  Loader2, 
  Check, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { createClient } from '@/lib/db/client';

interface ProductInfo {
  source: string;
  confidence: number;
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  url: string;
  needsMapping?: boolean;
}

interface List {
  id: string;
  title: string;
  emoji: string | null;
}

export default function AddFromUrlPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url') || '';
  const initialImage = searchParams.get('image') || '';
  
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Fetch lists on mount
  useEffect(() => {
    async function fetchLists() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data } = await supabase
        .from('lists')
        .select('id, title, emoji')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (data && data.length > 0) {
        const typedData = data as Array<{ id: string; title: string; emoji: string | null }>;
        setLists(typedData);
        setSelectedList(typedData[0].id);
      }
    }
    
    fetchLists();
  }, [router]);
  
  // Auto-parse if URL provided
  useEffect(() => {
    if (initialUrl) {
      handleParse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  async function handleParse() {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProduct(null);
    
    try {
      const response = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to parse URL');
        return;
      }
      
      if (data.product) {
        // If we have an image from the URL param, use it
        if (initialImage && !data.product.image) {
          data.product.image = initialImage;
        }
        setProduct(data.product);
      }
    } catch (e) {
      setError('Failed to parse URL. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleSave() {
    if (!product || !selectedList) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: selectedList,
          title: product.title || 'Untitled Item',
          description: product.description,
          url: product.url || url,
          imageUrl: product.image,
          currentPrice: product.price,
          currency: product.currency || 'USD',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to save item');
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/lists/${selectedList}`);
      }, 1500);
    } catch (e) {
      setError('Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  
  function getConfidenceLabel(confidence: number): { label: string; color: string } {
    if (confidence >= 0.8) return { label: 'High', color: 'text-[var(--color-success)]' };
    if (confidence >= 0.5) return { label: 'Medium', color: 'text-[var(--color-warning)]' };
    return { label: 'Low', color: 'text-[var(--color-danger)]' };
  }
  
  function formatPrice(price: number, currency: string = 'USD'): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(price);
    } catch {
      return `${currency} ${price}`;
    }
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[var(--color-success-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            Added to your list!
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Redirecting...
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2 font-display">
          Add from URL
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Paste a product URL and we&apos;ll extract the details automatically.
        </p>
        
        {/* URL Input */}
        <Card className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://example.com/product..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleParse} 
              disabled={loading || !url}
              variant="primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              {loading ? 'Parsing...' : 'Parse'}
            </Button>
          </div>
        </Card>
        
        {/* Error */}
        {error && (
          <Card className="mb-6 bg-[var(--color-danger-bg)] border-[var(--color-danger)]">
            <div className="flex items-center gap-3 text-[var(--color-danger)]">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </Card>
        )}
        
        {/* Loading */}
        {loading && (
          <Card className="mb-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)] mb-4" />
              <p className="text-[var(--color-text-secondary)]">
                Fetching product information...
              </p>
            </div>
          </Card>
        )}
        
        {/* Product Preview */}
        {product && !loading && (
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Image */}
              {product.image && (
                <div className="w-full sm:w-40 h-40 bg-[var(--color-bg-subtle)] rounded-lg overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image} 
                    alt={product.title || 'Product image'} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                {product.brand && (
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-1">
                    {product.brand}
                  </p>
                )}
                
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2 line-clamp-2">
                  {product.title || 'Unknown Product'}
                </h2>
                
                {product.price && (
                  <p className="text-xl font-bold text-[var(--color-accent)] mb-2">
                    {formatPrice(product.price, product.currency)}
                  </p>
                )}
                
                {product.availability && (
                  <p className="text-sm text-[var(--color-success)] mb-2">
                    {product.availability}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-text-muted)]">
                    Source: {product.source}
                  </span>
                  <span className={getConfidenceLabel(product.confidence).color}>
                    ({getConfidenceLabel(product.confidence).label} confidence)
                  </span>
                </div>
                
                <a 
                  href={product.url || url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline mt-2"
                >
                  View original
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            {/* Low confidence warning */}
            {product.confidence < 0.5 && (
              <div className="mt-4 p-4 bg-[var(--color-warning-bg)] rounded-lg">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--color-warning)] font-medium mb-1">
                      Low confidence detection
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      We couldn&apos;t reliably extract product info. You can still save this item, 
                      or help us learn this website for future users.
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => router.push(`/teach-site?url=${encodeURIComponent(url)}`)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Teach this site
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
        
        {/* List Selection & Save */}
        {product && !loading && lists.length > 0 && (
          <Card>
            <label htmlFor="list-select" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Add to list
            </label>
            <select
              id="list-select"
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.emoji || '📋'} {list.title}
                </option>
              ))}
            </select>
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              variant="primary"
              className="w-full"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Add to Wishlist'}
            </Button>
          </Card>
        )}
        
        {/* No lists */}
        {product && !loading && lists.length === 0 && (
          <Card className="text-center">
            <p className="text-[var(--color-text-secondary)] mb-4">
              You don&apos;t have any lists yet.
            </p>
            <Button onClick={() => router.push('/lists/new')} variant="primary">
              Create your first list
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
