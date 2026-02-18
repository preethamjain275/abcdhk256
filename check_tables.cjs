
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nijohqvyjsqrgslafjbq.supabase.co";
const SUPABASE_KEY = "sb_publishable_6IHWRX9huhg_Tz3wuJRpZg_Vmq-riHd";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
    console.log("Checking for 'media_assets' table...");
    const { data: media, error: mediaErr } = await supabase.from('media_assets').select('*').limit(1);
    if (mediaErr) console.log("media_assets error:", mediaErr.message);
    else console.log("media_assets columns:", media.length > 0 ? Object.keys(media[0]).join(', ') : "Table exists (empty)");

    console.log("Checking for 'product_media_mapping' table...");
    const { data: map, error: mapErr } = await supabase.from('product_media_mapping').select('*').limit(1);
    if (mapErr) console.log("product_media_mapping error:", mapErr.message);
    else console.log("product_media_mapping columns:", map.length > 0 ? Object.keys(map[0]).join(', ') : "Table exists (empty)");

    console.log("Checking for 'brands' table...");
    const { data: brands, error: brandErr } = await supabase.from('brands').select('*').limit(1);
    if (brandErr) console.log("brands error:", brandErr.message);
    else console.log("brands columns:", brands.length > 0 ? Object.keys(brands[0]).join(', ') : "Table exists (empty)");
}

checkTables();
