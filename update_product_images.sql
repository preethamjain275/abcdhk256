
-- Update all products with unique deterministic images (Picsum Seed)
-- This avoids RLS issues by running directly in SQL Editor
-- It also sets a random video URL for ~20% of products

UPDATE public.products
SET 
  -- Generate 3 unique images per product using its ID as the seed
  -- Format: https://picsum.photos/seed/{ID}_{1,2,3}/800/800
  images = ARRAY[
    'https://picsum.photos/seed/' || id || '_1/800/800',
    'https://picsum.photos/seed/' || id || '_2/800/800',
    'https://picsum.photos/seed/' || id || '_3/800/800'
  ],
  
  -- Set video_url for ~20% of products randomly
  video_url = CASE 
    WHEN random() < 0.2 THEN (
      ARRAY[
        'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
        'https://videos.pexels.com/video-files/3205915/3205915-uhd_2560_1440_25fps.mp4',
        'https://videos.pexels.com/video-files/853870/853870-hd_1920_1080_25fps.mp4',
        'https://cdn.coverr.co/videos/coverr-online-shopping-on-tablet-1634/1080p.mp4',
        'https://cdn.coverr.co/videos/coverr-browsing-clothes-in-store-4623/1080p.mp4'
      ]
    )[floor(random() * 5 + 1)]
    ELSE NULL
  END;

-- Verify the update
SELECT id, name, images[1], video_url FROM public.products LIMIT 5;
