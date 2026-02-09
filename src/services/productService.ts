import { Product, Review } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Mock product data - kept as fallback or reference (empty to enforce DB usage)
export const mockProducts: Product[] = [];

// Helper to map DB result to Product type
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
  sizes: data.sizes || [],
  colors: data.colors || [],
  dealOfTheDay: data.deal_of_the_day,
  dealExpiresAt: data.deal_expires_at,
});

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
    let query = supabase.from('products').select('*');

    if (filters?.category) {
      // Check if it matches category OR subcategory to be flexible
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
      // Default sort
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  },

  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
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
      .select('*')
      .eq('featured', true)
      .limit(8);

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  },

  // Get bestsellers
  async getBestsellers(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('bestseller', true)
      .limit(8);

    if (error) {
      console.error('Error fetching bestsellers:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', category);

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
  },

  // Get deals of the day
  async getDealsOfTheDay(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('deal_of_the_day', true)
      .limit(8);

    if (error) {
      console.error('Error fetching deals of the day:', error);
      return [];
    }

    return (data || []).map(mapProductFromDB);
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

    return (data || []).map(r => ({
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
