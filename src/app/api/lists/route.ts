import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';

/**
 * GET /api/lists
 * 
 * Returns all lists for the authenticated user.
 * Used by the Chrome extension to populate the list selector.
 */
export async function GET(request: NextRequest) {
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
    
    // Get user's lists
    const { data: lists, error } = await supabase
      .from('lists')
      .select('id, title, emoji, visibility, created_at')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching lists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lists' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Lists API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
