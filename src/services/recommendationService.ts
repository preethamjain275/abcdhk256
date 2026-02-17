import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// LocalStorage keys (keep primarily for history/wishlist if not logged in)
const HISTORY_KEY = 'ecommerce-browsing-history';
const WISHLIST_KEY = 'ecommerce-wishlist';

// Helper to get data from storage
const getStorageData = (key: string): string[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

// Helper to set data to storage
const setStorageData = (key: string, data: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};

let mockBrowsingHistory: string[] = getStorageData(HISTORY_KEY);
let mockWishlist: string[] = getStorageData(WISHLIST_KEY);

// Utility to patch broken source.unsplash.com URLs (deprecated service)
const patchImageUrl = (url: string, category?: string, name?: string): string => {
  if (!url) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
  
  // If it's a defunct source.unsplash.com URL, we need to replace it
  if (url.includes('source.unsplash.com')) {
    // Generate a consistent but working URL based on the product name/category
    const seed = name || category || 'premium';
    const categoryMap: Record<string, string> = {
      'Electronics': 'photo-1498049794561-7780e7231661',
      'Fashion': 'photo-1483985988355-763728e1935b',
      'Home': 'photo-1513519247388-4e283283c74c',
      'Appliances': 'photo-1584622650111-993a426fbf0a',
      'Grocery': 'photo-1542838132-92c53300491e',
      'Beauty': 'photo-1522335789203-aabd1fc54bc9',
      'Toys': 'photo-1531651411578-f74c53ecc247',
      'Books': 'photo-1495446815901-a7297e633e8d',
      'Mobiles': 'photo-1511707171634-5f897ff02aa9',
      'Laptops': 'photo-1496181133206-80ce9b88a853',
      'Footwear': 'photo-1542291026-7eec264c27ff',
      'Kitchen': 'photo-1556910103-1c02745aae4d',
      'Jewelry': 'photo-1515562141522-b3dc730343a0',
      'Sports': 'photo-1517836357463-d25dfeac3438',
      'Travel': 'photo-1469854523086-cc02fe5d8800',
      'Decor': 'photo-1534349762230-e0cadf78f5ea'
    };
    
    const photoId = categoryMap[category || ''] || 'photo-1539185441755-769473a23570'; // fallback
    return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=800&sig=${encodeURIComponent(seed)}`;
  }
  return url;
};

// Helper to map DB result to Product type
const mapProductFromDB = (data: any): Product => {
  // Handle new schema: product_media_mapping -> media_assets
  const mappings = data.product_media_mapping || [];
  const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
  const primaryAsset = primaryMapping?.media_assets;

  const media = mappings.map((mapping: any) => {
    const asset = mapping.media_assets;
    if (!asset) return null;
    return {
      id: asset.id,
      productId: mapping.product_id,
      type: asset.asset_type as 'image' | 'video',
      url: patchImageUrl(asset.url, data.category, data.name),
      isPrimary: mapping.is_primary,
    };
  }).filter(Boolean);

  // Backwards compatibility for frontend components
  let images = primaryAsset ? [patchImageUrl(primaryAsset.url, data.category, data.name)] : [];

  if (images.length === 0 && data.images && Array.isArray(data.images)) {
    images = data.images.map((url: string) => patchImageUrl(url, data.category, data.name));
  }

  const primaryVideo = media.find((m: any) => m.type === 'video');

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: Number(data.price),
    originalPrice: data.original_price ? Number(data.original_price) : undefined,
    category: data.category,
    subcategory: data.subcategory,
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
    videoUrl: primaryVideo ? primaryVideo.url : data.video_url,
    media: media as any,
    rating: Number(data.rating),
    reviewCount: data.review_count,
    stock: data.stock,
    tags: data.tags || [],
    createdAt: data.created_at,
    featured: data.featured,
    bestseller: data.bestseller,
    sizes: data.sizes || [],
    colors: data.colors || [],
    dealOfTheDay: data.deal_of_the_day,
    dealExpiresAt: data.deal_expires_at,
  };
};


export const recommendationService = {
  /**
   * Get recommendations based on a specific product
   * Uses category matching and related products via Supabase
   */
  async getRelatedProducts(productId: string, limit = 6): Promise<Product[]> {
    // 1. Get the current product to know its category/tags
    const { data: currentProduct } = await (supabase
      .from('products')
      .select('category, tags')
      .eq('id', productId)
      .single() as any);

    if (!currentProduct) return [];

    // 2. Fetch candidates from DB
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(*, media_assets(*))')
      .neq('id', productId) // Exclude current
      .eq('category', currentProduct.category) // Same category
      .limit(limit);

    if (error) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  },

  /**
   * Get personalized recommendations based on browsing history
   */
  async getPersonalizedRecommendations(limit = 8): Promise<Product[]> {
    // Ideally, we fetch history from a 'view_history' table if user is logged in.
    // For now, we use the local storage IDs to query the DB.
    
    if (mockBrowsingHistory.length === 0) {
      // Fallback to featured or bestsellers if no history
      const { data } = await supabase
        .from('products')
        .select('*, product_media_mapping(*, media_assets(*))')
        .eq('featured', true)
        .limit(limit);
      return (data || []).map(mapProductFromDB);
    }

    // Heuristic: Get products from same categories as recently viewed
    // 1. Get categories of viewed items
    const { data: viewedItems } = await (supabase
      .from('products')
      .select('category')
      .in('id', mockBrowsingHistory.slice(0, 5)) as any); // Check last 5

    const categories = viewedItems ? [...new Set(viewedItems.map(i => i.category))] : [];

    if (categories.length === 0) return [];

    // 2. Query products in those categories
    let query = supabase
      .from('products')
      .select('*, product_media_mapping(*, media_assets(*))')
      .in('category', categories);

    if (mockBrowsingHistory.length > 0) {
      query = query.not('id', 'in', `(${mockBrowsingHistory.join(',')})`);
    }

    const { data: recommendations, error } = await query.limit(limit);

    if (error) {
       return [];
    }
    
    return (recommendations || []).map(mapProductFromDB);
  },

  /**
   * Get trending products
   */
  async getTrendingProducts(limit = 6): Promise<Product[]> {
    // Trending = Bestsellers or High Rating
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(*, media_assets(*))')
      .order('rating', { ascending: false }) // Simple "trending" proxy
      .limit(limit);

    if (error) return [];
    return (data || []).map(mapProductFromDB);
  },

  /**
   * Get products frequently bought together
   */
  async getFrequentlyBoughtTogether(productId: string): Promise<Product[]> {
    // Mock logic: return complementary category items
    // In real DB, we'd query order_items
    const { data: currentProduct } = await (supabase
      .from('products')
      .select('category')
      .eq('id', productId)
      .single() as any);

    if (!currentProduct) return [];

    const complementaryCategories: Record<string, string[]> = {
      'Clothing': ['Accessories', 'Footwear'],
      'Electronics': ['Accessories'],
      'Accessories': ['Clothing', 'Beauty'],
      'Footwear': ['Clothing', 'Accessories'],
      'Beauty': ['Accessories'],
      'Home': ['Beauty'],
    };

    const relatedCats = complementaryCategories[currentProduct.category] || [];
    
    if (relatedCats.length === 0) return [];

    const { data } = await supabase
      .from('products')
      .select('*, product_media_mapping(*, media_assets(*))')
      .in('category', relatedCats)
      .limit(3);

    return (data || []).map(mapProductFromDB);
  },

  /**
   * Update browsing history
   */
  async trackProductView(productId: string): Promise<void> {
    // Remove if exists (to move to front)
    mockBrowsingHistory = mockBrowsingHistory.filter(id => id !== productId);
    // Add to front
    mockBrowsingHistory.unshift(productId);
    // Keep only last 20
    mockBrowsingHistory = mockBrowsingHistory.slice(0, 20);
    // Save
    setStorageData(HISTORY_KEY, mockBrowsingHistory);
  },

  /**
   * Add to wishlist
   */
  async addToWishlist(productId: string): Promise<void> {
    if (!mockWishlist.includes(productId)) {
      mockWishlist.push(productId);
      setStorageData(WISHLIST_KEY, mockWishlist);
    }
  },

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(productId: string): Promise<void> {
    mockWishlist = mockWishlist.filter(id => id !== productId);
    setStorageData(WISHLIST_KEY, mockWishlist);
  },

  /**
   * Get wishlist items
   */
  async getWishlist(): Promise<Product[]> {
    if (mockWishlist.length === 0) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(*, media_assets(*))')
      .in('id', mockWishlist);

    if (error) return [];

    return (data || []).map(mapProductFromDB);
  },
};
