/**
 * Database types for Supabase
 * 
 * In production, these would be auto-generated using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db/database.types.ts
 * 
 * For now, we define them manually to match our schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          emoji: string | null;
          visibility: 'private' | 'shared' | 'public';
          share_code: string | null;
          event_date: string | null;
          event_theme: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          emoji?: string | null;
          visibility?: 'private' | 'shared' | 'public';
          share_code?: string | null;
          event_date?: string | null;
          event_theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          emoji?: string | null;
          visibility?: 'private' | 'shared' | 'public';
          share_code?: string | null;
          event_date?: string | null;
          event_theme?: string | null;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          list_id: string;
          title: string;
          description: string | null;
          url: string | null;
          image_url: string | null;
          current_price: number | null;
          original_price: number | null;
          currency: string;
          priority: 'low' | 'medium' | 'high' | 'must_have';
          quantity: number;
          notes: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          title: string;
          description?: string | null;
          url?: string | null;
          image_url?: string | null;
          current_price?: number | null;
          original_price?: number | null;
          currency?: string;
          priority?: 'low' | 'medium' | 'high' | 'must_have';
          quantity?: number;
          notes?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          title?: string;
          description?: string | null;
          url?: string | null;
          image_url?: string | null;
          current_price?: number | null;
          original_price?: number | null;
          currency?: string;
          priority?: 'low' | 'medium' | 'high' | 'must_have';
          quantity?: number;
          notes?: string | null;
          position?: number;
          updated_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          item_id: string;
          claimer_id: string;
          quantity: number;
          status: 'claimed' | 'purchased' | 'gifted';
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          claimer_id: string;
          quantity?: number;
          status?: 'claimed' | 'purchased' | 'gifted';
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          claimer_id?: string;
          quantity?: number;
          status?: 'claimed' | 'purchased' | 'gifted';
          is_anonymous?: boolean;
          updated_at?: string;
        };
      };
      site_mappings: {
        Row: {
          id: string;
          domain: string;
          path_pattern: string;
          selectors: Json;
          confidence: number;
          upvotes: number;
          downvotes: number;
          last_verified_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          domain: string;
          path_pattern: string;
          selectors: Json;
          confidence?: number;
          upvotes?: number;
          downvotes?: number;
          last_verified_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          domain?: string;
          path_pattern?: string;
          selectors?: Json;
          confidence?: number;
          upvotes?: number;
          downvotes?: number;
          last_verified_at?: string | null;
          updated_at?: string;
        };
      };
      price_snapshots: {
        Row: {
          id: string;
          item_id: string;
          price: number;
          currency: string;
          captured_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          price: number;
          currency?: string;
          captured_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          price?: number;
          currency?: string;
          captured_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_share_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      list_visibility: 'private' | 'shared' | 'public';
      item_priority: 'low' | 'medium' | 'high' | 'must_have';
      claim_status: 'claimed' | 'purchased' | 'gifted';
    };
  };
}

// Helper types for working with database rows
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type Profile = Tables<'profiles'>;
export type List = Tables<'lists'>;
export type Item = Tables<'items'>;
export type Claim = Tables<'claims'>;
export type SiteMapping = Tables<'site_mappings'>;
export type PriceSnapshot = Tables<'price_snapshots'>;
