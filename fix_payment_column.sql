-- Fix missing column in orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}';

-- Verify it works by selecting from it (this part won't run if the above fails, but is good for checking)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='orders' AND column_name='payment_details';
