
import { supabase } from '@/integrations/supabase/client';

/**
 * Media Service: Handles product images and videos following strictly
 * the production-grade architecture (Amazon/Flipkart style).
 * 
 * Rules:
 * 1. Storage bucket: 'product-media'
 * 2. Structure: product-media/{category}/{product_id}/{filename}
 * 3. Media is never shared between products.
 */

export const BUCKET_NAME = 'product-media';

export const mediaService = {
  /**
   * Generates the structured path for a media file
   */
  generatePath(category: string, productId: string, filename: string): string {
    const cleanCategory = category.toLowerCase().replace(/\s+/g, '_');
    return `${cleanCategory}/${productId}/${filename}`;
  },

  /**
   * Uploads a file to Supabase Storage and records it in product_media table
   */
  async uploadMedia(params: {
    productId: string;
    category: string;
    file: File;
    type: 'image' | 'video';
    isPrimary?: boolean;
  }) {
    const { productId, category, file, type, isPrimary = false } = params;
    
    // 1. Generate path: category/product_id/filename
    const fileExt = file.name.split('.').pop();
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const path = this.generatePath(category, productId, filename);

    // 2. Upload to Storage
    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file);

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      throw uploadError;
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    // 4. Record in product_media table
    const { data: mediaRecord, error: dbError } = await (supabase
      .from('product_media')
      .insert({
        product_id: productId,
        type: type,
        url: publicUrl,
        is_primary: isPrimary
      } as any)
      .select()
      .single() as any);

    if (dbError) {
      console.error('Database record creation failed:', dbError);
      throw dbError;
    }

    return mediaRecord;
  },

  /**
   * Sets a specific media as primary for a product
   */
  async setPrimary(productId: string, mediaId: string) {
    // 1. Remove primary status from all media for this product
    await (supabase
      .from('product_media')
      .update({ is_primary: false } as any)
      .eq('product_id', productId) as any);

    // 2. Set the new primary
    return (supabase
      .from('product_media')
      .update({ is_primary: true } as any)
      .eq('id', mediaId) as any);
  },

  /**
   * Deletes media from storage and database
   */
  async deleteMedia(mediaId: string, path: string) {
    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (storageError) console.warn('Storage deletion failed or file not found:', storageError);

    // 2. Delete from database
    return (supabase
      .from('product_media')
      .delete()
      .eq('id', mediaId) as any);
  }
};
