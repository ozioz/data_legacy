-- =====================================================
-- Data Legacy 2.0 - Admin System
-- Migration: add_admin_system.sql
-- Date: 2026
-- =====================================================

-- Add is_admin column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users (is_admin) WHERE is_admin = true;

-- Update RLS policies to allow admins to manage visionary_levels
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can manage visionary levels" ON public.visionary_levels;

-- New policy: Admins can manage all levels, authenticated users can insert/update
CREATE POLICY "Admins can manage all visionary levels"
    ON public.visionary_levels
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Policy: Authenticated users can insert/update their own levels (for future features)
-- For now, only admins can manage, but we keep this for flexibility
CREATE POLICY "Authenticated users can insert visionary levels"
    ON public.visionary_levels
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Helper function to set admin status (for manual admin assignment)
CREATE OR REPLACE FUNCTION public.set_admin_status(
    target_user_id UUID,
    admin_status BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_is_admin BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT is_admin INTO current_user_is_admin
    FROM public.users
    WHERE id = auth.uid();

    -- Only admins can set admin status
    IF NOT current_user_is_admin THEN
        RAISE EXCEPTION 'Only admins can set admin status';
    END IF;

    -- Update target user's admin status
    UPDATE public.users
    SET is_admin = admin_status
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_admin_status(UUID, BOOLEAN) TO authenticated;

-- Note: To manually set a user as admin, run this SQL:
-- UPDATE public.users SET is_admin = true WHERE email = 'your-admin-email@example.com';

