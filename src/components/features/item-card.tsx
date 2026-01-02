'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/db/client';
import { ExternalLink, Trash2, MoreVertical, GripVertical, Check, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Item } from '@/lib/db/database.types';

interface ItemCardProps {
  item: Item;
  isOwner: boolean;
  onClaim?: () => void;
}

export function ItemCard({ item, isOwner, onClaim }: ItemCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    buttonRef.current?.focus();
  }, []);

  // Keyboard navigation for menu
  useEffect(() => {
    if (!showMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      } else if (e.key === 'Tab') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, closeMenu]);

  // Focus delete button when menu opens
  useEffect(() => {
    if (showMenu) {
      deleteButtonRef.current?.focus();
    }
  }, [showMenu]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowMenu(true);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id);

    if (!error) {
      toast.success('Item deleted');
      router.refresh();
    } else {
      setDeleting(false);
      setShowDeleteConfirm(false);
      toast.error('Failed to delete item');
    }
  };

  const priorityColors = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    must_have: 'danger',
  } as const;

  const hasDiscount = item.original_price && item.current_price && item.current_price < item.original_price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - item.current_price! / item.original_price!) * 100) 
    : 0;

  return (
    <Card className="relative group" padding="sm">
      <div className="flex gap-4">
        {/* Drag Handle (for future reordering) */}
        {isOwner && (
          <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        )}

        {/* Image placeholder */}
        {item.image_url ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-bg-subtle)]">
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg bg-[var(--color-bg-subtle)] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎁</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-[var(--color-text)] truncate">
                {item.title}
              </h3>
              
              {item.notes && (
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                  {item.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setShowMenu(!showMenu)}
                  onKeyDown={handleButtonKeyDown}
                  className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
                  aria-label="Item options"
                  aria-expanded={showMenu}
                  aria-haspopup="menu"
                >
                  <MoreVertical className="h-5 w-5 text-[var(--color-text-muted)]" aria-hidden="true" />
                </button>

                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={closeMenu} 
                    />
                    <div 
                      className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-xl)] border border-[var(--color-border-subtle)] py-1 z-20"
                      role="menu"
                    >
                      <button
                        ref={deleteButtonRef}
                        onClick={handleDeleteClick}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] focus:bg-[var(--color-danger-bg)] w-full text-sm transition-colors outline-none"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Price & badges row */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {item.current_price != null && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--color-text)]">
                  {formatPrice(item.current_price, item.currency)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-[var(--color-text-muted)] line-through">
                      {formatPrice(item.original_price!, item.currency)}
                    </span>
                    <Badge variant="success" size="sm">
                      -{discountPercent}%
                    </Badge>
                  </>
                )}
              </div>
            )}
            
            {item.priority !== 'medium' && (
              <Badge variant={priorityColors[item.priority]} size="sm">
                {item.priority.replace('_', ' ')}
              </Badge>
            )}

            {item.quantity > 1 && (
              <Badge variant="outline" size="sm">
                Qty: {item.quantity}
              </Badge>
            )}
          </div>

          {/* Link */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] mt-2 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View product
            </a>
          )}
        </div>

        {/* Claim button (for non-owners viewing shared lists) */}
        {!isOwner && onClaim && (
          <Button variant="outline" size="sm" onClick={onClaim}>
            <Check className="h-4 w-4" />
            Claim
          </Button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
            onClick={() => setShowDeleteConfirm(false)} 
          />
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-xl)] border border-[var(--color-border)] p-6 z-50"
            role="alertdialog"
            aria-labelledby="delete-item-title"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[var(--color-danger-bg)] rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" />
              </div>
              <div>
                <h3 id="delete-item-title" className="font-semibold text-[var(--color-text)]">
                  Delete item?
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  &ldquo;{item.title}&rdquo; will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleDeleteConfirm}
                loading={deleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
