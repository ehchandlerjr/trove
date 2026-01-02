'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/db/client';
import { formatPrice } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { PriceSnapshot } from '@/lib/db/database.types';

interface PriceHistoryProps {
  itemId: string;
  currentPrice: number | null;
  currency: string;
}

interface PriceDataPoint {
  price: number;
  date: Date;
}

/**
 * A compact price history display showing trend direction and sparkline.
 * Expands to show full price history on click.
 */
export function PriceHistory({ itemId, currentPrice, currency }: PriceHistoryProps) {
  const [history, setHistory] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('price_snapshots')
          .select('price, captured_at')
          .eq('item_id', itemId)
          .order('captured_at', { ascending: true })
          .limit(30); // Last 30 data points

        if (fetchError) throw fetchError;

        setHistory(
          (data || []).map((s: { price: number; captured_at: string }) => ({
            price: s.price,
            date: new Date(s.captured_at),
          }))
        );
      } catch (err) {
        console.error('Failed to fetch price history:', err);
        setError('Could not load price history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [itemId]);

  // No history to display
  if (loading) {
    return (
      <div className="h-4 w-16 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
    );
  }

  if (error || history.length === 0) {
    return null; // Silently hide if no history
  }

  // Calculate trend
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const priceDiff = lastPrice - firstPrice;
  const percentChange = firstPrice > 0 ? ((priceDiff / firstPrice) * 100).toFixed(1) : 0;
  
  const lowestPrice = Math.min(...history.map(h => h.price));
  const highestPrice = Math.max(...history.map(h => h.price));
  const isAtLowest = currentPrice !== null && currentPrice <= lowestPrice;

  // Determine trend icon and color
  let TrendIcon = Minus;
  let trendColor = 'text-[var(--color-text-muted)]';
  let trendBg = 'bg-[var(--color-bg-subtle)]';
  
  if (priceDiff < -0.01) {
    TrendIcon = TrendingDown;
    trendColor = 'text-[var(--color-success)]';
    trendBg = 'bg-[var(--color-success-bg)]';
  } else if (priceDiff > 0.01) {
    TrendIcon = TrendingUp;
    trendColor = 'text-[var(--color-danger)]';
    trendBg = 'bg-[var(--color-danger-bg)]';
  }

  // Generate sparkline points
  const sparklineWidth = 60;
  const sparklineHeight = 16;
  const points = history.map((point, i) => {
    const x = (i / (history.length - 1)) * sparklineWidth;
    const y = highestPrice === lowestPrice 
      ? sparklineHeight / 2
      : sparklineHeight - ((point.price - lowestPrice) / (highestPrice - lowestPrice)) * sparklineHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${trendBg} ${trendColor} hover:opacity-80`}
        aria-expanded={expanded}
        aria-label={`Price history: ${priceDiff < 0 ? 'down' : priceDiff > 0 ? 'up' : 'stable'} ${Math.abs(Number(percentChange))}%`}
      >
        <TrendIcon className="h-3 w-3" aria-hidden="true" />
        
        {/* Sparkline */}
        <svg 
          width={sparklineWidth} 
          height={sparklineHeight} 
          className="opacity-60"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
        
        <span className="font-medium">
          {priceDiff < 0 ? '−' : priceDiff > 0 ? '+' : ''}{Math.abs(Number(percentChange))}%
        </span>
        
        {expanded ? (
          <ChevronUp className="h-3 w-3 opacity-60" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
        )}
      </button>
      
      {/* Expanded details */}
      {expanded && (
        <div 
          className="mt-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm text-sm"
          role="region"
          aria-label="Price history details"
        >
          {isAtLowest && (
            <div className="flex items-center gap-2 text-[var(--color-success)] font-medium mb-2">
              <TrendingDown className="h-4 w-4" />
              Lowest tracked price!
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[var(--color-text-secondary)]">
            <div>Lowest:</div>
            <div className="font-medium text-[var(--color-text)]">
              {formatPrice(lowestPrice, currency)}
            </div>
            
            <div>Highest:</div>
            <div className="font-medium text-[var(--color-text)]">
              {formatPrice(highestPrice, currency)}
            </div>
            
            <div>First tracked:</div>
            <div className="font-medium text-[var(--color-text)]">
              {formatPrice(firstPrice, currency)}
            </div>
            
            <div>Data points:</div>
            <div className="font-medium text-[var(--color-text)]">
              {history.length}
            </div>
          </div>
          
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Tracking since {history[0].date.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
