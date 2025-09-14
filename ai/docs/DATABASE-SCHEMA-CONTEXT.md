# Lyrica Database Schema Documentation

## Overview
This document outlines the database schema requirements for the Lyrica Next.js application. It serves as a comprehensive reference for creating the complete database setup script.

## Current Implementation Status
- ✅ **Authentication**: Supabase Auth with email/password
- ✅ **Blog System**: Posts with markdown content
- ✅ **User Management**: Profile system with RLS
- ✅ **Contact System**: Authenticated contact form with message storage
- ✅ **Calendar System**: Events management with user-specific events
- ✅ **Booking System**: Time slot reservations for activities
- ✅ **Theme System**: User preferences (not database-dependent)
- ✅ **Maps Integration**: External API (not database-dependent)

## Required Database Tables

### 1. Posts Table (BLOG SYSTEM)
```sql
-- Core blog functionality
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ, -- NULL = draft, NOT NULL = published
    inserted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Requirements:**
- Authors can create, read, update, delete their own posts
- Public can read published posts only
- Support for draft vs published states
- Automatic timestamp management
- Full-text search capability (future enhancement)

### 2. User Profiles Table (EXTENDED USER DATA)
```sql
-- Extended user profile information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements:**
- Automatic profile creation on user signup
- Public profile viewing
- User profile editing
- Avatar/image storage integration

### 3. Comments Table (BLOG INTERACTION)
```sql
-- Comments on blog posts
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id), -- For nested replies
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements:**
- Nested comment threads
- Comment moderation capabilities
- Author can edit/delete their comments
- Post author can moderate comments

### 4. Events Table (CALENDAR SYSTEM)
```sql
-- User calendar events
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements:**
- Users can create, read, update, delete their own events
- Events are private to the user who created them
- Support for event descriptions and dates
- Calendar view with date-based filtering

### 5. Messages Table (CONTACT SYSTEM)
```sql
-- Contact form messages from authenticated users
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements:**
- Users can create, read, update, delete their own events
- Events are private to the user who created them
- Support for event descriptions and dates
- Calendar view with date-based filtering

### 6. Categories/Tags System
```sql
-- Blog post categorization
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship between posts and categories
CREATE TABLE public.post_categories (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);
```

**Requirements:**
- SEO-friendly category slugs
- Multiple categories per post
- Category-based post filtering

### 7. User Settings Table (DASHBOARD PREFERENCES)
```sql
-- User-specific settings and preferences
CREATE TABLE public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB DEFAULT '{}', -- Flexible key-value storage for settings
    dashboard_layout JSONB DEFAULT '[]', -- Dashboard widget configuration
    theme_preference TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Bookings Table (RESERVATION SYSTEM)
```sql
-- Time slot bookings for activities (horse riding, classes, etc.)
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'horse_riding', 'yoga', 'consultation', etc.
    title TEXT NOT NULL, -- "Horse Riding Session", "Morning Yoga", etc.
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER DEFAULT 1, -- How many people can book this slot
    current_bookings INTEGER DEFAULT 0, -- Current number of bookings
    price DECIMAL(10,2), -- Optional pricing
    location TEXT, -- Physical location or virtual meeting link
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_capacity CHECK (current_bookings <= max_capacity)
);
```

**Requirements:**
- Time slot management with start/end times
- Activity categorization (horse riding, yoga, etc.)
- Capacity management (prevent overbooking)
- User booking tracking
- Status management (active, cancelled, completed)
- Optional pricing support
- Location information

### 9. User Bookings Table (BOOKING MANAGEMENT)
```sql
-- Individual user bookings for time slots
CREATE TABLE public.user_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
    booking_reference TEXT UNIQUE NOT NULL, -- Unique reference number
    special_requests TEXT, -- Any special requirements
    number_of_participants INTEGER DEFAULT 1,
    total_price DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Requirements:**
- Link users to specific booking slots
- Booking status tracking
- Unique reference numbers for management
- Support for multiple participants
- Payment tracking (optional)
- Special requests handling

### Authentication Requirements
- Supabase Auth integration
- JWT token validation
- Session management
- Password reset functionality

### RLS Policies Needed

#### Posts Table Policies:
1. **Public Read Published**: Anyone can read published posts
2. **Author Full Access**: Authors can CRUD their own posts
3. **Admin Moderation**: Admin users can moderate all posts

#### Comments Table Policies:
1. **Public Read**: Anyone can read comments on published posts
2. **Authenticated Create**: Logged-in users can create comments
3. **Author Edit/Delete**: Comment authors can edit/delete their comments
4. **Post Author Moderate**: Post authors can moderate comments on their posts

#### Profiles Table Policies:
1. **Public Read**: Anyone can view public profiles
2. **Owner Edit**: Users can edit their own profiles
3. **Private Fields**: Some fields may be private

#### Messages Table Policies:
1. **Authenticated Create**: Only authenticated users can create messages
2. **Owner Read**: Users can read their own messages
3. **Admin Full Access**: Admin users can read/update all messages
4. **No Public Access**: Public cannot read any messages

#### Events Table Policies:
1. **Owner Full Access**: Users can CRUD their own events
2. **No Public Access**: Events are private to the owner
3. **No Cross-User Access**: Users cannot access other users' events

#### Categories Table Policies:
1. **Public Read**: Anyone can read categories for filtering posts
2. **Admin Create/Update**: Only admins can create/update categories
3. **Authenticated Create Post-Categories**: Authenticated users can associate posts with categories

#### Post-Categories Table Policies:
1. **Public Read**: Anyone can read post-category associations
2. **Post Owner Manage**: Post authors can manage category associations for their posts
3. **Admin Full Access**: Admins can manage all associations

#### User Settings Table Policies:
1. **Owner Full Access**: Users can CRUD their own settings
2. **Private Access**: Settings are completely private to the owner
3. **No Cross-User Access**: Users cannot access other users' settings

#### Bookings Table Policies:
1. **Public Read Active**: Anyone can view active booking slots
2. **Admin Create/Update**: Only admins can create/manage booking slots
3. **No Public Create**: Regular users cannot create booking slots
4. **Capacity Checks**: System prevents overbooking

#### User Bookings Table Policies:
1. **Owner Full Access**: Users can manage their own bookings
2. **Admin Read All**: Admins can view all bookings for management
3. **Booking Owner Only**: Users can only access their own bookings
4. **Reference-Based Access**: Support for booking reference lookups

## Database Configuration

### Indexes Required
```sql
-- Performance optimization
CREATE INDEX posts_author_id_idx ON public.posts(author_id);
CREATE INDEX posts_published_at_idx ON public.posts(published_at DESC NULLS LAST);
CREATE INDEX posts_inserted_at_idx ON public.posts(inserted_at DESC);
CREATE INDEX comments_post_id_idx ON public.comments(post_id);
CREATE INDEX comments_author_id_idx ON public.comments(author_id);
CREATE INDEX comments_parent_id_idx ON public.comments(parent_id);
CREATE INDEX messages_user_id_idx ON public.messages(user_id);
CREATE INDEX messages_status_idx ON public.messages(status);
CREATE INDEX messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX events_user_id_idx ON public.events(user_id);
CREATE INDEX events_event_date_idx ON public.events(event_date);
CREATE INDEX events_created_at_idx ON public.events(created_at DESC);
CREATE INDEX categories_slug_idx ON public.categories(slug);
CREATE INDEX categories_name_idx ON public.categories(name);
CREATE INDEX post_categories_post_id_idx ON public.post_categories(post_id);
CREATE INDEX post_categories_category_id_idx ON public.post_categories(category_id);
CREATE INDEX user_settings_user_id_idx ON public.user_settings(user_id);
CREATE INDEX bookings_activity_type_idx ON public.bookings(activity_type);
CREATE INDEX bookings_start_time_idx ON public.bookings(start_time);
CREATE INDEX bookings_end_time_idx ON public.bookings(end_time);
CREATE INDEX bookings_status_idx ON public.bookings(status);
CREATE INDEX user_bookings_user_id_idx ON public.user_bookings(user_id);
CREATE INDEX user_bookings_booking_id_idx ON public.user_bookings(booking_id);
CREATE INDEX user_bookings_booking_reference_idx ON public.user_bookings(booking_reference);
CREATE INDEX user_bookings_status_idx ON public.user_bookings(status);
```

### Triggers Required
```sql
-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_bookings_updated_at BEFORE UPDATE ON public.user_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Extensions Needed
- `uuid-ossp` for UUID generation
- `pg_trgm` for text search (future)
- `pg_cron` for scheduled tasks (future)

## Future Enhancements (Plan for Later)

### Analytics & Tracking
```sql
-- Post view tracking
CREATE TABLE public.post_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id), -- NULL for anonymous
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- User engagement metrics
CREATE TABLE public.user_engagement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'view', 'like', 'share', 'comment'
    target_type TEXT NOT NULL, -- 'post', 'comment', 'profile'
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Content Management
```sql
-- Draft versions for posts
CREATE TABLE public.post_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media attachments
CREATE TABLE public.media_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migration Strategy

### Phase 1 (Current): Core Features
- ✅ Posts table with basic CRUD
- ✅ User authentication and profiles
- ✅ Messages table for contact system
- ✅ Events table for calendar functionality
- ✅ **NEW:** Bookings system for activity reservations
- ✅ Basic RLS policies
- ✅ Categories and tagging system

### Phase 2 (Next): Enhanced Features
- Comments system
- User settings and preferences
- Advanced analytics and tracking
- Media attachments
- Post drafts and versioning
- **NEW:** Payment integration for bookings
- **NEW:** Email notifications for bookings

### Phase 3 (Future): Advanced Features
- Full-text search
- Advanced user engagement metrics
- Content moderation tools
- **NEW:** Recurring booking patterns
- **NEW:** Waitlist management for full bookings

## Environment Variables Required
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Connection (for direct access if needed)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

## Testing Requirements
- Unit tests for database functions
- Integration tests for API endpoints
- Performance tests for queries
- Security tests for RLS policies

## Backup & Recovery
- Automated daily backups
- Point-in-time recovery capability
- Data export/import functionality
- Schema versioning

---

## AI Agent Instructions for SQL Script Creation

When creating the comprehensive SQL script, ensure:

1. **Order of Operations**: Create tables first, then indexes, then policies, then triggers
2. **Error Handling**: Use `IF NOT EXISTS` and `DROP IF EXISTS` for idempotent operations
3. **Security First**: Implement RLS policies before inserting any data
4. **Performance**: Include all necessary indexes for query optimization
5. **Documentation**: Add comments explaining each section
6. **Verification**: Include queries to verify successful setup
7. **Rollback**: Consider rollback scripts for each major change

**Priority Order for Implementation:**
1. Core authentication tables (handled by Supabase)
2. ✅ Posts table (Phase 1 - implemented)
3. ✅ Profiles table (Phase 1 - implemented)
4. ✅ Messages table (Phase 1 - implemented)
5. ✅ Events table (Phase 1 - implemented)
6. ✅ Categories system (Phase 1 - implemented)
7. ✅ **NEW:** Bookings system (Phase 1 - implemented)
8. Comments table (Phase 2)
9. User settings table (Phase 2)
10. Analytics tables (Phase 3)

---

*Last Updated: September 11, 2025*
*Document Version: 1.0*
