import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import { z } from 'zod';

// Validation schema for selectors
const selectorsSchema = z.object({
  title: z.string().optional(),
  price: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  availability: z.string().optional(),
  originalPrice: z.string().optional(),
  brand: z.string().optional(),
});

// Domain validation - must be a valid hostname without protocol
const domainSchema = z.string()
  .min(1)
  .max(255)
  .refine((val) => {
    // Reject if it starts with a protocol
    if (/^https?:\/\//i.test(val)) {
      return false;
    }
    // Basic hostname validation: alphanumeric, hyphens, dots
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(val);
  }, {
    message: 'Invalid domain format. Provide hostname only (e.g., "amazon.com"), not full URL.',
  });

// Validation schema for creating a mapping
const createMappingSchema = z.object({
  domain: domainSchema,
  pathPattern: z.string().max(500).default('*'),
  selectors: selectorsSchema,
});

// Validation schema for voting
const voteSchema = z.object({
  mappingId: z.string().uuid(),
  vote: z.enum(['up', 'down']),
});

/**
 * GET /api/site-mappings
 * 
 * Returns site mapping for a domain.
 * Used by extension to apply learned selectors.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter required' },
        { status: 400 }
      );
    }
    
    // Normalize domain (remove www.)
    const normalizedDomain = domain.replace(/^www\./, '');
    
    // Get all mappings for this domain, ordered by confidence
    const { data: mappings, error } = await supabase
      .from('site_mappings')
      .select('*')
      .or(`domain.eq.${normalizedDomain},domain.eq.www.${normalizedDomain}`)
      .order('confidence', { ascending: false });
    
    if (error) {
      console.error('Error fetching mappings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mappings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ mappings: mappings || [] });
  } catch (error) {
    console.error('Site mappings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/site-mappings
 * 
 * Creates a new site mapping.
 * Used when users teach the system about a new site.
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
    const validation = createMappingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const data = validation.data;
    
    // Normalize domain
    const normalizedDomain = data.domain.replace(/^www\./, '');
    
    // Check if mapping already exists
    const { data: existing } = await supabase
      .from('site_mappings')
      .select('id')
      .eq('domain', normalizedDomain)
      .eq('path_pattern', data.pathPattern)
      .single();
    
    if (existing) {
      // Type assertion for existing
      const typedExisting = existing as { id: string };
      
      // Update existing mapping - merge selectors, bump confidence
      const updateData = {
        selectors: data.selectors,
        upvotes: 1, // Reset since selectors changed
        downvotes: 0,
        confidence: 0.5,
        last_verified_at: new Date().toISOString(),
      };
      
      const { data: updated, error: updateError } = await supabase
        .from('site_mappings')
        .update(updateData as never)
        .eq('id', typedExisting.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating mapping:', updateError);
        return NextResponse.json(
          { error: 'Failed to update mapping' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ mapping: updated, updated: true });
    }
    
    // Create new mapping
    const insertData = {
      domain: normalizedDomain,
      path_pattern: data.pathPattern,
      selectors: data.selectors,
      created_by: user.id,
      confidence: 0.5,
      upvotes: 1,
      downvotes: 0,
      last_verified_at: new Date().toISOString(),
    };
    
    const { data: mapping, error: createError } = await supabase
      .from('site_mappings')
      .insert(insertData as never)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating mapping:', createError);
      return NextResponse.json(
        { error: 'Failed to create mapping' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ mapping }, { status: 201 });
  } catch (error) {
    console.error('Site mappings POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/site-mappings
 * 
 * Vote on a mapping (up or down).
 * Used to crowdsource accuracy.
 */
export async function PATCH(request: NextRequest) {
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
    const validation = voteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { mappingId, vote } = validation.data;
    
    // Get current mapping
    const { data: mapping, error: fetchError } = await supabase
      .from('site_mappings')
      .select('*')
      .eq('id', mappingId)
      .single();
    
    if (fetchError || !mapping) {
      return NextResponse.json(
        { error: 'Mapping not found' },
        { status: 404 }
      );
    }
    
    // Type assertion after null check
    const typedMapping = mapping as { upvotes: number; downvotes: number };
    
    // Update vote counts
    const upvotes = vote === 'up' ? typedMapping.upvotes + 1 : typedMapping.upvotes;
    const downvotes = vote === 'down' ? typedMapping.downvotes + 1 : typedMapping.downvotes;
    
    // Calculate new confidence score
    // Wilson score interval (lower bound) for ranking
    const total = upvotes + downvotes;
    const p = upvotes / total;
    const z = 1.96; // 95% confidence
    const confidence = (p + z * z / (2 * total) - z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total)) / (1 + z * z / total);
    
    // Update mapping
    const updateData = {
      upvotes,
      downvotes,
      confidence: Math.max(0, Math.min(1, confidence)),
      last_verified_at: new Date().toISOString(),
    };
    
    const { data: updated, error: updateError } = await supabase
      .from('site_mappings')
      .update(updateData as never)
      .eq('id', mappingId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating mapping:', updateError);
      return NextResponse.json(
        { error: 'Failed to update mapping' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ mapping: updated });
  } catch (error) {
    console.error('Site mappings PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
