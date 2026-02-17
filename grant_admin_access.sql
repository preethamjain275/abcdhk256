-- ==========================================
-- GRANT ADMIN ACCESS SCRIPT
-- ==========================================

-- 1. Update the user role to 'ADMIN' in the public.profiles table
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'kumarpurushotham551@gmail.com';

-- 2. Verify the update
SELECT id, email, role, created_at
FROM public.profiles
WHERE email = 'kumarpurushotham551@gmail.com';

-- IMPORTANT: 
-- If the query returns "0 rows affected", please ensure you have signed up 
-- with the email 'kumarpurushotham551@gmail.com' at least once.
