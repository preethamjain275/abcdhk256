
-- Update all products to use AI-generated images based on their name
-- This guarantees unique, semantically correct images for every product.
-- We use the product name as the prompt for Pollinations AI.
-- We add 'product' or 'luxary' context to ensured high quality.

UPDATE public.products
SET 
  images = ARRAY[
    -- Main image (e.g. "Zenith Bath Series 1945 product view")
    'https://image.pollinations.ai/prompt/' || REPLACE(name, ' ', '%20') || '%20product%20shot?width=800&height=800&nologo=true',
    
    -- Detail shot
    'https://image.pollinations.ai/prompt/' || REPLACE(name, ' ', '%20') || '%20close%20up%20detail?width=800&height=800&nologo=true',
    
    -- Lifestyle/Context shot
    'https://image.pollinations.ai/prompt/' || REPLACE(name, ' ', '%20') || '%20lifestyle%20context?width=800&height=800&nologo=true'
  ];
