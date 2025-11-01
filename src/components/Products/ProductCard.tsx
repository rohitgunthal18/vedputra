'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const { addToCart } = useCart();
  const badgeClass = product.badge === 'new' ? styles.badgeNew : product.badge === 'organic' ? styles.badgeOrganic : '';

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowToast(true);
    setQuantity(1); // Reset quantity after adding to cart
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className={styles.productCard}>
      {product.badge && (
        <div className={`${styles.productBadge} ${badgeClass}`}>
          {product.badge}
        </div>
      )}
      
      <div className={styles.productImageWrapper}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={styles.productImage}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      
      <div className={styles.productInfo}>
        <div className={styles.productRating}>
          <span className={styles.stars}>★★★★★</span>
          <span className={styles.reviews}>({product.reviews})</span>
        </div>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productDescription}>{product.description}</p>
        <div className={styles.productFooter}>
          <p className={styles.productPrice}>
            ₹{product.price} <span className={styles.productWeight}>/ {product.weight}</span>
          </p>
          <div className={styles.actions}>
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
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
            <button className={styles.btnAddCart} onClick={handleAddToCart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {showToast && (
        <div className={styles.toast}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Added to cart!</span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
