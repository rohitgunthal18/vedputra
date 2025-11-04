'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { getActiveProducts } from '@/lib/api';
import ProductCard from './ProductCard';
import styles from './Products.module.css';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const result = await getActiveProducts();
    if (result.success && result.products) {
      setProducts(result.products);
    }
    setLoading(false);
  };

  return (
    <section className={styles.products} id="products">
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Premium Quality</div>
          <h2 className={styles.sectionTitle}>Our Products</h2>
          <p className={styles.sectionSubtitle}>
            Discover a curated collection of organic powders, ethically sourced and meticulously crafted.
          </p>
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className={styles.sectionCta}>
              <button className={styles.btnOutline}>VIEW ALL PRODUCTS</button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>No products available at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;

