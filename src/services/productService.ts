import { Product, Review } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Mock product data - kept as fallback or reference (empty to enforce DB usage)
export const mockProducts: Product[] = [];

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
  const media = (data.product_media_mapping || []).map((mapping: any) => {
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
  let images = media.filter((m: any) => m.type === 'image').map((m: any) => m.url);
  
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
    attributes: data.attributes || { features: [], links: [] },
  };
};

// Categories - Matching the primary ones in seed.sql
export const categories = [
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt' },
  { id: 'home', name: 'Home', icon: 'Home' },
  { id: 'appliances', name: 'Appliances', icon: 'Tv' },
  { id: 'grocery', name: 'Grocery', icon: 'ShoppingBasket' },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles' },
  { id: 'toys', name: 'Toys', icon: 'Gamepad2' },
  { id: 'books', name: 'Books', icon: 'Book' },
  { id: 'mobiles', name: 'Mobiles', icon: 'Smartphone' },
  { id: 'laptops', name: 'Laptops', icon: 'Laptop' },
  { id: 'footwear', name: 'Footwear', icon: 'Footprints' },
  { id: 'kitchen', name: 'Kitchen', icon: 'Utensils' },
  { id: 'jewelry', name: 'Jewelry', icon: 'Gem' },
  { id: 'sports', name: 'Sports', icon: 'Trophy' },
  { id: 'travel', name: 'Travel', icon: 'Plane' },
  { id: 'decor', name: 'Decor', icon: 'Palette' },
];

// Product Service - Real Supabase API functions
export const productService = {
  // Get all products
  async getProducts(filters?: {
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  }): Promise<Product[]> {
    // For listing pages, we fetch the primary image through a left join
    let query = supabase.from('products').select(`
      *,
      product_media_mapping(
        is_primary,
        media_assets(url, asset_type)
      )
    `);

    if (filters?.category) {
      query = query.or(`category.ilike.%${filters.category}%,subcategory.ilike.%${filters.category}%`);
    }

    if (filters?.subcategory) {
      query = query.ilike('subcategory', filters.subcategory);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      // Find the designated primary mapping, fallback to first if none marked primary
      const mappings = item.product_media_mapping || [];
      const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
      const primaryAsset = primaryMapping?.media_assets;
      
      // Pass the extracted primary asset to mapProductFromDB
      return mapProductFromDB({
        ...item,
        // Override images with the specific primary asset if found, 
        // fallback to the existing images array if not
        images: primaryAsset ? [primaryAsset.url] : (item.images || [])
      });
    });
  },


  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    // For detail page, we fetch ALL media (Images + Videos)
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(*, media_assets(*))')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }

    return data ? mapProductFromDB(data) : null;
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(is_primary, media_assets(url, asset_type))')
      .eq('featured', true)
      .limit(8);

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      const mappings = item.product_media_mapping || [];
      const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
      const primaryAsset = primaryMapping?.media_assets;
      return mapProductFromDB({ ...item, images: primaryAsset ? [primaryAsset.url] : (item.images || []) });
    });
  },

  // Get bestsellers
  async getBestsellers(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(is_primary, media_assets(url, asset_type))')
      .eq('bestseller', true)
      .limit(8);

    if (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      const mappings = item.product_media_mapping || [];
      const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
      const primaryAsset = primaryMapping?.media_assets;
      return mapProductFromDB({ ...item, images: primaryAsset ? [primaryAsset.url] : (item.images || []) });
    });
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(is_primary, media_assets(url, asset_type))')
      .ilike('category', category);

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      const mappings = item.product_media_mapping || [];
      const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
      const primaryAsset = primaryMapping?.media_assets;
      return mapProductFromDB({ ...item, images: primaryAsset ? [primaryAsset.url] : (item.images || []) });
    });
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(is_primary, media_assets(url, asset_type))')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      const mappings = item.product_media_mapping || [];
      const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
      const primaryAsset = primaryMapping?.media_assets;
      return mapProductFromDB({ ...item, images: primaryAsset ? [primaryAsset.url] : (item.images || []) });
    });
  },

  // Get deals of the day
  async getDealsOfTheDay(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_media_mapping(is_primary, media_assets(url, asset_type))')
      .eq('deal_of_the_day', true)
      .limit(8);

    if (error) {
      console.error('Error fetching deals of the day:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      const mappings = item.product_media_mapping || [];
      const primaryMapping = mappings.find((m: any) => m.is_primary) || mappings[0];
      const primaryAsset = primaryMapping?.media_assets;
      return mapProductFromDB({ ...item, images: primaryAsset ? [primaryAsset.url] : (item.images || []) });
    });
  },

  // Get categories (could be dynamic too, but static is fine for now)
  async getCategories(): Promise<typeof categories> {
    return categories;
  },

  // Get reviews for a product
  async getReviewsByProductId(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name || 'Anonymous',
      rating: r.rating || 0,
      comment: r.comment || '',
      createdAt: r.created_at,
    }));
  },

  // Submit a review
  async submitReview(review: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<boolean> {
    const { error } = await supabase.from('reviews').insert({
      product_id: review.productId,
      user_id: review.userId,
      user_name: review.userName,
      rating: review.rating,
      comment: review.comment,
    } as any);

    if (error) {
      console.error('Error submitting review:', error);
      return false;
    }

    // Pro-tip: In a real app, you'd use a Supabase Function or Trigger to update 
    // the product rating average. Here we'll just return true.
    return true;
  },
};
