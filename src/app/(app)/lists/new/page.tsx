'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/db/client';
import { createListSchema } from '@/lib/core/schemas';
import { validateForm, type FieldErrors } from '@/lib/utils/validation';
import { ArrowLeft, Lock, Link2, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { eventThemes, type EventThemeId } from '@/components/providers/event-theme-provider';
import type { Insertable, Database } from '@/lib/db/database.types';

const EMOJI_OPTIONS = ['🎁', '🎂', '🎄', '💝', '🎉', '👶', '💍', '🏠', '✈️', '📚'];

export default function NewListPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [eventDate, setEventDate] = useState('');
  const [eventTheme, setEventTheme] = useState<EventThemeId>('none');
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Validate with Zod schema
    const validation = validateForm(createListSchema, {
      title,
      description: description || undefined,
      emoji,
      visibility,
      eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
    });
    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('You must be logged in to create a list');
        return;
      }

      const insertData: Insertable<'lists'> = {
        owner_id: user.id,
        title: validation.data!.title,
        description: validation.data!.description || null,
        emoji: validation.data!.emoji,
        visibility: validation.data!.visibility,
        event_date: eventDate || null,
        event_theme: eventTheme,
        share_code: visibility !== 'private' ? generateShareCode() : null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types require generated types; manual types need cast
      const { data, error: createError } = await supabase
        .from('lists')
        .insert(insertData as never)
        .select()
        .single();

      if (createError) {
        setError(createError.message);
        return;
      }

      const listData = data as { id: string } | null;
      if (listData) {
        router.push(`/lists/${listData.id}`);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to lists
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-display tracking-tight">
            Create a new wishlist
          </CardTitle>
          <CardDescription>
            Set up your list and start adding items
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Emoji Picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Choose an icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-12 h-12 text-2xl rounded-xl transition-all ${
                      emoji === e 
                        ? 'bg-[var(--color-accent-subtle)] ring-2 ring-[var(--color-accent)]' 
                        : 'bg-[var(--color-bg-subtle)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            
            <Input
              label="List name"
              name="title"
              placeholder="e.g., Birthday Wishlist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              error={fieldErrors.title}
            />
            
            <Textarea
              label="Description (optional)"
              name="description"
              placeholder="What's this list for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <Input
              label="Event date (optional)"
              type="date"
              name="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />

            {/* Event Theme */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Event theme (optional)
                </span>
              </label>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Add festive decorations to your list
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Object.values(eventThemes).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setEventTheme(theme.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      eventTheme === theme.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
                    }`}
                  >
                    <span className="text-xl block mb-1">{theme.icon}</span>
                    <span className={`text-xs font-medium ${
                      eventTheme === theme.id 
                        ? 'text-[var(--color-accent)]' 
                        : 'text-[var(--color-text-secondary)]'
                    }`}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Who can see this list?
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: 'private', label: 'Private', desc: 'Only you', icon: Lock },
                  { value: 'shared', label: 'Shared', desc: 'Anyone with link', icon: Link2 },
                  { value: 'public', label: 'Public', desc: 'Everyone', icon: Globe },
                ].map((opt) => {
                  const Icon = opt.icon;
                  return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisibility(opt.value as typeof visibility)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      visibility === opt.value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${
                        visibility === opt.value 
                          ? 'text-[var(--color-accent)]' 
                          : 'text-[var(--color-text-muted)]'
                      }`} />
                      <p className="font-medium text-[var(--color-text)]">{opt.label}</p>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{opt.desc}</p>
                  </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" loading={loading}>
                Create list
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function generateShareCode(length = 8): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
