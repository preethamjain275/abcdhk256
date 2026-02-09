
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

async function checkSchema() {
  console.log('Checking for payment_details column in orders table...');
  
  // Try to insert a dummy record with payment_details to see if it errors
  // Or better, just try to select it. But selecting assumes we have data.
  // We can try to select one row.
  
  const { data, error } = await supabase
    .from('orders')
    .select('payment_details')
    .limit(1);

  if (error) {
    console.error('Error selecting payment_details:', error.message);
    if (error.message.includes('does not exist')) {
        console.error('❌ FAILURE: The column "payment_details" probably does not exist in the remote database.');
    }
  } else {
    console.log('✅ SUCCESS: Column "payment_details" appears to be queryable.');
  }
}

checkSchema();
