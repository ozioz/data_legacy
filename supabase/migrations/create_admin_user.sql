-- =====================================================
-- Data Legacy 2.0 - Create Admin User
-- Migration: create_admin_user.sql
-- Date: 2026
-- =====================================================
-- 
-- IMPORTANT: Run this AFTER the user has signed up with email/password
-- OR manually create the auth user first, then run this
--
-- Step 1: User must sign up with email: oozdwh@gmail.com and a password
-- Step 2: Then run this SQL to set admin status
--
-- Alternative: If user doesn't exist yet, you can create them manually:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Enter email: oozdwh@gmail.com, set a password
-- 4. Then run this SQL

-- Set admin status for oozdwh@gmail.com
UPDATE public.users 
SET is_admin = true 
WHERE email = 'oozdwh@gmail.com';

-- If the user doesn't exist in public.users yet, create the profile
-- (This assumes the auth user already exists in auth.users)
INSERT INTO public.users (id, email, is_admin, current_level, total_xp, unlocked_levels)
SELECT 
    au.id,
    au.email,
    true as is_admin,
    1 as current_level,
    0 as total_xp,
    ARRAY['ENGINEER_1', 'SCIENTIST_1', 'ANALYST_1', 'ENGINEER_BEHAVIORAL_1', 'SCIENTIST_BEHAVIORAL_1', 'ANALYST_BEHAVIORAL_1'] as unlocked_levels
FROM auth.users au
WHERE au.email = 'oozdwh@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO UPDATE
SET is_admin = true;

-- Verify admin status
SELECT 
    u.id,
    u.email,
    u.is_admin,
    u.current_level,
    u.total_xp
FROM public.users u
WHERE u.email = 'oozdwh@gmail.com';

