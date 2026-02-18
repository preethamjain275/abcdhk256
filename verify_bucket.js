
const https = require('https');

const url = "https://nijohqvyjsqrgslafjbq.supabase.co/storage/v1/object/public/product-images/probe_file";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Status Code:", res.statusCode);
            console.log("Response:", json);

            if (json.message === "Bucket not found") {
                console.log("VERDICT: MISSING");
            } else {
                // If it returns 'The resource was not found', usage specific error, or just 404 for object, 
                // it implies the bucket routing logic worked => Bucket Exists.
                console.log("VERDICT: EXISTS");
            }
        } catch (e) {
            console.log("Non-JSON response (likely exists but returned raw text?):", data);
            console.log("VERDICT: EXISTS (Ambiguous)");
        }
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
