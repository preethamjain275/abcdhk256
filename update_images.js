
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    let cleanValue = value.trim();
    if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) || (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
      cleanValue = cleanValue.slice(1, -1);
    }
    envVars[key.trim()] = cleanValue;
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'] || envVars['VITE_SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Check .env for Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Publicly available nice video URLs (e.g. from Pexels/Coverr/Mixkit free tier)
// Using reliable MP4 links.
const VIDEO_URLS = [
    'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4', // Shopping
    'https://videos.pexels.com/video-files/3205915/3205915-uhd_2560_1440_25fps.mp4', // Clothes
    'https://videos.pexels.com/video-files/853870/853870-hd_1920_1080_25fps.mp4', // Tech
    'https://cdn.coverr.co/videos/coverr-online-shopping-on-tablet-1634/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-browsing-clothes-in-store-4623/1080p.mp4'
];

async function updateImages() {
  console.log('Fetching products for robust image update...');
  
  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    let attempts = 0;
    let success = false;
    let data = null;
    let error = null;

    while (attempts < 3 && !success) {
        try {
            const res = await supabase
              .from('products')
              .select('id, category')
              .range(page * pageSize, (page + 1) * pageSize - 1);
            data = res.data;
            error = res.error;
            if (!error) success = true;
        } catch (e) {
            console.error(`Attempt ${attempts + 1} failed:`, e.message);
        }
        attempts++;
        if (!success) await new Promise(r => setTimeout(r, 2000));
    }

    if (error || !success) {
      console.error('Error fetching products after retries:', error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    allProducts = [...allProducts, ...data];
    console.log(`Fetched ${allProducts.length} products so far...`);
    
    if (data.length < pageSize) break;
    page++;
  }
  
  console.log(`Total products to update: ${allProducts.length}`);
  
  // Update in batches
  const batchSize = 50;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    
    const updates = batch.map(p => {
        // Use Picsum with seed for deterministic uniqueness
        // This ensures every product has a UNIQUE image that stays the same for that product.
        // Format: https://picsum.photos/seed/{SEED}/{WIDTH}/{HEIGHT}
        
        const seedBase = p.id;
        
        // Generate 3 images per product
        const imgs = [
             `https://picsum.photos/seed/${seedBase}_1/800/800`,
             `https://picsum.photos/seed/${seedBase}_2/800/800`,
             `https://picsum.photos/seed/${seedBase}_3/800/800`
        ];
        
        // 20% chance to get a video
        const hasVideo = Math.random() < 0.2;
        const video = hasVideo ? VIDEO_URLS[Math.floor(Math.random() * VIDEO_URLS.length)] : null;
        
        return {
            id: p.id,
            images: imgs,
            video_url: video
        };
    });
    
    // Perform upsert (update)
    const { error: updateError } = await supabase
        .from('products')
        .upsert(updates, { onConflict: 'id' });
        
    if (updateError) {
        console.error(`Error updating batch ${i}:`, updateError);
    } else {
        // console.log(`Updated batch ${i} - ${i + batchSize}`);
        process.stdout.write('.');
    }
  }
  
  console.log('\n✅ Robust Image & Video update complete.');
}

updateImages();
