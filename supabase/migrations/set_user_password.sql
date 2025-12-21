-- =====================================================
-- Data Legacy 2.0 - Set User Password (Manual)
-- Migration: set_user_password.sql
-- Date: 2026
-- =====================================================
-- 
-- IMPORTANT: This script sets a password for an existing user
-- Use this if the user was created via magic link (no password)
--
-- HOW TO USE:
-- 1. Replace 'your_secure_password_here' with your desired password
-- 2. Run this SQL in Supabase SQL Editor
-- 3. The password will be hashed automatically by Supabase
--
-- NOTE: Supabase uses bcrypt for password hashing, but we can't directly
-- hash passwords in SQL. Instead, we'll use Supabase's built-in function
-- or delete and recreate the user with a password.
--
-- ALTERNATIVE METHOD (Recommended):
-- Use Supabase Dashboard > Authentication > Users > Reset Password
-- OR delete the user and recreate with password

-- =====================================================
-- METHOD 1: Delete and Recreate User (Recommended)
-- =====================================================
-- This is the safest method if you don't have important data

-- Step 1: Delete the user from auth.users (this will cascade to public.users if RLS allows)
-- WARNING: This will delete the user and all their data!
-- Uncomment the line below ONLY if you want to delete the user:
-- DELETE FROM auth.users WHERE email = 'oozdwh@gmail.com';

-- Step 2: After deletion, sign up again with email/password at /auth page
-- This will create a new user with a password

-- =====================================================
-- METHOD 2: Use Supabase Admin API (Requires Service Role Key)
-- =====================================================
-- This method requires the service role key and should be done via
-- a server-side script, not SQL Editor

-- =====================================================
-- METHOD 3: Check if user exists and has password
-- =====================================================
-- Check if the user exists in auth.users
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'oozdwh@gmail.com';

-- =====================================================
-- RECOMMENDED SOLUTION:
-- =====================================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the user: oozdwh@gmail.com
-- 3. Click on the user
-- 4. Click "Send password reset email" (even if SMTP is not configured, 
--    you can copy the reset link from the logs)
-- 5. OR manually set password using Supabase Admin API
--
-- OR
--
-- 1. Delete the user from Supabase Dashboard
-- 2. Go to /auth page
-- 3. Sign up with oozdwh@gmail.com and a password
-- 4. Run the create_admin_user.sql to set admin status

