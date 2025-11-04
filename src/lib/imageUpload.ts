/**
 * Image Upload Utilities for Supabase Storage
 * Handles product image uploads to Supabase Storage bucket
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Initialize storage bucket (call once)
 */
export async function initializeStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create public bucket
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return { success: false, error };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing bucket:', error);
    return { success: false, error };
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Use JPG, PNG, or WebP' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Max 5MB' };
  }

  return { valid: true };
}

/**
 * Upload product image to Supabase Storage
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${productId}_${timestamp}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload multiple product images
 */
export async function uploadProductImages(
  files: File[],
  productId: string
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
  if (files.length === 0) {
    return { success: false, errors: ['No files provided'] };
  }

  if (files.length > 4) {
    return { success: false, errors: ['Maximum 4 images allowed'] };
  }

  const results = await Promise.all(
    files.map(file => uploadProductImage(file, productId))
  );

  const urls = results.filter(r => r.success).map(r => r.url!);
  const errors = results.filter(r => !r.success).map(r => r.error!);

  if (urls.length === 0) {
    return { success: false, errors };
  }

  return { success: true, urls, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Delete product image from storage
 */
export async function deleteProductImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('products')).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Supabase Storage public URL
 */
export function getStoragePublicUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

