-- =====================================================
-- LYRICA COMPLETE DATABASE SCHEMA
-- =====================================================
-- Created: September 11, 2025
-- Purpose: Complete database setup for Lyrica Next.js template
-- Features: Authentication, Blog, Contact, Calendar, Bookings systems
-- Context: Production-ready schema with RLS security policies
-- Dependencies: Supabase PostgreSQL with auth.users table
-- Usage: Run this script in Supabase SQL Editor to set up entire database
-- Execution Order: Tables → RLS → Policies → Indexes → Triggers
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (User Extended Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. POSTS TABLE (Blog System)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ,
    inserted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 3. EVENTS TABLE (Calendar System)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MESSAGES TABLE (Contact System)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. CATEGORIES TABLE (Blog Categorization)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. POST_CATEGORIES TABLE (Many-to-Many Relationship)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_categories (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- =====================================================
-- 7. BOOKINGS TABLE (Reservation System)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_capacity CHECK (current_bookings <= max_capacity)
);

-- =====================================================
-- 8. USER_BOOKINGS TABLE (Booking Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
    booking_reference TEXT UNIQUE NOT NULL,
    special_requests TEXT,
    number_of_participants INTEGER DEFAULT 1,
    total_price DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. USER_SETTINGS TABLE (Dashboard Preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB DEFAULT '{}',
    dashboard_layout JSONB DEFAULT '[]',
    theme_preference TEXT DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Posts Policies
CREATE POLICY "Published posts are viewable by everyone" ON public.posts
    FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Users can view their own draft posts" ON public.posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = author_id);

-- Events Policies
CREATE POLICY "Users can view their own events" ON public.events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can create messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Post-Categories Policies
CREATE POLICY "Post-category associations are viewable by everyone" ON public.post_categories
    FOR SELECT USING (true);

CREATE POLICY "Post authors can manage category associations" ON public.post_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = post_categories.post_id
            AND posts.author_id = auth.uid()
        )
    );

-- Bookings Policies
CREATE POLICY "Active bookings are viewable by everyone" ON public.bookings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Booking creators can update their bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- User Bookings Policies
CREATE POLICY "Users can view their own bookings" ON public.user_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.user_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.user_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS posts_inserted_at_idx ON public.posts(inserted_at DESC);
CREATE INDEX IF NOT EXISTS events_user_id_idx ON public.events(user_id);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON public.events(event_date);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS messages_status_idx ON public.messages(status);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);
CREATE INDEX IF NOT EXISTS categories_name_idx ON public.categories(name);
CREATE INDEX IF NOT EXISTS post_categories_post_id_idx ON public.post_categories(post_id);
CREATE INDEX IF NOT EXISTS post_categories_category_id_idx ON public.post_categories(category_id);
CREATE INDEX IF NOT EXISTS bookings_activity_type_idx ON public.bookings(activity_type);
CREATE INDEX IF NOT EXISTS bookings_start_time_idx ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS bookings_end_time_idx ON public.bookings(end_time);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS user_bookings_user_id_idx ON public.user_bookings(user_id);
CREATE INDEX IF NOT EXISTS user_bookings_booking_id_idx ON public.user_bookings(booking_id);
CREATE INDEX IF NOT EXISTS user_bookings_booking_reference_idx ON public.user_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS user_bookings_status_idx ON public.user_bookings(status);
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON public.user_settings(user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_bookings_updated_at BEFORE UPDATE ON public.user_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC PROFILE CREATION
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment these to verify the setup:

-- SELECT 'Profiles table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles');
-- SELECT 'Posts table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts');
-- SELECT 'Events table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events');
-- SELECT 'Messages table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages');
-- SELECT 'Categories table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories');
-- SELECT 'Post_categories table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_categories');
-- SELECT 'Bookings table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings');
-- SELECT 'User_bookings table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_bookings');
-- SELECT 'User_settings table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings');

-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('profiles', 'posts', 'events', 'messages', 'categories', 'post_categories', 'bookings', 'user_bookings', 'user_settings') AND schemaname = 'public';
