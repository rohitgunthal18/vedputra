/**
 * Image Storage Utilities
 * Handles image data processing for database storage
 */

/**
 * Compress image by converting to JPEG with quality setting
 * Returns base64 data URL optimized for database storage
 * Target: Small size suitable for PostgreSQL JSONB storage
 */
export async function compressImageAsDataURL(file: File, maxWidth: number = 600, quality: number = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const img = new window.Image();
      
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions - aggressive resize for database storage
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = (height / width) * maxWidth;
              width = maxWidth;
            } else {
              width = (width / height) * maxWidth;
              height = maxWidth;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Fill white background for transparency handling
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG data URL with compression
          // Target: Keep under 100KB for database storage
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Progressive compression if needed
          let currentQuality = quality;
          const targetSize = 100 * 1024; // 100KB target
          
          while (dataUrl.length > targetSize && currentQuality > 0.1) {
            currentQuality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          }
          
          // If still too large, reduce dimensions further
          if (dataUrl.length > targetSize && width > 400) {
            const scale = 400 / width;
            canvas.width = width * scale;
            canvas.height = height * scale;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          }
          
          console.log(`Compressed image: ${(file.size / 1024).toFixed(0)}KB → ${(dataUrl.length / 1024).toFixed(0)}KB`);
          resolve(dataUrl);
        } catch (error) {
          console.error('Compression error:', error);
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Process multiple files with compression
 * Returns array of data URLs optimized for database storage
 */
export async function processImageFiles(files: File[]): Promise<string[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        // Always compress for database storage to ensure consistent size
        console.log(`Processing ${file.name} (${(file.size / 1024).toFixed(0)}KB)...`);
        const compressed = await compressImageAsDataURL(file);
        
        // Validate result size
        if (compressed.length > 500 * 1024) { // 500KB limit
          console.warn(`Image still large after compression: ${(compressed.length / 1024).toFixed(0)}KB`);
          // Try more aggressive compression
          const recompressed = await compressImageAsDataURL(file, 400, 0.3);
          console.log(`Recompressed to ${(recompressed.length / 1024).toFixed(0)}KB`);
          return recompressed;
        }
        
        return compressed;
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })
  );
  
  return results;
}

/**
 * Check if data URL is too large for database
 * PostgreSQL has a max row size limit
 */
export function isDataURLTooLarge(dataUrl: string): boolean {
  // Rough estimate: PostgreSQL may have issues with very large text fields
  // Keep data URLs under 1MB to be safe
  return dataUrl.length > 1 * 1024 * 1024;
}

/**
 * Get estimated size of data URL
 */
export function getDataURLSize(dataUrl: string): string {
  const kb = dataUrl.length / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(0)}KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)}MB`;
}

