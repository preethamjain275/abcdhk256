
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://nijohqvyjsqrgslafjbq.supabase.co", "sb_publishable_6IHWRX9huhg_Tz3wuJRpZg_Vmq-riHd");

async function run() {
    const { data: p } = await supabase.from('products').select('id').limit(1);
    if (!p?.[0]) return console.log("No products");

    // Insert media
    const { data: m, error: me } = await supabase.from('media_assets').insert({ url: 'test.jpg' }).select().single();
    if (me) return console.log("Media insert err:", me.message);

    console.log("Media ID:", m.id);

    // Try mapping with 'media_id'
    const { error: map1 } = await supabase.from('product_media_mapping').insert({
        product_id: p[0].id, media_id: m.id, is_primary: true
    });

    if (!map1) {
        console.log("SUCCESS: media_id");
        return;
    }
    console.log("media_id failed:", map1.message);

    // Try mapping with 'media_asset_id'
    const { error: map2 } = await supabase.from('product_media_mapping').insert({
        product_id: p[0].id, media_asset_id: m.id, is_primary: true
    });

    if (!map2) {
        console.log("SUCCESS: media_asset_id");
    } else {
        console.log("media_asset_id failed:", map2.message);
    }
}
run();
