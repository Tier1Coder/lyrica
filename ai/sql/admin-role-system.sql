-- =====================================================
-- ADMIN ROLE SYSTEM FOR BOOKING MANAGEMENT
-- =====================================================
-- Created: September 11, 2025
-- Purpose: Implement admin role system for booking management
-- Context: Add role-based access control to profiles table
-- Dependencies: Existing profiles table and auth system
-- Usage: Run this script after main schema to add admin functionality
-- =====================================================

-- =====================================================
-- 1. ADD ROLE COLUMN TO PROFILES TABLE
-- =====================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'admin', 'moderator'));

-- =====================================================
-- 2. CREATE ADMIN CHECK FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE MODERATOR CHECK FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND (role = 'admin' OR role = 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. UPDATE BOOKINGS RLS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Drop existing booking policies to recreate with admin access
DROP POLICY IF EXISTS "Active bookings are viewable by everyone" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

-- Allow everyone to view active bookings
CREATE POLICY "Active bookings are viewable by everyone" ON public.bookings
    FOR SELECT USING (status = 'active');

-- Allow admins to create any bookings
CREATE POLICY "Admins can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Allow admins to update any bookings
CREATE POLICY "Admins can update bookings" ON public.bookings
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings" ON public.bookings
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Allow users to view their own bookings (for creators)
CREATE POLICY "Users can view bookings they created" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 5. UPDATE USER_BOOKINGS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Drop existing user booking policies
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.user_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.user_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.user_bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.user_bookings;

-- Users can create bookings for themselves
CREATE POLICY "Users can create their own bookings" ON public.user_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" ON public.user_bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings" ON public.user_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own bookings
CREATE POLICY "Users can delete their own bookings" ON public.user_bookings
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all user bookings" ON public.user_bookings
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins can update any booking
CREATE POLICY "Admins can update any user booking" ON public.user_bookings
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Admins can delete any booking
CREATE POLICY "Admins can delete any user booking" ON public.user_bookings
    FOR DELETE USING (public.is_admin(auth.uid()));

-- =====================================================
-- 6. CREATE ADMIN MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can promote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  UPDATE public.profiles
  SET role = 'admin', updated_at = NOW()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to user
CREATE OR REPLACE FUNCTION public.demote_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can demote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;

  -- Prevent self-demotion
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;

  UPDATE public.profiles
  SET role = 'user', updated_at = NOW()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to moderator
CREATE OR REPLACE FUNCTION public.promote_to_moderator(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can promote users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;

  UPDATE public.profiles
  SET role = 'moderator', updated_at = NOW()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_role_user_id_idx ON public.profiles(id, role);

-- =====================================================
-- 8. UPDATE TRIGGER FOR PROFILES
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SAMPLE ADMIN USER CREATION
-- =====================================================
-- Note: Replace 'admin@example.com' with actual admin email
-- This is just an example - run manually after user registration

/*
-- Example: Make a user an admin (run this manually)
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@example.com';
*/

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
/*
1. Run this script in Supabase SQL Editor
2. Create an admin user by updating their profile:
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
3. Test the admin functions in your application
4. Update your API endpoints to use the new role checking
*/
