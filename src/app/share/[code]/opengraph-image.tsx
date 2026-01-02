import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/db/server';

export const runtime = 'edge';

export const alt = 'Trove List';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { code: string } }) {
  // Fetch list data for personalized OG image
  let listTitle = 'A Wishlist';
  let listEmoji = '🎁';
  let itemCount = 0;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('lists')
      .select(`
        title,
        emoji,
        items:items(count)
      `)
      .eq('share_code', params.code)
      .single();

    const list = data as { 
      title: string; 
      emoji: string | null; 
      items: { count: number }[] | { count: number } 
    } | null;

    if (list) {
      listTitle = list.title;
      listEmoji = list.emoji || '🎁';
      const items = list.items;
      itemCount = Array.isArray(items) ? items[0]?.count || 0 : items?.count || 0;
    }
  } catch {
    // Fall back to defaults if fetch fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF8F5', // --color-bg
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Card container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 80px',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E8E4DD', // --color-border
            boxShadow: '0 20px 60px rgba(26, 22, 18, 0.1)',
          }}
        >
          {/* Emoji */}
          <div
            style={{
              fontSize: '80px',
              marginBottom: '24px',
            }}
          >
            {listEmoji}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '48px',
              color: '#1A1612', // --color-text
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            {listTitle}
          </div>

          {/* Item count */}
          <div
            style={{
              fontSize: '24px',
              color: '#6B6560', // --color-text-secondary
            }}
          >
            {itemCount} {itemCount === 1 ? 'wish' : 'wishes'}
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              color: '#C7923E', // --color-accent
              fontWeight: 600,
            }}
          >
            Trove
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#8B8680', // --color-text-tertiary
            }}
          >
            — Wishlists that work
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
