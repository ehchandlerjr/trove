'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/db/client';
import { urlSchema } from '@/lib/core/schemas';
import { 
  ExternalLink, 
  Trash2, 
  MoreVertical, 
  GripVertical, 
  Check, 
  X,
  Pencil,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PriceHistory } from '@/components/features/price-history';
import type { Item, Updatable, Database } from '@/lib/db/database.types';

interface EditableItemProps {
  item: Item;
  isOwner: boolean;
  onClaim?: () => void;
}

// Spring physics - per Thomistic beauty doc (smooth, no bounce)
const springConfig = {
  type: 'spring' as const,
  stiffness: 300,  // Thomistic spec value
  damping: 30,
  mass: 1,
};

// Delete Confirmation Modal with Focus Trap
interface DeleteConfirmModalProps {
  itemTitle: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ itemTitle, deleting, onCancel, onConfirm }: DeleteConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap: focus first button on mount
  useEffect(() => {
    cancelButtonRef.current?.focus();
    
    // Mark everything outside as inert
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('inert', '');
    }
    
    return () => {
      if (mainContent) {
        mainContent.removeAttribute('inert');
      }
    };
  }, []);

  // Handle keyboard navigation within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !deleting) {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Tab') {
      // Trap focus within modal
      const focusableElements = [cancelButtonRef.current, deleteButtonRef.current].filter(Boolean);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
        onClick={!deleting ? onCancel : undefined}
        aria-hidden="true"
      />
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-xl)] border border-[var(--color-border)] p-6 z-50"
        role="alertdialog"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-[var(--color-danger-bg)] rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" aria-hidden="true" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="font-semibold text-[var(--color-text)]">
              Delete item?
            </h3>
            <p id="delete-dialog-description" className="text-sm text-[var(--color-text-secondary)] mt-1">
              &ldquo;{itemTitle}&rdquo; will be permanently removed.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            ref={cancelButtonRef}
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            ref={deleteButtonRef}
            variant="danger" 
            size="sm" 
            onClick={onConfirm}
            loading={deleting}
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </>
  );
}

export function EditableItem({ item, isOwner, onClaim }: EditableItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState(item.title);
  const [editPrice, setEditPrice] = useState(item.current_price?.toString() || '');
  const [editUrl, setEditUrl] = useState(item.url || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [urlError, setUrlError] = useState<string | null>(null);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const menuItems = [
    { action: 'edit', icon: Pencil, label: 'Edit' },
    { action: 'delete', icon: Trash2, label: 'Delete', danger: true },
  ];

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setFocusedIndex(-1);
    menuButtonRef.current?.focus();
  }, []);

  // Keyboard navigation for menu
  useEffect(() => {
    if (!showMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % menuItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
          break;
        case 'Tab':
          closeMenu();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, menuItems.length, closeMenu]);

  // Focus management for menu items
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Focus first menu item when menu opens
  useEffect(() => {
    if (showMenu) {
      setFocusedIndex(0);
    }
  }, [showMenu]);

  const handleMenuButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowMenu(true);
    }
  };

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditTitle(item.title);
    setEditPrice(item.current_price?.toString() || '');
    setEditUrl(item.url || '');
    setEditNotes(item.notes || '');
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(item.title);
    setEditPrice(item.current_price?.toString() || '');
    setEditUrl(item.url || '');
    setEditNotes(item.notes || '');
    setUrlError(null);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    
    // Validate URL if provided
    const trimmedUrl = editUrl.trim();
    if (trimmedUrl) {
      const urlResult = urlSchema.safeParse(trimmedUrl);
      if (!urlResult.success) {
        setUrlError(urlResult.error.issues[0]?.message || 'Invalid URL');
        return;
      }
    }
    setUrlError(null);
    
    setSaving(true);
    const supabase = createClient();
    
    const newPrice = editPrice ? parseFloat(editPrice) : null;
    const priceChanged = newPrice !== item.current_price && newPrice !== null;
    
    const updateData: Updatable<'items'> = {
      title: editTitle.trim(),
      current_price: newPrice,
      url: trimmedUrl || null,
      notes: editNotes.trim() || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types require generated types; manual types need cast
    const { error } = await supabase
      .from('items')
      .update(updateData as never)
      .eq('id', item.id);

    // Record price snapshot if price changed
    if (!error && priceChanged && newPrice !== null) {
      const snapshotData = {
        item_id: item.id,
        price: newPrice,
        currency: item.currency,
      };
      await supabase.from('price_snapshots').insert(snapshotData as never);
    }

    setSaving(false);

    if (!error) {
      setIsEditing(false);
      toast.success('Item updated');
      router.refresh();
    } else {
      toast.error('Failed to save changes');
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

  // Handle keyboard shortcuts in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSaveEdit();
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

  // Edit mode UI
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0.8, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
      >
        <Card className="border-2 border-[var(--color-accent)] bg-[var(--color-accent-subtle)]" padding="sm">
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Item name"
              className="font-medium"
            />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price"
              />
              <div className="space-y-1">
                <Input
                  type="url"
                  value={editUrl}
                  onChange={(e) => {
                    setEditUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="URL (optional)"
                  className={urlError ? 'border-[var(--color-danger)]' : ''}
                  aria-invalid={!!urlError}
                  aria-describedby={urlError ? 'url-error' : undefined}
                />
                {urlError && (
                  <p id="url-error" className="text-xs text-[var(--color-danger)]">
                    {urlError}
                  </p>
                )}
              </div>
            </div>
            
            <Input
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Notes (size, color, etc.)"
            />
            
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--color-text-muted)]">
                ⌘+Enter to save, Esc to cancel
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // View mode UI
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
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
              <div className="flex-1 min-w-0">
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
                <div className="relative flex-shrink-0">
                  <button
                    ref={menuButtonRef}
                    onClick={() => setShowMenu(!showMenu)}
                    onKeyDown={handleMenuButtonKeyDown}
                    className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
                    aria-label="Item options"
                    aria-expanded={showMenu}
                    aria-haspopup="menu"
                  >
                    <MoreVertical className="h-5 w-5 text-[var(--color-text-muted)]" aria-hidden="true" />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={closeMenu} 
                        />
                        <motion.div 
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] rounded-lg shadow-[var(--shadow-xl)] border border-[var(--color-border-subtle)] py-1 z-20"
                          role="menu"
                        >
                          {menuItems.map((menuItem, index) => {
                            const Icon = menuItem.icon;
                            const isFocused = focusedIndex === index;
                            
                            return (
                              <button
                                key={menuItem.action}
                                ref={el => { menuItemsRef.current[index] = el; }}
                                onClick={() => {
                                  if (menuItem.action === 'edit') {
                                    handleStartEdit();
                                  } else if (menuItem.action === 'delete') {
                                    handleDeleteClick();
                                  }
                                }}
                                disabled={menuItem.action === 'delete' && deleting}
                                className={`flex items-center gap-2 px-4 py-2 w-full text-sm transition-colors outline-none ${
                                  menuItem.danger 
                                    ? `text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] ${isFocused ? 'bg-[var(--color-danger-bg)]' : ''}`
                                    : `text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] ${isFocused ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text)]' : ''}`
                                }`}
                                role="menuitem"
                                tabIndex={-1}
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {menuItem.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
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
              
              {/* Price history sparkline */}
              {item.current_price != null && item.url && (
                <PriceHistory 
                  itemId={item.id} 
                  currentPrice={item.current_price} 
                  currency={item.currency} 
                />
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
                onClick={(e) => e.stopPropagation()}
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
        <AnimatePresence>
          {showDeleteConfirm && (
            <DeleteConfirmModal
              itemTitle={item.title}
              deleting={deleting}
              onCancel={() => setShowDeleteConfirm(false)}
              onConfirm={handleDeleteConfirm}
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
