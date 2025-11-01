'use client';

import { blogPosts } from '@/data/products';
import styles from './Blog.module.css';

const Blog = () => {
  return (
    <section className={styles.blog} id="blog">
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>LATEST INSIGHTS</span>
          <h2 className={styles.title}>Health & Wellness Blog</h2>
          <p className={styles.subtitle}>Expert tips and knowledge about natural wellness</p>
        </div>

        <div className={styles.blogWrapper}>
          <div className={styles.blogGrid}>
            {blogPosts.map((post) => (
              <article key={post.id} className={styles.blogCard}>
                <div className={styles.cardTop}>
                  <div className={styles.imageContainer}>
                    <div className={styles.gradientOverlay} />
                    <span className={styles.category}>{post.category}</span>
                  </div>
                  <div className={styles.meta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{post.date}</span>
                    <span className={styles.dot}>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <a href="#" className={styles.readMore}>
                    Read Article
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.sectionCta}>
          <button className={styles.btnPrimary}>VIEW ALL ARTICLES</button>
        </div>
      </div>
    </section>
  );
};

export default Blog;

