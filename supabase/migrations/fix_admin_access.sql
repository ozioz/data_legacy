-- Fix admin access for oozdwh@gmail.com
-- This ensures the user has admin access

DO $$
DECLARE
    target_email TEXT := 'oozdwh@gmail.com';
    auth_user_id UUID;
BEGIN
    -- Find the user ID from auth.users
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = target_email;
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', target_email;
    END IF;
    
    -- Ensure public.users row exists with admin access
    INSERT INTO public.users (id, email, is_admin, current_level, total_xp, unlocked_levels, created_at, updated_at)
    VALUES (
        auth_user_id,
        target_email,
        true,  -- Explicitly set to boolean true
        1,
        0,
        ARRAY['ENGINEER_1', 'SCIENTIST_1', 'ANALYST_1', 'ENGINEER_BEHAVIORAL_1', 'SCIENTIST_BEHAVIORAL_1', 'ANALYST_BEHAVIORAL_1'],
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        is_admin = true,  -- Force update to true
        email = target_email,
        updated_at = NOW();
    
    -- Also update auth.users metadata for reference
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('is_admin', true),
        updated_at = NOW()
    WHERE id = auth_user_id;
    
    RAISE NOTICE 'Admin access granted/verified for % (User ID: %)', target_email, auth_user_id;
END $$;

-- Verify the update
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    pu.id as public_user_id,
    pu.email as public_email,
    pu.is_admin,
    pu.is_admin::text as is_admin_text,
    CASE 
        WHEN pu.is_admin = true THEN 'TRUE (boolean)'
        WHEN pu.is_admin::text = 'true' THEN 'TRUE (text)'
        ELSE 'FALSE'
    END as admin_status,
    pu.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'oozdwh@gmail.com';


