-- =====================================================
-- Sample Booking Data for Lyrica Template
-- =====================================================
-- This script adds sample booking slots for testing the booking system
-- Run this after the main database setup

-- =====================================================
-- BOOKING SYSTEM - SAMPLE DATA
-- =====================================================
-- Created: September 11, 2025
-- Purpose: Sample booking slots for testing the reservation system
-- Context: Part of Lyrica template's booking functionality
-- Features: Horse riding, yoga, cooking classes with time slots
-- Dependencies: Requires bookings table from lyrica-complete-database-schema.sql
-- Usage: Run after main schema setup to populate sample data
-- Note: Replace admin user IDs with actual user IDs from your system
-- =====================================================

-- Sample Horse Riding Sessions
INSERT INTO public.bookings (
    user_id,
    activity_type,
    title,
    description,
    start_time,
    end_time,
    max_capacity,
    price,
    location
) VALUES
-- Admin user bookings (replace with actual admin user ID)
((SELECT id FROM auth.users LIMIT 1), 'horse_riding', 'Morning Horse Riding Session', 'Beginner-friendly horse riding session in the countryside', '2025-09-15 09:00:00+00', '2025-09-15 10:00:00+00', 4, 45.00, 'Riverside Stables'),
((SELECT id FROM auth.users LIMIT 1), 'horse_riding', 'Afternoon Trail Ride', 'Scenic trail ride through the forest paths', '2025-09-15 14:00:00+00', '2025-09-15 16:00:00+00', 6, 75.00, 'Forest Trails'),
((SELECT id FROM auth.users LIMIT 1), 'horse_riding', 'Sunset Ride Experience', 'Romantic sunset horse riding session', '2025-09-15 18:00:00+00', '2025-09-15 19:30:00+00', 2, 60.00, 'Hilltop Viewpoint'),

-- Yoga Classes
((SELECT id FROM auth.users LIMIT 1), 'yoga', 'Morning Yoga Flow', 'Energizing morning yoga session for all levels', '2025-09-16 08:00:00+00', '2025-09-16 09:00:00+00', 10, 20.00, 'Garden Studio'),
((SELECT id FROM auth.users LIMIT 1), 'yoga', 'Evening Relaxation Yoga', 'Gentle yoga for stress relief and relaxation', '2025-09-16 19:00:00+00', '2025-09-16 20:00:00+00', 12, 25.00, 'Peace Room'),

-- Cooking Classes
((SELECT id FROM auth.users LIMIT 1), 'cooking', 'Italian Pasta Making', 'Learn to make authentic Italian pasta from scratch', '2025-09-17 10:00:00+00', '2025-09-17 12:00:00+00', 8, 55.00, 'Kitchen Studio'),
((SELECT id FROM auth.users LIMIT 1), 'cooking', 'Baking Workshop', 'Hands-on baking session with professional techniques', '2025-09-17 14:00:00+00', '2025-09-17 16:00:00+00', 6, 45.00, 'Baking Studio'),

-- Future dates for ongoing availability
((SELECT id FROM auth.users LIMIT 1), 'horse_riding', 'Weekend Trail Adventure', 'Full day horse riding adventure', '2025-09-20 09:00:00+00', '2025-09-20 17:00:00+00', 8, 120.00, 'Mountain Trails'),
((SELECT id FROM auth.users LIMIT 1), 'yoga', 'Meditation & Yoga Retreat', 'Weekend wellness retreat', '2025-09-21 09:00:00+00', '2025-09-21 17:00:00+00', 15, 150.00, 'Retreat Center');

-- Update current_bookings count (this would normally be handled by triggers)
-- For now, we'll leave them at 0 for fresh bookings

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check inserted bookings:
-- SELECT activity_type, title, start_time, max_capacity, price FROM public.bookings ORDER BY start_time;
--
-- Check total bookings by activity:
-- SELECT activity_type, COUNT(*) as total_slots FROM public.bookings GROUP BY activity_type;
