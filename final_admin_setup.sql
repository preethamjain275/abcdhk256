-- ===================================================
-- FINAL ADMIN SETUP SCRIPT
-- Run this ENTIRE file in the Supabase SQL Editor
-- ===================================================

-- 1. First, enable the role column if it doesn't exist (safety check)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
    END IF;
END $$;

-- 2. UPDATE YOUR USER TO ADMIN
-- This sets the role to 'ADMIN' for your specific email address
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'kumarpurushotham551@gmail.com'; 

-- 3. VERIFY the update
-- This will return a list of all admins, so you can confirm your email is there
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE role = 'ADMIN';
