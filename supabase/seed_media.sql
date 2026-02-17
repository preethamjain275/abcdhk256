-- UNIQUE MEDIA DATA SEEDING
-- This script populates media_assets and product_media_mapping with unique, high-quality images and videos.

-- 1. CLEANUP (Optional - be careful if you have real data)
-- DELETE FROM public.product_media_mapping;
-- DELETE FROM public.media_assets;

-- 2. HELPER FUNCTION FOR SEEDING (If not available, we do it manually with CTEs)
DO $$
DECLARE
    v_media_id UUID;
    v_prod_id TEXT;
BEGIN
    -- PRODUCT: prod-1 (Appliances - AC)
    v_prod_id := 'prod-1';
    -- Image 1 (Primary)
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800', 'image', 'Appliances')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);
    -- Image 2
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1621905252507-b35239d3ff9e?auto=format&fit=crop&q=80&w=800', 'image', 'Appliances')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 1);
    -- Video
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://assets.mixkit.co/videos/preview/mixkit-man-working-with-a-digital-tablet-41394-large.mp4', 'video', 'Appliances')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 2);

    -- PRODUCT: prod-2 (Fashion - Accessories)
    v_prod_id := 'prod-2';
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', 'image', 'Fashion')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800', 'image', 'Fashion')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 1);

    -- PRODUCT: prod-3 (Kitchen - Accessories)
    v_prod_id := 'prod-3';
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800', 'image', 'Kitchen')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', 'image', 'Kitchen')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 1);

    -- PRODUCT: prod-4 (Beauty - Haircare)
    v_prod_id := 'prod-4';
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1527799822367-a233b47b0ee6?auto=format&fit=crop&q=80&w=800', 'image', 'Beauty')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=800', 'image', 'Beauty')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 1);

    -- PRODUCT: prod-13 (Laptops)
    v_prod_id := 'prod-13';
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800', 'image', 'Laptops')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-151733671569a-d99992b8ea0d?auto=format&fit=crop&q=80&w=800', 'image', 'Laptops')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 1);
    -- Video Preview
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-person-typing-on-a-laptop-41399-large.mp4', 'video', 'Laptops')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, false, 2);

    -- PRODUCT: prod-16 (Appliances - TV)
    v_prod_id := 'prod-16';
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800', 'image', 'Appliances')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);

    -- PRODUCT: prod-31 (Electronics - Smartwatch)
    v_prod_id := 'prod-31';
    INSERT INTO public.media_assets (url, asset_type, category) 
    VALUES ('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', 'image', 'Electronics')
    RETURNING id INTO v_media_id;
    INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
    VALUES (v_prod_id, v_media_id, true, 0);

    -- Add more products as needed...
    -- Loop for general items to ensure they all have at least one primary image for listings
    FOR v_prod_id IN SELECT id FROM public.products WHERE id NOT IN ('prod-1','prod-2','prod-3','prod-4','prod-13','prod-16','prod-31') LIMIT 100 LOOP
        INSERT INTO public.media_assets (url, asset_type, category) 
        VALUES ('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800&sig=' || v_prod_id, 'image', 'General')
        RETURNING id INTO v_media_id;
        
        INSERT INTO public.product_media_mapping (product_id, media_id, is_primary, sort_order)
        VALUES (v_prod_id, v_media_id, true, 0);
    END LOOP;

END $$;
