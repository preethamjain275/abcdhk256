
-- Master E-commerce Migration: Amazon/Flipkart Level Architecture (RECOVERY VERSION)
-- Goal: Fix media variety, decouple storage, and enforce data integrity.

-- 1. Create Media Type Enum
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video');
    END IF;
END $$;

-- 2. Repair/Create Product Media Table
-- This handles cases where the table might exist with different column names (type/url)
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    media_type media_type NOT NULL DEFAULT 'image',
    media_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rename columns if they exist from a previous turn's script
DO $$ 
BEGIN 
    -- Rename 'type' to 'media_type' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_media' AND column_name='type') THEN
        ALTER TABLE public.product_media RENAME COLUMN "type" TO "media_type";
    END IF;
    
    -- Rename 'url' to 'media_url' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_media' AND column_name='url') THEN
        ALTER TABLE public.product_media RENAME COLUMN "url" TO "media_url";
    END IF;
END $$;

-- 3. Migration: Move data from products table to product_media
-- Note: We use 'images' array and 'video_url' from products if they still exist
DO $$
BEGIN
    -- Only migrate if columns exist in products table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN
        INSERT INTO public.product_media (product_id, media_type, media_url, is_primary)
        SELECT 
            id as product_id, 
            'image'::media_type as media_type, 
            unnest(images) as media_url, 
            false as is_primary
        FROM public.products
        WHERE array_length(images, 1) > 0;
    END IF;

    -- Migrate Videos if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='video_url') THEN
        INSERT INTO public.product_media (product_id, media_type, media_url, is_primary)
        SELECT 
            id as product_id, 
            'video'::media_type as media_type, 
            video_url as media_url, 
            false as is_primary
        FROM public.products
        WHERE video_url IS NOT NULL AND video_url <> '';
    END IF;
END $$;

-- Set primary to the first image for each product (if no primary exists)
UPDATE public.product_media
SET is_primary = true
WHERE id IN (
    SELECT DISTINCT ON (product_id) id
    FROM public.product_media
    WHERE media_type = 'image'
    AND product_id NOT IN (SELECT product_id FROM public.product_media WHERE is_primary = true)
    ORDER BY product_id, created_at ASC
);

-- 4. Enforce Data Integrity
-- Constraint: Each product can have ONLY ONE primary media item
DROP INDEX IF EXISTS one_primary_media_per_product;
CREATE UNIQUE INDEX one_primary_media_per_product 
ON public.product_media (product_id) 
WHERE (is_primary = true);

-- 5. Cleanup: Remove legacy columns from products table
-- Safety check: Only drop columns if product_media has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.product_media LIMIT 1) THEN
        ALTER TABLE public.products DROP COLUMN IF EXISTS images;
        ALTER TABLE public.products DROP COLUMN IF EXISTS video_url;
        ALTER TABLE public.products DROP COLUMN IF EXISTS media;
        ALTER TABLE public.products DROP COLUMN IF EXISTS image;
        ALTER TABLE public.products DROP COLUMN IF EXISTS image_url;
        ALTER TABLE public.products DROP COLUMN IF EXISTS thumbnail;
    END IF;
END $$;

-- 6. Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_is_primary ON public.product_media(is_primary);

-- 7. RLS Policies
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for media" ON public.product_media;
CREATE POLICY "Allow public read access for media" 
ON public.product_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage media" ON public.product_media;
CREATE POLICY "Allow authenticated users to manage media" 
ON public.product_media FOR ALL USING (auth.role() = 'authenticated');

-- 8. Final touches: Add comments for other developers
COMMENT ON TABLE public.product_media IS 'Holds structured media assets for products. Mimics Amazon/Flipkart multi-media approach.';
COMMENT ON COLUMN public.product_media.is_primary IS 'Determines which image is shown on category/listing pages.';
