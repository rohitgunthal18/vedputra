'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { getPublishedBlogs, PublicBlog } from '@/lib/api';
import styles from './Blogs.module.css';

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<PublicBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter(blog => blog.category === selectedCategory));
    }
  }, [selectedCategory, blogs]);

  const loadBlogs = async () => {
    const result = await getPublishedBlogs(); // Get all blogs
    if (result.success && result.blogs) {
      setBlogs(result.blogs);
      setFilteredBlogs(result.blogs);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category).filter(Boolean)))];

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
        <h1 className={styles.title}>Health & Wellness Blog</h1>
        <p className={styles.subtitle}>
          Discover VedPutra Organics tips, natural remedies, and AI-ready wellness insights curated by rohitgunthal to help you live a healthier life
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as string)}
              className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className={styles.empty}>
            <p>No articles found in this category.</p>
          </div>
        ) : (
        /* Blog Grid */
        <div className={styles.blogsGrid}>
          {filteredBlogs.map((blog) => (
            <Link 
              key={blog.id} 
              href={`/blog/${blog.slug}`}
              className={styles.blogCard}
            >
              <div className={styles.cardImage}>
                {blog.featured_image ? (
                  <Image
                    src={blog.featured_image}
                    alt={blog.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                ) : (
                  <div className={styles.placeholderImage} />
                )}
                <div className={styles.gradient} />
                {blog.category && (
                  <span className={styles.category}>{blog.category}</span>
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.meta}>
                  <span className={styles.date}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(blog.published_at)}
                  </span>
                  <span className={styles.readTime}>
                    {blog.read_time_minutes || 5} min read
                  </span>
                </div>

                <h2 className={styles.cardTitle}>{blog.title}</h2>
                <p className={styles.cardExcerpt}>{blog.excerpt || 'Read more to discover...'}</p>

                <div className={styles.cardFooter}>
                  <span className={styles.author}>
                    By {blog.author_name || 'VedPutra Team'}
                  </span>
                  <span className={styles.readMore}>
                    Read Article
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}

