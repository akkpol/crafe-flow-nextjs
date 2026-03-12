-- Fix 006: Add organization_id to profiles table
-- Purpose: Fix REV-002 & REV-005 - Add missing organization_id column

-- Step 1: Add organization_id column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS organization_id TEXT REFERENCES "Organization"(id);

-- Step 2: Backfill existing users with default organization
-- This assumes there's at least one organization to use as default
UPDATE profiles 
SET organization_id = (
  SELECT id FROM "Organization" LIMIT 1
) 
WHERE organization_id IS NULL;

-- Step 3: Make column NOT NULL after backfill
ALTER TABLE profiles 
ALTER COLUMN organization_id SET NOT NULL;

SELECT 'Fix 006: Added organization_id to profiles table' as status;
