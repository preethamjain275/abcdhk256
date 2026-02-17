-- ==========================================
-- ADMIN FEATURES EXPANSION SCRIPT
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Coupons Table
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

-- 2. Site Settings Table (Key-Value Store for Admin Config)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. RLS Policies for New Tables

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Coupons Policies
-- Public can read active coupons (for application)
CREATE POLICY "Public read active coupons" ON public.coupons 
  FOR SELECT USING (is_active = true);

-- Admins can do everything with coupons
CREATE POLICY "Admins manage coupons" ON public.coupons 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Settings Policies
-- Public can read settings (e.g. site name, banner)
CREATE POLICY "Public read settings" ON public.site_settings 
  FOR SELECT USING (true);

-- Admins can update settings
CREATE POLICY "Admins manage settings" ON public.site_settings 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 4. Seed Basic Settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('site_info', '{"name": "ShopSphere", "description": "Premium E-commerce Store", "logo_url": ""}', 'General site information'),
  ('banners', '[]', 'Homepage banners'),
  ('tax_config', '{"rate": 0.05, "shipping_rate": 10.00}', 'Tax and shipping configuration')
ON CONFLICT (key) DO NOTHING;

-- 5. Seed Sample Coupon
INSERT INTO public.coupons (code, discount_type, discount_value, min_purchase_amount, is_active)
VALUES ('WELCOME2026', 'percentage', 10.00, 50.00, true)
ON CONFLICT (code) DO NOTHING;
