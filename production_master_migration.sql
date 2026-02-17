
-- ==========================================================
-- PRODUCTION-GRADE E-COMMERCE DATABASE ARCHITECTURE
-- Designed for Scale: Amazon / Flipkart / Meesho Style
-- ==========================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS & TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('customer', 'seller', 'admin', 'moderator');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_stage') THEN
        CREATE TYPE order_stage AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded', 'voided');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_category') THEN
        CREATE TYPE media_category AS ENUM ('product', 'category', 'review', 'banner', 'user', 'brand');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_type') THEN
        CREATE TYPE asset_type AS ENUM ('image', 'video', '360_view', 'document');
    END IF;
END $$;

-- 2. MEDIA CORE (Polymorphic & Reusable)
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    asset_type asset_type NOT NULL DEFAULT 'image',
    category media_category NOT NULL,
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CATEGORY SYSTEM (Infinite Depth)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    media_id UUID REFERENCES public.media_assets(id),
    level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BRAND SYSTEM 
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_id UUID REFERENCES public.media_assets(id),
    website TEXT,
    description TEXT,
    is_assured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PRODUCTS CORE (Modified for multi-vendor)
-- Safety: Add columns if table exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand_id') THEN
        ALTER TABLE public.products ADD COLUMN brand_id UUID REFERENCES public.brands(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='slug') THEN
        ALTER TABLE public.products ADD COLUMN slug TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seller_id') THEN
        ALTER TABLE public.products ADD COLUMN seller_id UUID; -- References auth.users or profiles
    END IF;
END $$;

-- 6. PRODUCT VARIANTS & SKU
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name TEXT, -- e.g. "iPhone 15 - Blue - 256GB"
    mrp DECIMAL(12, 2) NOT NULL,
    sale_price DECIMAL(12, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    weight_grams INTEGER,
    dimensions_cm JSONB, -- {l, w, h}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PRODUCT ATTRIBUTES (Dynamic)
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Color", "Size", "Material"
    value TEXT NOT NULL, -- e.g. "Space Blue", "XL", "Cotton"
    meta_data JSONB DEFAULT '{}'
);

-- 8. MEDIA MAPPINGS (N-N relationships)
CREATE TABLE IF NOT EXISTS public.product_media_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    media_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- 9. USER PROFILES & ADDRESSES
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- auth.uid()
    address_type TEXT DEFAULT 'home', -- home, office
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. CART SYSTEM (Real-time locked)
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- Null for guest carts
    session_id TEXT, -- For guest tracking
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_addition DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PAYMENTS SYSTEM (V2 - Gateway Agnostic)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    provider TEXT NOT NULL, -- Razorpay, Stripe, UPI
    method_type TEXT NOT NULL, -- card, upi, wallet
    masked_info TEXT, -- **** 1234
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID, -- REFERENCES public.orders(id) after creation
    user_id UUID,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'pending',
    provider_transaction_id TEXT,
    provider_order_id TEXT,
    method_info JSONB,
    error_log JSONB,
    webhook_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID, -- REFERENCES public.orders(id)
    status order_stage NOT NULL,
    comment TEXT,
    updated_by UUID, -- Admin/Seller ID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. REVIEWS MEDIA
CREATE TABLE IF NOT EXISTS public.review_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    media_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE
);

-- 14. OFFERS & COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- percentage, fixed
    discount_value DECIMAL(12, 2) NOT NULL,
    min_order_value DECIMAL(12, 2),
    max_discount DECIMAL(12, 2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. INDEXES FOR SCALE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_media_category ON public.media_assets(category);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_order ON public.payment_transactions(order_id);

-- 16. DATA INTEGRITY CONSTRAINTS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'one_primary_media_per_product_mapping') THEN
        CREATE UNIQUE INDEX one_primary_media_per_product_mapping 
        ON public.product_media_mapping (product_id) 
        WHERE (is_primary = true AND variant_id IS NULL);
    END IF;
END $$;

-- 17. TRIGGER FOR AUTO-UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 18. RLS ENFORCEMENT (SUPABASE)
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 19. POLICIES
DROP POLICY IF EXISTS "Public read access for media" ON public.media_assets;
CREATE POLICY "Public read access for media" ON public.media_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own addresses" ON public.user_addresses;
CREATE POLICY "Users manage own addresses" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own cart" ON public.carts;
CREATE POLICY "Users manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id);

-- End of Migration
