'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Blog,
  CreateBlogData,
} from '@/lib/adminApi';
import styles from './Blogs.module.css';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, totalViews: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState<CreateBlogData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    image_alt: '',
    category: '',
    related_product_ids: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    author_name: 'VedPutra Team',
    read_time_minutes: 5,
    is_published: false,
    is_featured: false,
  });

  // Separate state for product IDs input (allows free typing of commas)
  const [productIdsInput, setProductIdsInput] = useState('');

  useEffect(() => {
    loadBlogs();
    loadStats();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/blogs', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.blogs) {
        setBlogs(result.blogs);
      } else if (response.status === 401) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/blogs?action=stats', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleOpenModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        content: blog.content,
        featured_image: blog.featured_image || '',
        image_alt: blog.image_alt || '',
        category: blog.category || '',
        related_product_ids: blog.related_product_ids || [],
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        meta_keywords: blog.meta_keywords || '',
        og_title: blog.og_title || '',
        og_description: blog.og_description || '',
        author_name: blog.author_name || 'VedPutra Team',
        read_time_minutes: blog.read_time_minutes || 5,
        is_published: blog.is_published,
        is_featured: blog.is_featured,
      });
      // Initialize product IDs input string from array
      setProductIdsInput((blog.related_product_ids || []).join(', '));
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        image_alt: '',
        category: '',
        related_product_ids: [],
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_title: '',
        og_description: '',
        author_name: 'VedPutra Team',
        read_time_minutes: 5,
        is_published: false,
        is_featured: false,
      });
      // Clear product IDs input for new blog
      setProductIdsInput('');
    }
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setActiveTab('basic');
    setProductIdsInput(''); // Clear product IDs input when closing
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !editingBlog ? generateSlug(title) : prev.slug,
      meta_title: prev.meta_title || title,
      og_title: prev.og_title || title,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      alert('Please fill in all required fields (Title, Slug, Content)');
      return;
    }

    // Parse product IDs from input string
    const parsedProductIds = productIdsInput
      .split(',')
      .map(id => id.trim())
      .filter(id => id && !isNaN(Number(id))); // Only valid numbers

    // Update formData with parsed product IDs
    const submitData = {
      ...formData,
      related_product_ids: parsedProductIds
    };

    try {
      let response;
      
      if (editingBlog) {
        // Update existing blog
        response = await fetch('/api/admin/blogs', {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingBlog.id,
            action: 'update',
            blogData: submitData
          }),
        });
      } else {
        // Create new blog
        response = await fetch('/api/admin/blogs', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        alert(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
        handleCloseModal();
        loadBlogs();
        loadStats();
      } else {
        alert(`Error: ${result.error || 'Failed to save blog'}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog. Please try again.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} this blog?`)) {
      try {
        const response = await fetch('/api/admin/blogs', {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            action: 'toggleStatus',
            blogData: {
              is_published: !currentStatus
            }
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          loadBlogs();
          loadStats();
        } else {
          alert('Failed to update blog status: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error toggling status:', error);
        alert('Failed to update blog status');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/blogs?id=${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const result = await response.json();
        
        if (result.success) {
          alert('Blog deleted successfully!');
          loadBlogs();
          loadStats();
        } else {
          alert('Failed to delete blog: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog');
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || blog.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Wellness', 'Recipes', 'Lifestyle', 'Health Tips'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Blog Management</h1>
          <p>Create and manage SEO-optimized blog posts</p>
        </div>
        <button onClick={() => handleOpenModal()} className={styles.createBtn}>
          + Create New Blog
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Blogs</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.published}</div>
          <div className={styles.statLabel}>Published</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.draft}</div>
          <div className={styles.statLabel}>Drafts</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalViews}</div>
          <div className={styles.statLabel}>Total Views</div>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading blogs...</div>
      ) : (
        <div className={styles.blogsGrid}>
          {filteredBlogs.map(blog => (
            <div key={blog.id} className={styles.blogCard}>
              {blog.featured_image && (
                <div className={styles.blogImage}>
                  <Image
                    src={blog.featured_image}
                    alt={blog.image_alt || blog.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                  {blog.is_featured && <span className={styles.featuredBadge}>Featured</span>}
                </div>
              )}
              <div className={styles.blogContent}>
                <div className={styles.blogMeta}>
                  <span className={styles.category}>{blog.category || 'Uncategorized'}</span>
                  <span className={`${styles.status} ${blog.is_published ? styles.published : styles.draft}`}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className={styles.blogTitle}>{blog.title}</h3>
                <p className={styles.blogExcerpt}>{blog.excerpt || 'No excerpt available'}</p>
                <div className={styles.blogStats}>
                  <span>📅 {formatDate(blog.published_at)}</span>
                  <span>👁️ {blog.views_count} views</span>
                  <span>⏱️ {blog.read_time_minutes || 5} min read</span>
                </div>
              </div>
              <div className={styles.blogActions}>
                <button onClick={() => handleOpenModal(blog)} className={styles.editBtn}>
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(blog.id, blog.is_published)}
                  className={blog.is_published ? styles.unpublishBtn : styles.publishBtn}
                >
                  {blog.is_published ? '👁️‍🗨️ Unpublish' : '🌐 Publish'}
                </button>
                <button onClick={() => handleDelete(blog.id)} className={styles.deleteBtn}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'basic' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'content' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'seo' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('seo')}
              >
                SEO & Meta
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Products
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {activeTab === 'basic' && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      placeholder="Short summary of the blog..."
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Read Time (minutes)</label>
                      <input
                        type="number"
                        value={formData.read_time_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, read_time_minutes: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Featured Image URL</label>
                    <input
                      type="text"
                      value={formData.featured_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image Alt Text</label>
                    <input
                      type="text"
                      value={formData.image_alt}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                      placeholder="Describe the image for SEO"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Author Name</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                    />
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                      />
                      <span>Publish immediately</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      />
                      <span>Mark as featured</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Blog Content (HTML) *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={20}
                      placeholder="<h2>Your heading</h2><p>Your content...</p>"
                      required
                    />
                    <small>Use HTML tags for formatting: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</small>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Meta Title (60 chars max)</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                      maxLength={60}
                      placeholder="SEO title for search engines"
                    />
                    <small>{formData.meta_title?.length || 0}/60 characters</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Meta Description (160 chars max)</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                      maxLength={160}
                      rows={3}
                      placeholder="SEO description for search engines"
                    />
                    <small>{formData.meta_description?.length || 0}/160 characters</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Meta Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Open Graph Title (for social media)</label>
                    <input
                      type="text"
                      value={formData.og_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, og_title: e.target.value }))}
                      maxLength={60}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Open Graph Description</label>
                    <textarea
                      value={formData.og_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, og_description: e.target.value }))}
                      maxLength={160}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Related Product IDs (for ads in blog)</label>
                    <textarea
                      rows={3}
                      value={productIdsInput}
                      onChange={(e) => {
                        // Allow free typing - no processing, just store the raw value
                        setProductIdsInput(e.target.value);
                      }}
                      onBlur={(e) => {
                        // Optional: Validate on blur and show preview
                        // But don't restrict input
                      }}
                      placeholder="1, 2, 3, 4, 5"
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
                    />
                    <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                      ✏️ Enter product IDs separated by commas (e.g., 1, 2, 3, 4)
                      <br />
                      💡 These products will appear in the blog sidebar
                      <br />
                      {(() => {
                        const parsedIds = productIdsInput
                          .split(',')
                          .map(id => id.trim())
                          .filter(id => id && !isNaN(Number(id)));
                        return parsedIds.length > 0 ? (
                          <strong style={{ color: '#4A6741', marginTop: '4px', display: 'block' }}>
                            ✓ {parsedIds.length} product(s) will be shown: [{parsedIds.join(', ')}]
                          </strong>
                        ) : productIdsInput.length > 0 ? (
                          <span style={{ color: '#E74C3C', marginTop: '4px', display: 'block' }}>
                            ⚠️ Please enter valid product IDs (numbers only, separated by commas)
                          </span>
                        ) : null;
                      })()}
                    </small>
                  </div>
                  <div className={styles.infoBox}>
                    <p><strong>How it works:</strong></p>
                    <ul>
                      <li>Product ads will automatically appear in the blog sidebar</li>
                      <li>Up to 3 products will be displayed</li>
                      <li>Products must be active in your inventory</li>
                      <li>Example: For a Moringa blog, add product IDs "1, 2, 3"</li>
                    </ul>
                    <p><strong>💡 Tip:</strong> Go to Products section to find your product IDs</p>
                    <p><strong>✅ Comma Tip:</strong> You can freely type commas - they will be saved correctly!</p>
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

