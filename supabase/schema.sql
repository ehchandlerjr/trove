-- Giftwise Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================================
-- Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Custom Types
-- ============================================================================
CREATE TYPE list_visibility AS ENUM ('private', 'shared', 'public');
CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high', 'must_have');
CREATE TYPE claim_status AS ENUM ('claimed', 'purchased', 'gifted');

-- ============================================================================
-- Tables
-- ============================================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lists (wishlists)
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  visibility list_visibility DEFAULT 'private' NOT NULL,
  share_code TEXT UNIQUE,
  event_date DATE,
  event_theme TEXT DEFAULT 'none', -- Event theme overlay (birthday, christmas, wedding, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Items (wishlist items)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  current_price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD' NOT NULL,
  priority item_priority DEFAULT 'medium' NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  notes TEXT,
  position INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Claims (gift claims by friends/family)
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  status claim_status DEFAULT 'claimed' NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(item_id, claimer_id)
);

-- Site Mappings (crowdsourced HTML selectors)
CREATE TABLE site_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  path_pattern TEXT NOT NULL,
  selectors JSONB NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.5 NOT NULL,
  upvotes INTEGER DEFAULT 0 NOT NULL,
  downvotes INTEGER DEFAULT 0 NOT NULL,
  last_verified_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(domain, path_pattern)
);

-- Price Snapshots (historical price data)
CREATE TABLE price_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_lists_owner ON lists(owner_id);
CREATE INDEX idx_lists_share_code ON lists(share_code) WHERE share_code IS NOT NULL;
CREATE INDEX idx_items_list ON items(list_id);
CREATE INDEX idx_items_position ON items(list_id, position);
CREATE INDEX idx_claims_item ON claims(item_id);
CREATE INDEX idx_claims_claimer ON claims(claimer_id);
CREATE INDEX idx_site_mappings_domain ON site_mappings(domain);
CREATE INDEX idx_price_snapshots_item ON price_snapshots(item_id);
CREATE INDEX idx_price_snapshots_time ON price_snapshots(item_id, captured_at DESC);

-- ============================================================================
-- Functions
-- ============================================================================

-- Generate unique share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Triggers
-- ============================================================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_site_mappings_updated_at
  BEFORE UPDATE ON site_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Lists: Owners have full access, others can view shared/public
CREATE POLICY "Users can view own lists" ON lists
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shared lists by code" ON lists
  FOR SELECT USING (visibility IN ('shared', 'public'));

CREATE POLICY "Users can create own lists" ON lists
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own lists" ON lists
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own lists" ON lists
  FOR DELETE USING (auth.uid() = owner_id);

-- Items: Access follows parent list permissions
CREATE POLICY "Users can view items in own lists" ON items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.owner_id = auth.uid())
  );

CREATE POLICY "Users can view items in shared lists" ON items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.visibility IN ('shared', 'public'))
  );

CREATE POLICY "Users can create items in own lists" ON items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = list_id AND lists.owner_id = auth.uid())
  );

CREATE POLICY "Users can update items in own lists" ON items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete items in own lists" ON items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM lists WHERE lists.id = items.list_id AND lists.owner_id = auth.uid())
  );

-- Claims: Users can see claims on shared lists (except on their own lists to preserve surprise)
CREATE POLICY "Users can view own claims" ON claims
  FOR SELECT USING (claimer_id = auth.uid());

CREATE POLICY "Users can view claims on others' lists" ON claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      JOIN lists ON lists.id = items.list_id 
      WHERE items.id = claims.item_id 
      AND lists.visibility IN ('shared', 'public')
      AND lists.owner_id != auth.uid()
    )
  );

CREATE POLICY "Users can create claims on shared lists" ON claims
  FOR INSERT WITH CHECK (
    auth.uid() = claimer_id
    AND EXISTS (
      SELECT 1 FROM items 
      JOIN lists ON lists.id = items.list_id 
      WHERE items.id = item_id 
      AND lists.visibility IN ('shared', 'public')
      AND lists.owner_id != auth.uid()
    )
  );

CREATE POLICY "Users can update own claims" ON claims
  FOR UPDATE USING (claimer_id = auth.uid());

CREATE POLICY "Users can delete own claims" ON claims
  FOR DELETE USING (claimer_id = auth.uid());

-- Site Mappings: Everyone can read, authenticated users can create
CREATE POLICY "Site mappings are viewable by everyone" ON site_mappings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create site mappings" ON site_mappings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Price Snapshots: Follow item permissions
CREATE POLICY "Users can view price snapshots for accessible items" ON price_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      JOIN lists ON lists.id = items.list_id 
      WHERE items.id = price_snapshots.item_id 
      AND (lists.owner_id = auth.uid() OR lists.visibility IN ('shared', 'public'))
    )
  );
