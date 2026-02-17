-- ===================================================
-- CORRECT ADMIN SETUP SCRIPT
-- Run this in the Supabase SQL Editor to fix the "Access Denied" error
-- ===================================================

-- 1. Update the specific user 'kumarpurushotham511@gmail.com' to ADMIN
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'kumarpurushotham511@gmail.com'; 

-- 2. Verify the update
SELECT email, role, created_at 
FROM public.profiles 
WHERE email = 'kumarpurushotham511@gmail.com';
