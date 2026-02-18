
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nijohqvyjsqrgslafjbq.supabase.co";
const SUPABASE_KEY = "sb_publishable_6IHWRX9huhg_Tz3wuJRpZg_Vmq-riHd";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function probe() {
    console.log("Fetching a product...");
    const { data: products } = await supabase.from('products').select('id').limit(1);
    if (!products || products.length === 0) {
        console.log("No products found. Cannot test mapping.");
        return;
    }
    const productId = products[0].id;
    console.log("Product ID:", productId);

    console.log("Attempting insert into 'media_assets'...");
    const { data: media, error: mediaErr } = await supabase
        .from('media_assets')
        .insert({ url: 'https://via.placeholder.com/150', type: 'image' }) // Guessing 'type' column might exist? Or just 'url'.
        .select()
        .single();

    if (mediaErr) {
        console.log("media_assets insert failed:", mediaErr.message);
        // Try without 'type'
        if (mediaErr.message.includes("column \"type\" of relation \"media_assets\" does not exist")) {
            console.log("Retrying media_assets without 'type'...");
            const { data: media2, error: mediaErr2 } = await supabase
                .from('media_assets')
                .insert({ url: 'https://via.placeholder.com/150' })
                .select()
                .single();
            if (mediaErr2) console.log("Retry failed:", mediaErr2.message);
            else console.log("Success! Media ID:", media2.id);

            if (media2) attemptMapping(productId, media2.id);
        }
    } else {
        console.log("Success! Media ID:", media.id);
        attemptMapping(productId, media.id);
    }
}

async function attemptMapping(productId, mediaId) {
    console.log("Attempting insert into 'product_media_mapping'...");
    // Try standard keys
    const { error: mapErr } = await supabase
        .from('product_media_mapping')
        .insert({ product_id: productId, media_asset_id: mediaId, is_primary: true });

    if (mapErr) {
        console.log("Mapping failed:", mapErr.message);
        // Try 'media_id' instead of 'media_asset_id'
        if (mapErr.message.includes('column "media_asset_id" of relation "product_media_mapping" does not exist')) {
            console.log("Retrying mapping with 'media_id'...");
            const { error: mapErr2 } = await supabase
                .from('product_media_mapping')
                .insert({ product_id: productId, media_id: mediaId, is_primary: true });
            if (mapErr2) console.log("Retry mapping failed:", mapErr2.message);
            else console.log("Mapping Success!");
        }
    } else {
        console.log("Mapping Success!");
    }
}

probe();
