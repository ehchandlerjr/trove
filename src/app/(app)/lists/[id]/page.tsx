import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/db/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyStateChest } from '@/components/ui/empty-state-chest';
import { ArrowLeft, Settings } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AddItemForm } from '@/components/features/add-item-form';
import { EditableItem } from '@/components/features/editable-item';
import { ShareDialog } from '@/components/features/share-dialog';
import { DeleteListButton } from '@/components/features/delete-list-button';
import { ListEventThemeWrapper } from '@/components/features/list-event-theme-wrapper';
import type { List, Item } from '@/lib/db/database.types';
import type { EventThemeId } from '@/components/providers/event-theme-provider';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('lists')
    .select('title, emoji')
    .eq('id', id)
    .single();

  const list = data as { title: string; emoji: string | null } | null;

  if (!list) {
    return { title: 'List Not Found | Trove' };
  }

  return {
    title: `${list.emoji || '🎁'} ${list.title} | Trove`,
  };
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get list with items
  const { data: listData, error } = await supabase
    .from('lists')
    .select('*')
    .eq('id', id)
    .single();

  const list = listData as List | null;

  if (error || !list) {
    notFound();
  }

  // Get items separately
  const { data: itemsData } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', id)
    .order('position', { ascending: true });

  const items = itemsData as Item[] | null;
  const totalValue = items?.reduce((sum, item) => sum + (item.current_price || 0), 0) || 0;
  const eventThemeId = (list.event_theme as EventThemeId) || 'none';

  return (
    <ListEventThemeWrapper eventThemeId={eventThemeId}>
      <div className="space-y-6">
      {/* Back link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to lists
      </Link>

      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{list.emoji || '🎁'}</span>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text)] font-display tracking-tight">
              {list.title}
            </h1>
            {list.description && (
              <p className="text-[var(--color-text-secondary)] mt-1">{list.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline">{list.visibility}</Badge>
              {items && items.length > 0 && (
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                  {totalValue > 0 && ` · ${formatPrice(totalValue)}`}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {list.visibility !== 'private' && list.share_code && (
            <ShareDialog shareCode={list.share_code} listTitle={list.title} />
          )}
          <DeleteListButton listId={id} listTitle={list.title} />
        </div>
      </div>

      {/* Add Item Form */}
      <Card>
        <AddItemForm listId={id} />
      </Card>

      {/* Items List */}
      {items && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <EditableItem key={item.id} item={item} isOwner={true} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <EmptyStateChest className="mx-auto mb-6" size="lg" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 font-display">
            No items yet
          </h3>
          <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto">
            Add your first item using the form above, or paste a link to automatically import product details.
          </p>
        </Card>
      )}
    </div>
    </ListEventThemeWrapper>
  );
}
