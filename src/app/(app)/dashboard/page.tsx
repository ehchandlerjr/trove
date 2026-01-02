import Link from 'next/link';
import { createClient } from '@/lib/db/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyStateChest } from '@/components/ui/empty-state-chest';
import { Plus, Calendar, Lock, Globe, Users, Package } from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import type { List } from '@/lib/db/database.types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Trove',
  description: 'View and manage your wishlists',
};

type ListWithItems = List & { items: { count: number }[] | { count: number } };

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get user's lists with item counts
  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      items:items(count)
    `)
    .order('updated_at', { ascending: false });

  const lists = data as ListWithItems[] | null;

  if (error) {
    console.error('Error fetching lists:', error);
  }

  const visibilityIcons = {
    private: Lock,
    shared: Users,
    public: Globe,
  } as const;

  return (
    <div className="space-y-8">
      {/* Dev Mode Banner - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <Link href="/demo">
          <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white rounded-xl p-4 flex items-center justify-between hover:opacity-95 transition-opacity shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium">Try the Element Selector Prototype</p>
                <p className="text-sm text-white/80">The core innovation—teach Trove to understand any website</p>
              </div>
            </div>
            <span className="text-white/60">→</span>
          </div>
        </Link>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--color-text)] font-display tracking-tight">
            Your Wishlists
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Create and manage your gift lists
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/add-from-url" className="hidden sm:block">
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Add from URL
            </Button>
          </Link>
          <Link href="/lists/new">
            <Button>
              <Plus className="h-4 w-4" />
              New List
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile Add from URL - shown only on small screens */}
      <Link href="/add-from-url" className="block sm:hidden">
        <Card className="flex items-center gap-3 p-4 bg-[var(--color-bg-subtle)]">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
            <Plus className="h-5 w-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">Add from URL</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Paste a product link to add it</p>
          </div>
        </Card>
      </Link>

      {/* Lists Grid */}
      {lists && lists.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const VisibilityIcon = visibilityIcons[list.visibility];
            const itemCount = Array.isArray(list.items) 
              ? list.items[0]?.count || 0 
              : (list.items as { count: number })?.count || 0;
            
            return (
              <Link key={list.id} href={`/lists/${list.id}`}>
                <Card variant="interactive" className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{list.emoji || '🎁'}</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <VisibilityIcon className="h-3 w-3" />
                      {list.visibility}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-[var(--color-text)] mb-1 font-display">
                    {list.title}
                  </h3>
                  
                  {list.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                      {list.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    
                    {list.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(list.event_date)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-[var(--color-text-muted)] mt-4">
                    Updated {formatRelativeTime(list.updated_at)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16">
          <EmptyStateChest className="mx-auto mb-6" size="xl" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 font-display">
            No wishlists yet
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
            Create your first wishlist to start adding items and sharing with friends and family.
          </p>
          <Link href="/lists/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create your first list
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
