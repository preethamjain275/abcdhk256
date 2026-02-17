-- ===================================================
-- COMPLETE ADMIN SETUP SCRIPT (ALL-IN-ONE)
-- Run this ENTIRE file in the Supabase SQL Editor
-- This script will:
-- 1. Create necessary admin tables (Coupons, Settings)
-- 2. Setup strict security policies for Admin access
-- 3. Grant ADMIN privileges to your specific email
-- ===================================================

-- 1. DATABASE EXPANSION (Coupons & Settings)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for safety
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 2. SECURITY POLICIES (RLS)
-- ===================================================

-- Grant access to public for reading active coupons (needed for checkout)
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
CREATE POLICY "Public read active coupons" ON public.coupons 
  FOR SELECT USING (is_active = true);

-- Grant full access to Admins for coupons
DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Grant access to public for reading settings (needed for site config)
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings 
  FOR SELECT USING (true);

-- Grant full access to Admins for settings
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings" ON public.site_settings 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Fix Profile Policies (Crucial for Admin Check)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Admin Global Access Policies
-- Products
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products" ON public.products
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Profiles/Customers
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');


-- 3. GRANT ADMIN ACCESS
-- ===================================================
-- Ensure the role column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
    END IF;
END $$;

-- Update the specific user to ADMIN
-- NOTE: If this returns "0 rows affected", it means the user hasn't signed up yet.
-- Sign up first with this email, then run this block again.
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'kumarpurushotham511@gmail.com';

-- 4. VERIFICATION
-- ===================================================
SELECT id, email, role, created_at 
FROM public.profiles 
WHERE email = 'kumarpurushotham511@gmail.com';

-- 5. INITIAL DATA SEEDING (Optional)
-- ===================================================
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('site_info', '{"name": "ShopSphere", "description": "Premium E-commerce Store"}', 'General site information'),
  ('banners', '[]', 'Homepage banners'),
  ('tax_config', '{"rate": 0.05, "shipping_rate": 10.00}', 'Tax and shipping configuration')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.coupons (code, discount_type, discount_value, min_purchase_amount, is_active)
VALUES ('WELCOME2026', 'percentage', 10.00, 50.00, true)
ON CONFLICT (code) DO NOTHING;
