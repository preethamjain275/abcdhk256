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

// Helper to map DB result to Product type (duplicated from productService to avoid circular deps if any)
const mapProductFromDB = (data: any): Product => ({
  id: data.id,
  name: data.name,
  description: data.description,
  price: Number(data.price),
  originalPrice: data.original_price ? Number(data.original_price) : undefined,
  category: data.category,
  subcategory: data.subcategory,
  images: data.images || [],
  videoUrl: data.video_url,
  rating: Number(data.rating),
  reviewCount: data.review_count,
  stock: data.stock,
  tags: data.tags || [],
  createdAt: data.created_at,
  featured: data.featured,
  bestseller: data.bestseller,
});


export const recommendationService = {
  /**
   * Get recommendations based on a specific product
   * Uses category matching and related products via Supabase
   */
  async getRelatedProducts(productId: string, limit = 6): Promise<Product[]> {
    // 1. Get the current product to know its category/tags
    const { data: currentProduct } = await supabase
      .from('products')
      .select('category, tags')
      .eq('id', productId)
      .single();

    if (!currentProduct) return [];

    // 2. Fetch candidates from DB
    const { data, error } = await supabase
      .from('products')
      .select('*')
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
        .select('*')
        .eq('featured', true)
        .limit(limit);
      return (data || []).map(mapProductFromDB);
    }

    // Heuristic: Get products from same categories as recently viewed
    // 1. Get categories of viewed items
    const { data: viewedItems } = await supabase
      .from('products')
      .select('category')
      .in('id', mockBrowsingHistory.slice(0, 5)); // Check last 5

    const categories = viewedItems ? [...new Set(viewedItems.map(i => i.category))] : [];

    if (categories.length === 0) return [];

    // 2. Query products in those categories
    const { data: recommendations, error } = await supabase
      .from('products')
      .select('*')
      .in('category', categories)
      .not('id', 'in', `(${mockBrowsingHistory.join(',')})`) // Exclude viewed (Supabase syntax might vary for array not in, keeping simple for now)
      .limit(limit);

    if (error) {
       // Fallback
       return [];
    }
    
    // Client side filtering for 'not viewed' if the DB query is complex
    const filtered = (data || []).filter((p: any) => !mockBrowsingHistory.includes(p.id));

    return filtered.map(mapProductFromDB);
  },

  /**
   * Get trending products
   */
  async getTrendingProducts(limit = 6): Promise<Product[]> {
    // Trending = Bestsellers or High Rating
    const { data, error } = await supabase
      .from('products')
      .select('*')
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
    const { data: currentProduct } = await supabase
      .from('products')
      .select('category')
      .eq('id', productId)
      .single();

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
      .select('*')
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
      .select('*')
      .in('id', mockWishlist);

    if (error) return [];

    return (data || []).map(mapProductFromDB);
  },
};
