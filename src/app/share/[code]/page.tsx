import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/db/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Gift, Calendar, Check, ExternalLink } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { ClaimButton } from '@/components/features/claim-button';
import { ListEventThemeWrapper } from '@/components/features/list-event-theme-wrapper';
import type { List, Item, Claim, Profile } from '@/lib/db/database.types';
import type { EventThemeId } from '@/components/providers/event-theme-provider';

type ItemWithClaims = Item & { claims: Claim[] };

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('lists')
    .select('title, description, emoji')
    .eq('share_code', code)
    .single();

  const list = data as { title: string; description: string | null; emoji: string | null } | null;

  if (!list) {
    return {
      title: 'Wishlist Not Found | Trove',
    };
  }

  return {
    title: `${list.emoji || '🎁'} ${list.title} | Trove`,
    description: list.description || `Check out this wishlist on Trove`,
    openGraph: {
      title: list.title,
      description: list.description || 'A wishlist on Trove',
      type: 'website',
    },
  };
}

export default async function SharedListPage({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createClient();
  
  // Get list by share code
  const { data: listData, error } = await supabase
    .from('lists')
    .select('*')
    .eq('share_code', code)
    .single();

  const list = listData as List | null;

  if (error || !list) {
    notFound();
  }

  // Get owner profile
  const { data: ownerData } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', list.owner_id)
    .single();

  const owner = ownerData as Pick<Profile, 'display_name' | 'avatar_url'> | null;

  // Get items with claims
  const { data: itemsData } = await supabase
    .from('items')
    .select(`
      *,
      claims(*)
    `)
    .eq('list_id', list.id)
    .order('position', { ascending: true });

  const items = itemsData as ItemWithClaims[] | null;

  // Get current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === list.owner_id;

  // Get user's claims on this list
  let userClaims: string[] = [];
  if (user && !isOwner) {
    const { data: claimsData } = await supabase
      .from('claims')
      .select('item_id')
      .eq('claimer_id', user.id);
    const claims = claimsData as { item_id: string }[] | null;
    userClaims = claims?.map(c => c.item_id) || [];
  }

  const eventThemeId = (list.event_theme as EventThemeId) || 'none';

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-[var(--color-surface)]/80 backdrop-blur-sm border-b border-[var(--color-border)] relative z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-semibold text-[var(--color-text)] font-display">
              Trove
            </h1>
          </Link>
          {!user && (
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in to claim items</Button>
            </Link>
          )}
        </div>
      </header>

      <ListEventThemeWrapper eventThemeId={eventThemeId}>
        <main className="max-w-4xl mx-auto px-4 py-8">
        {/* List Header */}
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">{list.emoji || '🎁'}</span>
          <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-2 font-display">
            {list.title}
          </h1>
          {list.description && (
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">{list.description}</p>
          )}
          
          {/* Owner info */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Avatar 
              src={owner?.avatar_url} 
              name={owner?.display_name} 
              size="sm" 
            />
            <span className="text-[var(--color-text-secondary)]">
              {owner?.display_name || 'Someone'}&apos;s wishlist
            </span>
          </div>

          {list.event_date && (
            <Badge variant="outline" className="mt-4">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(list.event_date)}
            </Badge>
          )}
        </div>

        {/* Items */}
        {items && items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => {
              const claimsArray = Array.isArray(item.claims) ? item.claims : [];
              const totalClaimed = claimsArray.reduce((sum: number, c: { quantity: number }) => sum + c.quantity, 0);
              const isFullyClaimed = totalClaimed >= item.quantity;
              const userHasClaimed = userClaims.includes(item.id);

              return (
                <Card 
                  key={item.id} 
                  className={isFullyClaimed ? 'opacity-60' : ''}
                  padding="md"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    {item.image_url ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-bg-subtle)]">
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-[var(--color-bg-subtle)] flex items-center justify-center flex-shrink-0">
                        <Gift className="h-8 w-8 text-[var(--color-text-muted)]" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-[var(--color-text)]">
                            {item.title}
                          </h3>
                          {item.notes && (
                            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Claim status or button */}
                        {isFullyClaimed ? (
                          <Badge variant="success">
                            <Check className="h-3 w-3 mr-1" />
                            Claimed
                          </Badge>
                        ) : userHasClaimed ? (
                          <Badge variant="info">
                            You claimed this
                          </Badge>
                        ) : user && !isOwner ? (
                          <ClaimButton itemId={item.id} itemTitle={item.title} />
                        ) : null}
                      </div>

                      {/* Price */}
                      {item.current_price != null && (
                        <div className="mt-2">
                          <span className="font-semibold text-[var(--color-text)]">
                            {formatPrice(item.current_price, item.currency)}
                          </span>
                        </div>
                      )}

                      {/* Link */}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] mt-2"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View product
                        </a>
                      )}

                      {/* Quantity info */}
                      {item.quantity > 1 && (
                        <p className="text-sm text-[var(--color-text-muted)] mt-2">
                          {totalClaimed} of {item.quantity} claimed
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Gift className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 font-display">
              No items yet
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              This wishlist is empty. Check back later!
            </p>
          </Card>
        )}
      </main>
      </ListEventThemeWrapper>
    </div>
  );
}
