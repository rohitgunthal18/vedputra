'use client';

import { products } from '@/data/products';
import ProductCard from './ProductCard';
import styles from './Products.module.css';

const Products = () => {
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
        
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className={styles.sectionCta}>
          <button className={styles.btnOutline}>VIEW ALL PRODUCTS</button>
        </div>
      </div>
    </section>
  );
};

export default Products;

