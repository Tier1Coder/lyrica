# Lyrica Database SQL Files

This directory contains SQL scripts for setting up the Lyrica Next.js template database. All files are designed to work with Supabase PostgreSQL.

## 📁 SQL Files Overview

### 1. `lyrica-complete-database-schema.sql`
**Purpose**: Complete database setup for the entire Lyrica template
**Features**: Authentication, Blog, Contact, Calendar, Bookings systems
**When to Use**: Setting up a new Lyrica project from scratch
**Execution Order**: Run this FIRST
**Status**: ✅ Production Ready

### 2. `contact-system-messages-table.sql`
**Purpose**: Creates the messages table for the authenticated contact form
**Features**: Contact form submissions with user tracking
**When to Use**: Adding contact functionality to existing projects
**Dependencies**: Requires Supabase auth.users table
**Status**: ✅ Production Ready

### 3. `booking-system-sample-data.sql`
**Purpose**: Sample booking slots for testing the reservation system
**Features**: Pre-populated booking slots (horse riding, yoga, cooking)
**When to Use**: After running the complete schema, to test booking functionality
**Dependencies**: Requires bookings table from complete schema
**Note**: Replace admin user IDs with actual user IDs
**Status**: ✅ Ready for Testing

### 4. `blog-system-basic-schema.sql`
**Purpose**: Basic blog functionality (legacy file)
**Features**: Simple posts table with author and publishing support
**When to Use**: Reference only - use complete schema instead
**Status**: ⚠️ Legacy - kept for reference

### 5. `admin-role-system.sql`
**Purpose**: Admin role system with user management
**Features**: Role-based access control (user, moderator, admin)
**When to Use**: Adding admin functionality to existing projects
**Dependencies**: Requires profiles table from complete schema
**Status**: ✅ Production Ready

## 🚀 Quick Start

1. **New Project Setup**:
   ```bash
   # Run in Supabase SQL Editor
   # 1. Complete database schema
   # 2. Sample booking data (optional)
   ```

2. **Adding Features to Existing Project**:
   ```bash
   # Run specific feature scripts as needed
   # Contact: contact-system-messages-table.sql
   # Bookings: Add to complete schema
   ```

## 📋 Database Features Included

### Core Systems
- ✅ **Authentication**: Supabase Auth integration
- ✅ **Blog System**: Posts with markdown content
- ✅ **Contact System**: Authenticated contact forms
- ✅ **Calendar System**: Personal events management
- ✅ **Booking System**: Time slot reservations

### Security & Performance
- ✅ **Row Level Security (RLS)**: Complete policies for all tables
- ✅ **Performance Indexes**: Optimized for common queries
- ✅ **Automatic Timestamps**: Created/updated tracking
- ✅ **Data Validation**: Constraints and checks

### Sample Data
- ✅ **Booking Slots**: Horse riding, yoga, cooking classes
- ✅ **Time Slots**: Various dates and times
- ✅ **Pricing**: Optional cost structures
- ✅ **Locations**: Venue information

## 🔧 Configuration Notes

### Admin User Setup
For booking system sample data, replace:
```sql
(SELECT id FROM auth.users LIMIT 1)
```
With actual admin user IDs from your Supabase auth.users table.

### Environment Variables
Required for full functionality:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Verification Queries

After running scripts, verify setup:

```sql
-- Check all tables created
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'posts', 'events', 'messages', 'bookings', 'user_bookings')
AND schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Check sample bookings
SELECT activity_type, title, start_time, max_capacity
FROM public.bookings
ORDER BY start_time;
```

## 🏗️ Architecture

### Table Relationships
```
auth.users (Supabase)
├── profiles (extended user data)
├── posts (blog articles)
├── events (calendar events)
├── messages (contact form)
├── bookings (admin-created slots)
└── user_bookings (user reservations)
```

### Security Model
- **RLS Enabled**: All tables protected
- **Owner Access**: Users access their own data
- **Public Read**: Published content accessible
- **Admin Control**: Administrative functions protected

## 📝 Development Notes

- **Created**: September 11, 2025
- **Template**: Lyrica Next.js with modular features
- **Database**: Supabase PostgreSQL
- **Security**: Row Level Security throughout
- **Scalability**: Indexed for performance

## 🔄 Migration Path

If upgrading from basic blog schema:
1. Run complete database schema
2. Migrate existing data if needed
3. Update application code for new features
4. Test all functionality

---

**Need Help?** Check the main `DATABASE-SCHEMA-CONTEXT.md` file for detailed table specifications and relationships.
