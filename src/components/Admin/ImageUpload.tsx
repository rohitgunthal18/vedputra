'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { processImageFiles } from '@/lib/imageStorage';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  productId?: string;
}

const ImageUpload = ({ images, onImagesChange, maxImages = 4, productId }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(images);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total images
    if (previewImages.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }
      // Max 5MB per image - will be compressed automatically
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
    }

    setUploading(true);

    try {
      // Process images with compression
      const dataUrls = await processImageFiles(files);
      
      // Create preview images (use the compressed data URLs)
      const newPreviews = [...previewImages, ...dataUrls];
      setPreviewImages(newPreviews);
      
      // Add to images list
      const updatedImages = [...images, ...dataUrls];
      onImagesChange(updatedImages);
      
      console.log(`Successfully processed ${files.length} image(s)`);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again with smaller images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(updatedPreviews);
    onImagesChange(updatedImages);
  };

  const canAddMore = previewImages.length < maxImages;

  return (
    <div className={styles.imageUpload}>
      <div className={styles.imagesGrid}>
        {previewImages.map((image, index) => (
          <div key={index} className={styles.imagePreview}>
            <div className={styles.imageWrapper}>
              {image.startsWith('data:') || image.startsWith('blob:') || image.startsWith('http') ? (
                <Image
                  src={image}
                  alt={`Product ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <span>Image {index + 1}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemoveImage(index)}
              title="Remove image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {index === 0 && <span className={styles.primaryBadge}>Primary</span>}
          </div>
        ))}

        {canAddMore && (
          <div className={styles.uploadBox}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
              disabled={uploading}
            />
            <div className={styles.uploadContent}>
              {uploading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className={styles.uploadText}>
                    Click to upload
                    <br />
                    <small>JPG, PNG or WebP (Max 5MB each)</small>
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.uploadInfo}>
        <p>
          <strong>{previewImages.length}/{maxImages}</strong> images uploaded
          {previewImages.length === 0 && <span className={styles.required}> (Minimum 1 required)</span>}
        </p>
        <p className={styles.hint}>
          First image will be the primary product image.
          <br />
          <strong>Auto compression:</strong> Images are automatically compressed and optimized for best performance.
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
