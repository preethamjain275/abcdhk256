-- ============================================
-- PERFORMANCE OPTIMIZATION SQL SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add indexes for faster queries
-- ============================================

-- Profiles table - faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Products table - faster category and filter queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(bestseller) WHERE bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_deal ON public.products(deal_of_the_day) WHERE deal_of_the_day = true;
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Product media mapping - faster image lookups
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON public.product_media_mapping(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_primary ON public.product_media_mapping(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_product_media_media_id ON public.product_media_mapping(media_id);

-- Media assets - faster asset queries
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON public.media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(asset_type);

-- Orders table - faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Reviews table - faster review queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Cart items - faster cart operations
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Wishlist - faster wishlist queries
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);

-- Browsing history - faster history queries
CREATE INDEX IF NOT EXISTS idx_browsing_history_user_id ON public.browsing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_viewed_at ON public.browsing_history(viewed_at DESC);

-- 2. Analyze tables for query optimization
-- ============================================
ANALYZE public.products;
ANALYZE public.product_media_mapping;
ANALYZE public.media_assets;
ANALYZE public.profiles;
ANALYZE public.orders;
ANALYZE public.reviews;

-- 3. Create materialized view for frequently accessed data (optional)
-- ============================================
-- This creates a cached view of products with their primary images
-- Refresh this periodically or on product updates

DROP MATERIALIZED VIEW IF EXISTS products_with_primary_media;

CREATE MATERIALIZED VIEW products_with_primary_media AS
SELECT 
    p.*,
    ma.url as primary_image_url,
    ma.asset_type as primary_asset_type
FROM 
    public.products p
LEFT JOIN 
    public.product_media_mapping pmm ON p.id = pmm.product_id AND pmm.is_primary = true
LEFT JOIN 
    public.media_assets ma ON pmm.media_id = ma.id;

-- Create index on materialized view
CREATE INDEX idx_mv_products_category ON products_with_primary_media(category);
CREATE INDEX idx_mv_products_featured ON products_with_primary_media(featured) WHERE featured = true;

-- To refresh the materialized view (run this when products are updated):
-- REFRESH MATERIALIZED VIEW products_with_primary_media;

-- 4. Verify indexes were created
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename IN ('products', 'product_media_mapping', 'media_assets', 'profiles', 'orders', 'reviews')
ORDER BY 
    tablename, indexname;

-- ============================================
-- PERFORMANCE TIPS:
-- ============================================
-- 1. Run ANALYZE periodically to update query planner statistics
-- 2. Refresh materialized view after bulk product updates
-- 3. Monitor slow queries in Supabase dashboard
-- 4. Consider pagination for large result sets
-- 5. Use select() to fetch only needed columns
-- ============================================
