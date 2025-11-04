'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import styles from './ProductImageSlider.module.css';

interface ProductImageSliderProps {
  images: (StaticImageData | string)[];
  productName: string;
}

const ProductImageSlider = ({ images, productName }: ProductImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If only one image, no need for slider
  if (images.length <= 1) {
    const singleImage = images[0];
    return (
      <div className={styles.singleImageWrapper}>
        {typeof singleImage === 'string' ? (
          <Image
            src={singleImage}
            alt={productName}
            fill
            sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
            className={styles.productImage}
            style={{ objectFit: 'contain' }}
            unoptimized={singleImage.startsWith('data:')}
          />
        ) : (
          <Image
            src={singleImage}
            alt={productName}
            fill
            sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
            className={styles.productImage}
            style={{ objectFit: 'contain' }}
            priority
          />
        )}
      </div>
    );
  }

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent Link
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent Link
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click from bubbling to parent Link
    setCurrentIndex(index);
  };

  return (
    <div className={styles.slider}>
      <div className={styles.sliderContainer}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
          >
            {typeof image === 'string' ? (
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                className={styles.productImage}
                style={{ objectFit: 'contain' }}
                unoptimized={image.startsWith('data:')}
              />
            ) : (
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                className={styles.productImage}
                style={{ objectFit: 'contain' }}
                priority={index === 0}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className={`${styles.navButton} ${styles.navPrev}`}
        onClick={handlePrevious}
        aria-label="Previous image"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${styles.navNext}`}
        onClick={handleNext}
        aria-label="Next image"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className={styles.dotsContainer}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            onClick={(e) => handleDotClick(index, e)}
            aria-label={`Go to image ${index + 1}`}
            type="button"
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className={styles.counter}>
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ProductImageSlider;

