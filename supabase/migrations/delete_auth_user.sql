-- =====================================================
-- Data Legacy 2.0 - Delete User from auth.users
-- Migration: delete_auth_user.sql
-- Date: 2026
-- =====================================================
-- 
-- IMPORTANT: This script deletes a user from auth.users table
-- WARNING: This will permanently delete the user and cannot be undone!
--
-- HOW TO USE:
-- 1. Replace 'oozdwh@gmail.com' with the email you want to delete
-- 2. Run this SQL in Supabase SQL Editor
-- 3. The user will be deleted from auth.users
-- 4. Then you can create a new user with the same email
--
-- NOTE: You need to have proper permissions to delete from auth.users
-- If this doesn't work, try using the Supabase Admin API or contact support

-- =====================================================
-- METHOD 1: Direct Delete (Requires Service Role or Admin)
-- =====================================================

-- Delete user from auth.users
DELETE FROM auth.users 
WHERE email = 'oozdwh@gmail.com';

-- Verify deletion
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'oozdwh@gmail.com';
-- Should return 0 rows

-- =====================================================
-- METHOD 2: Change Email (If Delete Doesn't Work)
-- =====================================================
-- If you can't delete, change the email to something else temporarily
-- Then create a new user with the original email

-- Step 1: Change email to temporary value
-- UPDATE auth.users 
-- SET email = 'oozdwh_old_' || id::text || '@temp.com'
-- WHERE email = 'oozdwh@gmail.com';

-- Step 2: Verify email changed
-- SELECT id, email FROM auth.users WHERE email LIKE 'oozdwh_old_%';

-- Step 3: Now you can create a new user with oozdwh@gmail.com
-- (Go to /auth page and sign up)

-- Step 4: After creating new user, optionally delete the old one:
-- DELETE FROM auth.users WHERE email LIKE 'oozdwh_old_%';

-- =====================================================
-- METHOD 3: Using Supabase Admin API (Recommended for Production)
-- =====================================================
-- If SQL doesn't work, use Supabase Admin API:
--
-- POST https://<project-ref>.supabase.co/auth/v1/admin/users/<user-id>
-- Headers:
--   Authorization: Bearer <service-role-key>
--   apikey: <service-role-key>
-- Method: DELETE
--
-- Or use Supabase Management API:
-- DELETE https://api.supabase.com/v1/projects/<project-id>/auth/users/<user-id>

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After deletion, verify:
-- 1. User is deleted from auth.users
-- 2. User profile is deleted from public.users (if CASCADE is enabled)
-- 3. You can now create a new user with the same email

