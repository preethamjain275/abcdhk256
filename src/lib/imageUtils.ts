
// Pre-defined high-quality images for categories to ensure speed and reliability
// Using direct Unsplash URLs to avoid redirects
// Expanded list to prevent "Same Image" fatigue

const CATEGORY_IMAGES: Record<string, string[]> = {
    electronics: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', // Laptop
        'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?w=800&q=80', // VR
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', // Smartwatch
        'https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=800&q=80', // Keyboard
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', // Phone
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80', // Gadgets
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', // Mouse
        'https://images.unsplash.com/photo-1543512214-318c77a6e2b5?w=800&q=80', // Speaker
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', // Tech Workstation
        'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&q=80', // Gaming
        'https://images.unsplash.com/photo-1593784991095-a20506948430?w=800&q=80', // TV/Monitor
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', // Camera
    ],
    fashion: [
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80', // Coat
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Model
        'https://images.unsplash.com/photo-1529139574466-a302c2d36214?w=800&q=80', // Street Fashion
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', // Shopping
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80', // Men Fashion
        'https://images.unsplash.com/photo-1505022610485-f2495287be08?w=800&q=80', // Accessories
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', // Dress
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80', // Girl Fashion
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80', // Dark Fashion
        'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&q=80', // Man Suited
    ],
    appliances: [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', // Kitchen Mixer
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80', // Fridge concept
        'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80', // Appliance
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80', // Washing Machine
        'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80', // Kitchen
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', // Modern Kitchen
        'https://images.unsplash.com/photo-1588854337473-b958d52b947c?w=800&q=80', // Baking
        'https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=800&q=80', // Blender
    ],
    home: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&q=80', // Living Room
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', // Deco
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80', // Sofa Light
        'https://images.unsplash.com/photo-1583847661884-3883d8161f52?w=800&q=80', // Sofa Dark
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', // Modern Couch
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', // Furniture
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', // Interior
        'https://images.unsplash.com/photo-1484101403233-564f4d1e9ecd?w=800&q=80', // Lamp
    ],
    beauty: [
        'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80', // Cosmetics
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80', // Skincare
        'https://images.unsplash.com/photo-1522335789203-abd7fe01f169?w=800&q=80', // Makeup
        'https://images.unsplash.com/photo-1612817289579-58312de1e81b?w=800&q=80', // Beauty Products
        'https://images.unsplash.com/photo-1576426863863-10d786651b04?w=800&q=80', // Cream
        'https://images.unsplash.com/photo-1556228720-1957be81f5bb?w=800&q=80', // Bottle
        'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80', // Pink
    ],
    jewelry: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb052576?w=800&q=80', // Necklace
        'https://images.unsplash.com/photo-1602751584552-8ba731f0e535?w=800&q=80', // Ring
        'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80', // Gold
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', // Diamond
        'https://images.unsplash.com/photo-1617038224558-283954d63948?w=800&q=80', // Luxury Ring
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80', // Earrings
        'https://images.unsplash.com/photo-1506630448388-4e683c14ddbb?w=800&q=80', // Rings Hand
    ],
    grocery: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', // Market
        'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80', // Groceries
        'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=800&q=80', // Food
        'https://images.unsplash.com/photo-1629853909188-43d964f78ca3?w=800&q=80', // Veggies
        'https://images.unsplash.com/photo-1579113800032-c38bd1d99433?w=800&q=80', // Fruits
    ],
    toys: [
        'https://images.unsplash.com/photo-1566576912902-1d5206945d8b?w=800&q=80', // Toys
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80', // Plush
        'https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&q=80', // Car
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', // Lego
        'https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80', // Action Figure
        'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80', // Wooden
    ],
    general: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', // Watch
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', // Red Shoes
        // REMOVED HEADPHONES HERE
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', // Sunglasses
        'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80', // Product
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80', // Shoes
        'https://images.unsplash.com/photo-1503602642458-2321114458c4?w=800&q=80', // Minimal
        'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800&q=80', // BANANA (Requested)
    ]
};

// Map similar categories to keys in CATEGORY_IMAGES
const CATEGORY_MAP: Record<string, string> = {
    'electronics': 'electronics',
    'appliances': 'appliances',
    'fashion': 'fashion',
    'clothing': 'fashion',
    'home': 'home',
    'beauty': 'beauty',
    'jewelry': 'jewelry',
    'grocery': 'grocery',
    'toys': 'toys',
    'kitchen': 'appliances',
    'furniture': 'home',
    'decor': 'home',
    'accessories': 'jewelry',
    'mobile': 'electronics',
    'laptop': 'electronics',
    'gadget': 'electronics', // Added gadget
    'gaming': 'electronics', // Added gaming
};

// Function to generate a number from a string (djb2 xor variant for better distribution)
function hashString(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = (h * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(h >>> 0);
}

export function getProductImage(name: string, category: string = 'general'): string {
    // 1. Try to find a matching category
    // Robust normalizer: remove special chars?
    const normalizedCategory = (category || 'general').toLowerCase().trim();
    let categoryKey = 'general';

    // Check exact match or mapped match
    if (CATEGORY_IMAGES[normalizedCategory]) {
        categoryKey = normalizedCategory;
    } else {
        // Try to find via map
        for (const key in CATEGORY_MAP) {
            if (normalizedCategory.includes(key)) {
                categoryKey = CATEGORY_MAP[key];
                break;
            }
        }
    }

    // 2. Pick a deterministic image
    const images = CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES['general'];
    const index = hashString(name) % images.length;

    return images[index];
}

export function getFallbackImage(): string {
    // Return a safe, Banana image as requested for debugging
    return 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800&q=80';
}
