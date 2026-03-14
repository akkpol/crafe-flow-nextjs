-- ============================================================================
-- Migration 04: Cleanup Test Data & Unused Tables
-- ============================================================================
-- Purpose: Remove blog-related test tables that are not part of CraftFlow
-- Priority: P2 - Cleanup (optional but recommended)
-- Run Order: #4 (safe to run after indexes)
-- 
-- IMPORTANT: This will permanently delete these tables!
-- Make sure you don't need any data from blog_* tables before running!
-- ============================================================================

-- ============================================================================
-- Drop Blog Tables (Test Data)
-- ============================================================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS public.blog_comments CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_users CASCADE;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify tables are dropped:
-- SELECT tablename 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE 'blog_%';

-- Should return 0 rows

-- ============================================================================
-- Optional: Clean up any orphaned data
-- ============================================================================

-- Clean up old audit log entries (older than 1 year)
-- Uncomment if you want to run this:
-- DELETE FROM audit_logs 
-- WHERE created_at < NOW() - INTERVAL '1 year';

-- Clean up old order history (older than 2 years)
-- Uncomment if you want to run this:
-- DELETE FROM "OrderHistory" 
-- WHERE "createdAt" < NOW() - INTERVAL '2 years';

-- ============================================================================
-- Vacuum to reclaim space
-- ============================================================================

-- Run vacuum to reclaim disk space after deletions
-- This is automatic in PostgreSQL, but you can force it:
-- VACUUM FULL ANALYZE;

-- Or just analyze to update statistics:
ANALYZE;
