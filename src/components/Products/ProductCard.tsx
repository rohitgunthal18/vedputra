'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductImageSlider from './ProductImageSlider';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addToCart } = useCart();
  const badgeClass = product.badge === 'new' ? styles.badgeNew : product.badge === 'organic' ? styles.badgeOrganic : '';
  
  // Check if product is out of stock
  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // Ensure component is mounted before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    const maxQuantity = isOutOfStock ? 0 : Math.min(99, product.stock_quantity || 99);
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    // Prevent adding out-of-stock products
    if (isOutOfStock) {
      alert('This product is currently out of stock.');
      return;
    }
    
    // Check if requested quantity exceeds available stock
    if (product.stock_quantity !== undefined && quantity > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} items available in stock.`);
      return;
    }
    
    addToCart(product, quantity);
    setShowToast(true);
    setQuantity(1); // Reset quantity after adding to cart
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Render stars based on actual rating
  const renderStars = () => {
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '⯨'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  return (
    <>
      <div className={`${styles.productCard} ${isOutOfStock ? styles.outOfStockCard : ''}`}>
        {isOutOfStock && (
          <div className={styles.outOfStockBadge}>
            OUT OF STOCK
          </div>
        )}
        
        {product.badge && !isOutOfStock && (
          <div className={`${styles.productBadge} ${badgeClass}`}>
            {product.badge}
          </div>
        )}
        
        <Link href={`/product/${product.id}`} className={styles.productImageWrapper}>
          {product.images && product.images.length > 0 ? (
            // Use slider for multiple images
            <ProductImageSlider images={product.images} productName={product.name} />
          ) : typeof product.image === 'string' ? (
            // Single URL string from database
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
              className={styles.productImage}
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          ) : (
            // Single static imported image
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
              className={styles.productImage}
              style={{ objectFit: 'contain' }}
              priority
            />
          )}
        </Link>
        
        <div className={styles.productInfo}>
          <div className={styles.productRating}>
            <span className={styles.stars}>{renderStars()}</span>
            <span className={styles.reviews}>
              {product.rating ? `${product.rating.toFixed(1)} (${product.reviews})` : `(${product.reviews})`}
            </span>
          </div>
          <Link href={`/product/${product.id}`} className={styles.productNameLink}>
            <h3 className={styles.productName}>{product.name}</h3>
          </Link>
          <p className={styles.productDescription}>{product.description}</p>
          <div className={styles.productFooter}>
            <p className={styles.productPrice}>
              ₹{product.price} <span className={styles.productWeight}>/ {product.weight}</span>
            </p>
            <div className={styles.actions}>
              {isOutOfStock ? (
                <button className={styles.btnOutOfStock} disabled>
                  Out of Stock
                </button>
              ) : (
                <>
                  <div className={styles.quantitySelector}>
                    <button 
                      className={styles.quantityBtn} 
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button 
                      className={styles.quantityBtn} 
                      onClick={handleIncrease}
                      disabled={quantity >= Math.min(99, product.stock_quantity || 99)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className={styles.btnAddCart} 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {mounted && showToast && createPortal(
        <div className={styles.toast}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Added to cart!</span>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductCard;
