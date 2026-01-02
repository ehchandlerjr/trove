'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/db/client';
import { createItemSchema } from '@/lib/core/schemas';
import { validateForm, type FieldErrors } from '@/lib/utils/validation';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Insertable, Database } from '@/lib/db/database.types';

interface AddItemFormProps {
  listId: string;
}

export function AddItemForm({ listId }: AddItemFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Keyboard shortcut: 'n' to focus new item input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
      
      if (isInputFocused) return;

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Validate with Zod schema
    const validation = validateForm(createItemSchema, {
      listId,
      title: title.trim(),
      url: url.trim() || undefined,
      currentPrice: price ? parseFloat(price) : undefined,
      notes: notes.trim() || undefined,
    });
    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      // Show first error as banner if it's not a field-specific error
      const firstError = Object.values(validation.errors || {})[0];
      if (firstError) setError(firstError);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      const insertData: Insertable<'items'> = {
        list_id: listId,
        title: validation.data!.title,
        url: validation.data!.url || null,
        current_price: validation.data!.currentPrice || null,
        notes: validation.data!.notes || null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types require generated types; manual types need cast
      const { error: insertError } = await supabase
        .from('items')
        .insert(insertData as never);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Reset form
      setTitle('');
      setUrl('');
      setPrice('');
      setNotes('');
      setIsExpanded(false);
      
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Input
          ref={inputRef}
          placeholder="Add an item... (press 'n')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
          aria-label="Item name"
        />
        <Button type="submit" loading={loading} disabled={!title.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors min-h-11 px-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-subtle)]"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Add link & price
          </>
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Link (optional)"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={fieldErrors.url}
            />
            <Input
              label="Price (optional)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={fieldErrors.currentPrice}
            />
          </div>
          <Textarea
            label="Notes (optional)"
            placeholder="Size, color, specific model..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      )}
    </form>
  );
}
