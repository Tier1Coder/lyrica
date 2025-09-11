# Admin Role System for Lyrica

## Overview
This document describes the admin role system implementation for booking management in the Lyrica Next.js template. The system provides role-based access control with three user levels: `user`, `moderator`, and `admin`.

## Features
- **Role-based Access Control**: Three user roles with different permissions
- **Admin Dashboard**: Web interface for managing users and bookings
- **Secure API Endpoints**: Protected routes with proper authentication
- **Database Security**: Row Level Security policies for all operations
- **Audit Trail**: Automatic timestamp tracking for all changes

## Database Schema Changes

### New Columns
```sql
-- Added to profiles table
role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'))
```

### New Functions
- `is_admin(user_id)` - Check if user has admin role
- `is_moderator(user_id)` - Check if user has admin or moderator role
- `promote_to_admin(target_user_id)` - Promote user to admin
- `demote_admin(target_user_id)` - Demote admin to user
- `promote_to_moderator(target_user_id)` - Promote user to moderator

### Updated RLS Policies
- **Bookings**: Admins can create, update, delete any booking
- **User Bookings**: Admins can view and manage all user reservations
- **Profiles**: Role-based access to user management

## Setup Instructions

### 1. Run Database Migration
Execute the `admin-role-system.sql` script in your Supabase SQL Editor:

```sql
-- Copy and paste the entire admin-role-system.sql content
-- Execute in Supabase Dashboard > SQL Editor
```

### 2. Create First Admin User
After running the migration, promote your first admin user:

```sql
-- Replace with your actual admin email
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-admin-email@example.com';
```

### 3. Test the System
1. Log in as the admin user
2. Navigate to `/admin` to access the admin dashboard
3. Test user management and booking management features

## API Endpoints

### Admin User Management
```
GET  /api/admin/users           - List all users (admin only)
POST /api/admin/users/[userId]  - Update user role (admin only)
```

### Admin Booking Management
```
POST /api/bookings              - Create booking slot (admin only)
PUT  /api/bookings/[id]         - Update booking (admin only)
DELETE /api/bookings/[id]       - Delete booking (admin only)
```

## Frontend Components

### Admin Dashboard (`/admin`)
- **User Management Tab**: View all users, change roles
- **Booking Management Tab**: View all bookings, delete bookings
- **Role Change Modal**: Update user roles with confirmation

### Access Control
```typescript
// In page components
import { requireAdmin } from '@/lib/auth'

export default async function AdminPage() {
  await requireAdmin() // Redirects non-admins
  return <AdminDashboard />
}
```

## User Roles & Permissions

### User Role (`user`)
- ✅ View active bookings
- ✅ Make personal reservations
- ✅ View own booking history
- ✅ Update own profile
- ❌ Create booking slots
- ❌ Manage other users
- ❌ Delete bookings

### Moderator Role (`moderator`)
- ✅ All user permissions
- ✅ View user bookings (read-only)
- ❌ Create booking slots
- ❌ Manage user roles
- ❌ Delete bookings

### Admin Role (`admin`)
- ✅ All moderator permissions
- ✅ Create booking slots
- ✅ Update any booking
- ✅ Delete any booking
- ✅ Manage user roles
- ✅ View all user data
- ✅ Access admin dashboard

## Security Features

### Row Level Security
```sql
-- Example: Only admins can create bookings
CREATE POLICY "Admins can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
```

### API Protection
```typescript
// Server-side admin check
const adminCheck = await isAdmin(session.user.id)
if (!adminCheck) {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
}
```

### Client-Side Protection
```typescript
// Hide admin features for non-admins
{isAdmin && <AdminPanel />}
```

## Usage Examples

### Promoting a User to Admin
```typescript
// Via API
const response = await fetch(`/api/admin/users/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ role: 'admin' })
});
```

### Creating a Booking Slot (Admin Only)
```typescript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    activity_type: 'horse_riding',
    title: 'Morning Trail Ride',
    start_time: '2025-09-15T09:00:00Z',
    end_time: '2025-09-15T11:00:00Z',
    max_capacity: 8,
    price: 75.00
  })
});
```

### Checking User Role
```typescript
import { getUserRole, isAdmin } from '@/lib/auth'

// Get current user's role
const role = await getUserRole()

// Check if user is admin
const admin = await isAdmin()
```

## Troubleshooting

### Common Issues

**"Admin access required" error**
- User doesn't have admin role
- Solution: Promote user to admin via database or admin dashboard

**Cannot access `/admin` page**
- User not logged in
- User doesn't have admin role
- Solution: Check authentication and user role

**RLS policy violations**
- Database policies not applied correctly
- Solution: Re-run the admin-role-system.sql script

### Database Queries for Debugging

```sql
-- Check user roles
SELECT id, email, role FROM public.profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Test admin function
SELECT public.is_admin('user-uuid-here');
```

## Best Practices

### Security
1. **Regular Audits**: Review admin user access periodically
2. **Principle of Least Privilege**: Grant minimum required permissions
3. **Session Management**: Implement proper session timeouts
4. **Logging**: Log all admin actions for audit trails

### Performance
1. **Database Indexes**: Ensure role-based indexes exist
2. **Query Optimization**: Use selective queries for large datasets
3. **Caching**: Cache role information when appropriate
4. **Pagination**: Implement pagination for large user lists

### User Experience
1. **Clear Feedback**: Show appropriate error messages
2. **Loading States**: Indicate when operations are in progress
3. **Confirmation Dialogs**: Confirm destructive actions
4. **Role Indicators**: Show user roles clearly in the UI

## Future Enhancements

### Planned Features
- **Audit Logging**: Track all admin actions
- **Bulk Operations**: Mass user role updates
- **Advanced Permissions**: Granular permission system
- **Role Templates**: Pre-defined role configurations
- **Temporary Roles**: Time-limited admin access

### API Improvements
- **Rate Limiting**: Prevent abuse of admin endpoints
- **Webhook Support**: Notify on role changes
- **Export/Import**: Bulk user management
- **Search & Filtering**: Advanced user search capabilities

## Support

For issues with the admin role system:
1. Check this documentation first
2. Review the database schema and policies
3. Test with a fresh admin user
4. Check Supabase logs for errors
5. Verify all migrations have been applied

## Changelog

### Version 1.0.0 (September 11, 2025)
- Initial implementation of admin role system
- Basic role-based access control
- Admin dashboard with user and booking management
- Database security policies and functions
- API endpoints for admin operations
