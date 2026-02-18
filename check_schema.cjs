
const { createClient } = require('@supabase/supabase-js');

// Config from .env (verified earlier)
const SUPABASE_URL = "https://nijohqvyjsqrgslafjbq.supabase.co";
const SUPABASE_KEY = "sb_publishable_6IHWRX9huhg_Tz3wuJRpZg_Vmq-riHd"; // Using anon key from .env

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log("Fetching one product to inspect columns...");
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No products found to inspect.");
        // Try inserting a dummy to see if it accepts fields? No, that's risky.
    } else {
        console.log("Columns found in 'products' table:");
        console.log(Object.keys(data[0]).join(', '));
    }
}

checkSchema();
