import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import { z } from 'zod';

// Validation schema for creating an item
const createItemSchema = z.object({
  listId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  url: z.string().url().max(2000).optional(),
  imageUrl: z.string().url().max(2000).optional(),
  currentPrice: z.number().nonnegative().optional(),
  originalPrice: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  priority: z.enum(['low', 'medium', 'high', 'must_have']).default('medium'),
  quantity: z.number().int().positive().default(1),
  notes: z.string().max(2000).optional(),
});

/**
 * POST /api/items
 * 
 * Creates a new item in a list.
 * Used by the Chrome extension and add-from-url page.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = createItemSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Verify user owns the list
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('id, owner_id')
      .eq('id', data.listId)
      .single();
    
    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }
    
    // Type assertion for list data
    const typedList = list as { id: string; owner_id: string };
    
    if (typedList.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to add items to this list' },
        { status: 403 }
      );
    }
    
    // Get the highest position in the list
    const { data: lastItem } = await supabase
      .from('items')
      .select('position')
      .eq('list_id', data.listId)
      .order('position', { ascending: false })
      .limit(1)
      .single();
    
    // Type assertion for lastItem
    const typedLastItem = lastItem as { position: number } | null;
    const position = (typedLastItem?.position ?? -1) + 1;
    
    // Create the item - use type assertion for Supabase SSR compatibility
    const insertData = {
      list_id: data.listId,
      title: data.title,
      description: data.description,
      url: data.url,
      image_url: data.imageUrl,
      current_price: data.currentPrice,
      original_price: data.originalPrice,
      currency: data.currency,
      priority: data.priority,
      quantity: data.quantity,
      notes: data.notes,
      position,
    };
    
    const { data: item, error: createError } = await supabase
      .from('items')
      .insert(insertData as never)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating item:', createError);
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }
    
    // Type assertion for item
    const typedItem = item as { id: string };
    
    // If we have a price, create a price snapshot
    if (data.currentPrice) {
      const snapshotData = {
        item_id: typedItem.id,
        price: data.currentPrice,
        currency: data.currency,
      };
      await supabase.from('price_snapshots').insert(snapshotData as never);
    }
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Items API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
