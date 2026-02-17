-- ===================================================
-- ADMIN POLICY SETUP SCRIPT
-- Run this to give Admins permission to see ALL data
-- ===================================================

-- 1. Enable RLS on all tables (Safety Check)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. BASIC USER POLICIES (Crucial for Admin Check to work)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- 3. ADMIN POLICIES
-- Generic Admin Check: (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'

-- PRODUCTS: Admins can do anything
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products" ON public.products
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- ORDERS: Admins can see all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- ORDER ITEMS: Admins can see all order items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- PROFILES (Customers): Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- TRANSACTIONS: Admins can see all transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);
