-- =====================================================
-- BLOG SYSTEM - BASIC SCHEMA (LEGACY)
-- =====================================================
-- Created: Earlier version of Lyrica template
-- Purpose: Basic blog functionality with posts table
-- Context: Simplified version, replaced by comprehensive schema
-- Status: Legacy file - kept for reference
-- Recommendation: Use lyrica-complete-database-schema.sql instead
-- Features: Basic posts table with author and publishing support
-- =====================================================

-- Create posts table for blog functionality
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ,
    inserted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS posts_inserted_at_idx ON public.posts(inserted_at DESC);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts table

-- 1. Allow anyone to read published posts
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;
CREATE POLICY "Anyone can read published posts" ON public.posts
    FOR SELECT USING (published_at IS NOT NULL);

-- 2. Allow authors to read their own posts (published or not)
DROP POLICY IF EXISTS "Authors can read own posts" ON public.posts;
CREATE POLICY "Authors can read own posts" ON public.posts
    FOR SELECT USING (auth.uid() = author_id);

-- 3. Allow authenticated users to create posts
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 4. Allow authors to update their own posts
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

-- 5. Allow authors to delete their own posts
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SETUP COMPLETE
-- ===========================================

-- Verify the table was created
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'posts' AND schemaname = 'public';
