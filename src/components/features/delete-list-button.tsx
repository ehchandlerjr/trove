'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { createClient } from '@/lib/db/client';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteListButtonProps {
  listId: string;
  listTitle: string;
}

export function DeleteListButton({ listId, listTitle }: DeleteListButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { containerRef } = useFocusTrap(showConfirm);

  // Handle Escape key to close dialog
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showConfirm && !deleting) {
      setShowConfirm(false);
    }
  }, [showConfirm, deleting]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDelete = async () => {
    if (confirmText !== listTitle) return;
    
    setDeleting(true);
    setError(null);
    
    const supabase = createClient();
    
    const { error: deleteError } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleClose = () => {
    if (!deleting) {
      setShowConfirm(false);
      setConfirmText('');
      setError(null);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowConfirm(true)}
        className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] min-h-[44px] min-w-[44px]"
        aria-label="Delete list"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={handleClose} 
          />
          
          {/* Dialog with focus trap */}
          <Card 
            ref={containerRef}
            className="relative z-10 w-full max-w-md" 
            padding="lg"
            role="alertdialog"
            aria-labelledby="delete-list-title"
            aria-describedby="delete-list-description"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--color-danger-bg)] rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
              </div>
              <div className="flex-1">
                <h2 id="delete-list-title" className="text-lg font-semibold text-[var(--color-text)]">
                  Delete this list?
                </h2>
                <p id="delete-list-description" className="text-[var(--color-text-secondary)] text-sm mt-1">
                  This action cannot be undone. All items in this list will be permanently deleted.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors"
                disabled={deleting}
                aria-label="Close dialog"
              >
                <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Type <span className="font-mono bg-[var(--color-bg-subtle)] px-1.5 py-0.5 rounded">{listTitle}</span> to confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type list name to confirm"
                disabled={deleting}
                autoFocus
                className="min-h-[44px]"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-danger)] mt-4" role="alert">{error}</p>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                variant="ghost"
                className="flex-1 min-h-[44px]"
                onClick={handleClose}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 min-h-[44px]"
                onClick={handleDelete}
                disabled={confirmText !== listTitle || deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete List
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
