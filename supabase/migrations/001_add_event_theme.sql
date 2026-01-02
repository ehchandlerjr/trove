-- Migration: Add event_theme to lists
-- Run this if you already have a database set up

-- Add event_theme column to lists table
ALTER TABLE lists 
ADD COLUMN IF NOT EXISTS event_theme TEXT DEFAULT 'none';

-- Optional: Add a comment for documentation
COMMENT ON COLUMN lists.event_theme IS 'Event theme overlay (none, birthday, christmas, wedding, easter, baby, halloween, hanukkah, graduation)';
