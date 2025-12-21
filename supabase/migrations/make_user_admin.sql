-- =====================================================
-- Data Legacy 2.0 - Make User Admin
-- Migration: make_user_admin.sql
-- Date: 2026
-- =====================================================
-- 
-- Bu script'i kullanarak kullanıcınızı admin yapabilirsiniz
-- 
-- KULLANIM:
-- 1. Email adresinizi aşağıdaki SQL'de değiştirin
-- 2. Supabase SQL Editor'da çalıştırın
-- 3. Kontrol edin

-- =====================================================
-- YÖNTEM 1: Email ile Admin Yapma (Önerilen)
-- =====================================================

-- Email adresinizi buraya yazın
UPDATE public.users 
SET is_admin = true 
WHERE email = 'oozdwh@gmail.com';

-- Kontrol et
SELECT 
    id,
    email,
    is_admin,
    current_level,
    total_xp,
    created_at
FROM public.users 
WHERE email = 'oozdwh@gmail.com';

-- =====================================================
-- YÖNTEM 2: User ID ile Admin Yapma
-- =====================================================
-- Eğer email yerine user ID kullanmak isterseniz:

-- Önce user ID'nizi bulun
-- SELECT id, email FROM public.users WHERE email = 'oozdwh@gmail.com';

-- Sonra user ID ile admin yapın (yukarıdaki sorgudan aldığınız ID'yi kullanın)
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE id = 'user-id-buraya';

-- =====================================================
-- YÖNTEM 3: Eğer Kullanıcı public.users Tablosunda Yoksa
-- =====================================================
-- Eğer kullanıcı auth.users'da var ama public.users'da yoksa:

-- INSERT INTO public.users (id, email, is_admin, current_level, total_xp, unlocked_levels)
-- SELECT 
--     au.id,
--     au.email,
--     true as is_admin,
--     1 as current_level,
--     0 as total_xp,
--     ARRAY['ENGINEER_1', 'SCIENTIST_1', 'ANALYST_1', 'ENGINEER_BEHAVIORAL_1', 'SCIENTIST_BEHAVIORAL_1', 'ANALYST_BEHAVIORAL_1'] as unlocked_levels
-- FROM auth.users au
-- WHERE au.email = 'oozdwh@gmail.com'
-- AND NOT EXISTS (
--     SELECT 1 FROM public.users u WHERE u.id = au.id
-- )
-- ON CONFLICT (id) DO UPDATE
-- SET is_admin = true;

-- =====================================================
-- YÖNTEM 4: Tüm Admin Kullanıcıları Listeleme
-- =====================================================
-- Mevcut admin kullanıcıları görmek için:

-- SELECT 
--     id,
--     email,
--     is_admin,
--     current_level,
--     total_xp,
--     created_at
-- FROM public.users 
-- WHERE is_admin = true
-- ORDER BY created_at DESC;

-- =====================================================
-- YÖNTEM 5: Admin Yetkisini Kaldırma
-- =====================================================
-- Bir kullanıcının admin yetkisini kaldırmak için:

-- UPDATE public.users 
-- SET is_admin = false 
-- WHERE email = 'oozdwh@gmail.com';

-- =====================================================
-- NOTLAR
-- =====================================================
-- 1. Email adresini değiştirmeyi unutmayın!
-- 2. SQL'i çalıştırdıktan sonra kontrol sorgusunu çalıştırın
-- 3. is_admin = true görünmeli
-- 4. Değişiklik hemen etkili olur, sayfayı yenilemeniz yeterli

