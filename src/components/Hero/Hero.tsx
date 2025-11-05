'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';
import product1 from '@/img/product1.png';
import product2 from '@/img/product2.png';
import product3 from '@/img/product3.png';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(1); // Start at 1 because of cloned slides
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const products = [
    {
      id: 1,
      name: 'Moringa Leaf Powder',
      image: product1,
      alt: 'Moringa Leaf Powder Product',
    },
    {
      id: 2,
      name: 'Ashwagandha Powder',
      image: product2,
      alt: 'Ashwagandha Powder Product',
    },
    {
      id: 3,
      name: 'Tulsi Leaf Powder',
      image: product3,
      alt: 'Tulsi Leaf Powder Product',
    },
  ];

  const features = [
    {
      icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
      title: 'Free Shipping',
    },
    {
      icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
      title: 'Fast Delivery',
    },
    {
      icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
      title: 'Certified Organic',
    },
    {
      icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
      title: '24/7 Support',
    },
  ];

  // Create extended array with cloned first and last slides for infinite loop
  const extendedProducts = [
    products[products.length - 1], // Clone last
    ...products,
    products[0], // Clone first
  ];

  const handleNext = () => {
    if (!isTransitioning) return;
    setCurrentSlide((prev) => prev + 1);
  };

  // Auto-slide effect
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, currentSlide]);

  const handleTransitionEnd = () => {
    if (currentSlide >= extendedProducts.length - 1) {
      // Reset to first real slide (index 1) without transition
      setIsTransitioning(false);
      setCurrentSlide(1);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    } else if (currentSlide <= 0) {
      // Reset to last real slide without transition
      setIsTransitioning(false);
      setCurrentSlide(extendedProducts.length - 2);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    }
  };

  const handleIndicatorClick = (index: number) => {
    setIsTransitioning(true);
    setCurrentSlide(index + 1); // +1 because of cloned slide at start
  };

  const handleBuyNow = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsPaused(false);
    }, 2000); // Resume after 2 seconds
  };

  return (
    <section className={styles.hero} id="home">
      <div className="container">
        <div className={styles.heroContent}>
          {/* Text and Button Section - Left on Desktop */}
          <div className={styles.textSection}>
            <div className={styles.badge}>Farm to Home</div>
            <h1 className={styles.title}>
              Premium Organic <br />
              Farm Products
            </h1>
            <p className={styles.description}>
              Experience VedPutra Organics farm to home powders, ethically sourced and personally supervised by rohitgunthal.
              Every jar of moringa, beetroot, and roasted soyabean protein stays pure, potent, and sustainably produced for
              your wellness journey across India.
            </p>
            <button className={styles.buyNowBtn} onClick={handleBuyNow}>
              BUY NOW
            </button>
          </div>

          {/* Product Images Slider Section - Right on Desktop */}
          <div 
            className={styles.imageSection}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className={styles.sliderContainer}>
              <div 
                ref={sliderRef}
                className={styles.sliderTrack}
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: isTransitioning ? 'transform 0.6s ease-in-out' : 'none'
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extendedProducts.map((product, index) => (
                  <div key={`${product.id}-${index}`} className={styles.slide}>
                    <div className={styles.productImageWrapper}>
                      <Image
                        src={product.image}
                        alt={product.alt}
                        fill
                        className={styles.productImage}
                        style={{ objectFit: 'contain' }}
                        priority={index <= 2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Indicators */}
            <div className={styles.indicators}>
              {products.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    (currentSlide === index + 1) || 
                    (currentSlide === 0 && index === products.length - 1) ||
                    (currentSlide === extendedProducts.length - 1 && index === 0)
                      ? styles.indicatorActive 
                      : ''
                  }`}
                  onClick={() => handleIndicatorClick(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Features Section - Full Width Bottom */}
          <div className={styles.featuresSection}>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      {feature.icon}
                    </svg>
                  </div>
                  <div className={styles.featureTitle}>{feature.title}</div>
                </div>
              ))}
              {/* Duplicate for infinite scroll on mobile only */}
              {features.map((feature, index) => (
                <div key={`duplicate-${index}`} className={`${styles.featureCard} ${styles.featureCardDuplicate}`}>
                  <div className={styles.featureIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      {feature.icon}
                    </svg>
                  </div>
                  <div className={styles.featureTitle}>{feature.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
