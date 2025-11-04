'use client';

import { useEffect, useState } from 'react';
import ImageUpload from '@/components/Admin/ImageUpload';
import styles from './Products.module.css';

interface FAQ {
  question: string;
  answer: string;
}

interface NutritionFacts {
  calories?: string;
  protein?: string;
  carbs?: string;
  fats?: string;
  fiber?: string;
  [key: string]: string | undefined;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'benefits' | 'nutrition' | 'faq' | 'seo'>('basic');
  
  // Basic Info
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    description: '',
    long_description: '',
    price: '',
    weight: '',
    badge: '',
    stock_quantity: '',
    category: '',
    sku: '',
  });

  // Product Details
  const [productDetails, setProductDetails] = useState({
    ingredients: '',
    how_to_use: '',
    storage_instructions: '',
    shelf_life: '',
    serving_size: '',
    origin_country: '',
    manufacturing_process: '',
    safety_warnings: '',
  });

  // Benefits, Certifications, Suitable For (arrays)
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [certifications, setCertifications] = useState<string[]>(['']);
  const [suitableFor, setSuitableFor] = useState<string[]>(['']);

  // Nutrition Facts (object)
  const [nutritionFacts, setNutritionFacts] = useState<NutritionFacts>({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
  });

  // FAQ (array of objects)
  const [faq, setFaq] = useState<FAQ[]>([{ question: '', answer: '' }]);

  // SEO
  const [seoData, setSeoData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.products) {
        setProducts(result.products);
      } else if (response.status === 401) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      
      // Basic Info
      setFormData({
        product_id: product.product_id,
        name: product.name,
        description: product.description || '',
        long_description: product.long_description || '',
        price: product.price.toString(),
        weight: product.weight || '',
        badge: product.badge || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        category: product.category || '',
        sku: product.sku || '',
      });

      // Images
      const existingImages = product.images_json || product.image_urls || (product.image_url ? [product.image_url] : []);
      setProductImages(Array.isArray(existingImages) ? existingImages : []);

      // Product Details
      setProductDetails({
        ingredients: product.ingredients || '',
        how_to_use: product.how_to_use || '',
        storage_instructions: product.storage_instructions || '',
        shelf_life: product.shelf_life || '',
        serving_size: product.serving_size || '',
        origin_country: product.origin_country || '',
        manufacturing_process: product.manufacturing_process || '',
        safety_warnings: product.safety_warnings || '',
      });

      // Arrays
      setBenefits(product.benefits?.length > 0 ? product.benefits : ['']);
      setCertifications(product.certifications?.length > 0 ? product.certifications : ['']);
      setSuitableFor(product.suitable_for?.length > 0 ? product.suitable_for : ['']);

      // Nutrition
      setNutritionFacts(product.nutrition_facts || {
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        fiber: '',
      });

      // FAQ
      setFaq(product.faq?.length > 0 ? product.faq : [{ question: '', answer: '' }]);

      // SEO
      setSeoData({
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_keywords: product.meta_keywords || '',
      });
    } else {
      // Reset all fields
      setEditingProduct(null);
      setFormData({
        product_id: '',
        name: '',
        description: '',
        long_description: '',
        price: '',
        weight: '',
        badge: '',
        stock_quantity: '',
        category: '',
        sku: '',
      });
      setProductImages([]);
      setProductDetails({
        ingredients: '',
        how_to_use: '',
        storage_instructions: '',
        shelf_life: '',
        serving_size: '',
        origin_country: '',
        manufacturing_process: '',
        safety_warnings: '',
      });
      setBenefits(['']);
      setCertifications(['']);
      setSuitableFor(['']);
      setNutritionFacts({
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        fiber: '',
      });
      setFaq([{ question: '', answer: '' }]);
      setSeoData({
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
      });
    }
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate images
    if (productImages.length === 0) {
      alert('Please upload at least one product image');
      return;
    }
    
    // Check total image size
    const totalSize = productImages.reduce((sum, img) => sum + img.length, 0);
    const totalSizeKB = totalSize / 1024;
    
    if (totalSizeKB > 2048) { // 2MB limit
      alert('Total image size exceeds 2MB. Please use fewer or smaller images.');
      return;
    }

    // Filter out empty values from arrays
    const cleanBenefits = benefits.filter(b => b.trim() !== '');
    const cleanCertifications = certifications.filter(c => c.trim() !== '');
    const cleanSuitableFor = suitableFor.filter(s => s.trim() !== '');
    const cleanFaq = faq.filter(f => f.question.trim() !== '' && f.answer.trim() !== '');

    // Filter nutrition facts (remove empty)
    const cleanNutrition: NutritionFacts = {};
    Object.keys(nutritionFacts).forEach(key => {
      if (nutritionFacts[key]?.trim()) {
        cleanNutrition[key] = nutritionFacts[key];
      }
    });
    
    const productData = {
      product_id: formData.product_id,
      name: formData.name,
      description: formData.description,
      long_description: formData.long_description || undefined,
      price: parseFloat(formData.price),
      weight: formData.weight,
      badge: formData.badge || undefined,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      category: formData.category || undefined,
      sku: formData.sku || undefined,
      image_urls: productImages,
      
      // Product Details
      ingredients: productDetails.ingredients || undefined,
      how_to_use: productDetails.how_to_use || undefined,
      storage_instructions: productDetails.storage_instructions || undefined,
      shelf_life: productDetails.shelf_life || undefined,
      serving_size: productDetails.serving_size || undefined,
      origin_country: productDetails.origin_country || undefined,
      manufacturing_process: productDetails.manufacturing_process || undefined,
      safety_warnings: productDetails.safety_warnings || undefined,
      
      // Arrays (JSONB)
      benefits: cleanBenefits.length > 0 ? cleanBenefits : undefined,
      certifications: cleanCertifications.length > 0 ? cleanCertifications : undefined,
      suitable_for: cleanSuitableFor.length > 0 ? cleanSuitableFor : undefined,
      
      // Nutrition (JSONB)
      nutrition_facts: Object.keys(cleanNutrition).length > 0 ? cleanNutrition : undefined,
      
      // FAQ (JSONB)
      faq: cleanFaq.length > 0 ? cleanFaq : undefined,
      
      // SEO
      meta_title: seoData.meta_title || undefined,
      meta_description: seoData.meta_description || undefined,
      meta_keywords: seoData.meta_keywords || undefined,
    };

    console.log('Submitting product data:', productData);
    
    try {
      let response;
      
      if (editingProduct) {
        // Update existing product
        response = await fetch('/api/admin/products', {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingProduct.id,
            action: 'update',
            productData
          }),
        });
      } else {
        // Create new product
        response = await fetch('/api/admin/products', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      const result = await response.json();
      
      if (result.success) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowModal(false);
        loadProducts();
      } else {
        console.error('Failed to save product:', result.error);
        alert(`Failed to save product: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Product deleted successfully!');
        loadProducts();
      } else {
        alert('Failed to delete product: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'toggleStatus',
          productData: {
            is_active: !currentStatus
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadProducts();
      } else {
        alert('Failed to toggle product status: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle product status');
    }
  };

  // Array helpers
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  // FAQ helpers
  const addFaqItem = () => {
    setFaq(prev => [...prev, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    setFaq(prev => prev.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFaq(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading products...</div>
      </div>
    );
  }

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    lowStock: products.filter(p => p.stock_quantity < 10).length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Products Management</h1>
        <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
          Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Products</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.inactive}</div>
          <div className={styles.statLabel}>Inactive</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.lowStock}</div>
          <div className={styles.statLabel}>Low Stock</div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`${styles.productCard} ${!product.is_active ? styles.inactiveCard : ''}`}
          >
            {!product.is_active && (
              <div className={styles.inactiveOverlay}>
                <span>INACTIVE</span>
              </div>
            )}
            
            {product.badge && (
              <div className={`${styles.badge} ${styles[`badge${product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}`]}`}>
                {product.badge}
              </div>
            )}

            <div className={styles.productImage}>
              <img 
                src={(product.images_json || product.image_urls || [product.image_url])[0] || '/placeholder-product.svg'} 
                alt={product.name} 
              />
            </div>

            <div className={styles.productInfo}>
              <h3>{product.name}</h3>
              <p className={styles.productDesc}>{product.description}</p>
              <div className={styles.productMeta}>
                <span className={styles.price}>₹{product.price}</span>
                <span className={styles.weight}>{product.weight}</span>
              </div>
              <div className={styles.stockInfo}>
                <span className={`${styles.stockBadge} ${product.stock_quantity < 10 ? styles.lowStock : ''}`}>
                  Stock: {product.stock_quantity}
                </span>
              </div>
            </div>

            <div className={styles.productActions}>
              <button 
                className={styles.btnIcon}
                onClick={() => handleToggleStatus(product.id, product.is_active)}
                title={product.is_active ? 'Set Inactive' : 'Set Active'}
              >
                {product.is_active ? '👁️' : '🚫'}
              </button>
              <button 
                className={styles.btnIcon}
                onClick={() => handleOpenModal(product)}
                title="Edit"
              >
                ✏️
              </button>
              <button 
                className={styles.btnIcon}
                onClick={() => handleDelete(product.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'basic' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                📝 Basic Info
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('details')}
              >
                📋 Product Details
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'benefits' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('benefits')}
              >
                ✨ Benefits & Tags
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'nutrition' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('nutrition')}
              >
                🥗 Nutrition
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'faq' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('faq')}
              >
                ❓ FAQ
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'seo' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('seo')}
              >
                🔍 SEO
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              
              {/* TAB 1: Basic Info */}
              {activeTab === 'basic' && (
                <div className={styles.tabContent}>
                  {/* Product Images Upload */}
                  <div className={styles.formGroup}>
                    <label>Product Images * (Up to 4 images)</label>
                    <ImageUpload
                      images={productImages}
                      onImagesChange={setProductImages}
                      maxImages={4}
                      productId={formData.product_id}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Product ID *</label>
                      <input
                        type="text"
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                        placeholder="e.g., 4"
                        required
                        disabled={!!editingProduct}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g., MOR-100G"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Moringa Leaf Powder"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Short Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief product description (shown on cards)"
                      rows={2}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Long Description</label>
                    <textarea
                      value={formData.long_description}
                      onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                      placeholder="Detailed product description (shown on product page)"
                      rows={4}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g., 450"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Weight *</label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="e.g., 100g"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Organic Powders"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Badge</label>
                      <select
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      >
                        <option value="">None</option>
                        <option value="bestseller">Bestseller</option>
                        <option value="new">New</option>
                        <option value="organic">Organic</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Product Details */}
              {activeTab === 'details' && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Ingredients</label>
                    <textarea
                      value={productDetails.ingredients}
                      onChange={(e) => setProductDetails({ ...productDetails, ingredients: e.target.value })}
                      placeholder="List all ingredients..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>How to Use</label>
                    <textarea
                      value={productDetails.how_to_use}
                      onChange={(e) => setProductDetails({ ...productDetails, how_to_use: e.target.value })}
                      placeholder="Usage instructions..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Storage Instructions</label>
                    <textarea
                      value={productDetails.storage_instructions}
                      onChange={(e) => setProductDetails({ ...productDetails, storage_instructions: e.target.value })}
                      placeholder="How to store the product..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Shelf Life</label>
                      <input
                        type="text"
                        value={productDetails.shelf_life}
                        onChange={(e) => setProductDetails({ ...productDetails, shelf_life: e.target.value })}
                        placeholder="e.g., 12 months"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Serving Size</label>
                      <input
                        type="text"
                        value={productDetails.serving_size}
                        onChange={(e) => setProductDetails({ ...productDetails, serving_size: e.target.value })}
                        placeholder="e.g., 1 teaspoon"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Origin Country</label>
                      <input
                        type="text"
                        value={productDetails.origin_country}
                        onChange={(e) => setProductDetails({ ...productDetails, origin_country: e.target.value })}
                        placeholder="e.g., India"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Manufacturing Process</label>
                    <textarea
                      value={productDetails.manufacturing_process}
                      onChange={(e) => setProductDetails({ ...productDetails, manufacturing_process: e.target.value })}
                      placeholder="Describe the manufacturing process..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Safety Warnings</label>
                    <textarea
                      value={productDetails.safety_warnings}
                      onChange={(e) => setProductDetails({ ...productDetails, safety_warnings: e.target.value })}
                      placeholder="Any safety warnings or precautions..."
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Benefits & Tags */}
              {activeTab === 'benefits' && (
                <div className={styles.tabContent}>
                  <div className={styles.formGroup}>
                    <label>Benefits</label>
                    {benefits.map((benefit, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateArrayItem(setBenefits, index, e.target.value)}
                          placeholder="e.g., Boosts immunity"
                        />
                        {benefits.length > 1 && (
                          <button
                            type="button"
                            className={styles.btnRemove}
                            onClick={() => removeArrayItem(setBenefits, index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.btnAdd}
                      onClick={() => addArrayItem(setBenefits)}
                    >
                      + Add Benefit
                    </button>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Certifications</label>
                    {certifications.map((cert, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <input
                          type="text"
                          value={cert}
                          onChange={(e) => updateArrayItem(setCertifications, index, e.target.value)}
                          placeholder="e.g., USDA Organic"
                        />
                        {certifications.length > 1 && (
                          <button
                            type="button"
                            className={styles.btnRemove}
                            onClick={() => removeArrayItem(setCertifications, index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.btnAdd}
                      onClick={() => addArrayItem(setCertifications)}
                    >
                      + Add Certification
                    </button>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Suitable For</label>
                    {suitableFor.map((item, index) => (
                      <div key={index} className={styles.arrayItem}>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateArrayItem(setSuitableFor, index, e.target.value)}
                          placeholder="e.g., Vegetarians, Vegans"
                        />
                        {suitableFor.length > 1 && (
                          <button
                            type="button"
                            className={styles.btnRemove}
                            onClick={() => removeArrayItem(setSuitableFor, index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.btnAdd}
                      onClick={() => addArrayItem(setSuitableFor)}
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Nutrition */}
              {activeTab === 'nutrition' && (
                <div className={styles.tabContent}>
                  <p className={styles.tabNote}>Add nutritional information per serving</p>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Calories</label>
                      <input
                        type="text"
                        value={nutritionFacts.calories || ''}
                        onChange={(e) => setNutritionFacts({ ...nutritionFacts, calories: e.target.value })}
                        placeholder="e.g., 50 kcal"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Protein</label>
                      <input
                        type="text"
                        value={nutritionFacts.protein || ''}
                        onChange={(e) => setNutritionFacts({ ...nutritionFacts, protein: e.target.value })}
                        placeholder="e.g., 2g"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Carbohydrates</label>
                      <input
                        type="text"
                        value={nutritionFacts.carbs || ''}
                        onChange={(e) => setNutritionFacts({ ...nutritionFacts, carbs: e.target.value })}
                        placeholder="e.g., 8g"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Fats</label>
                      <input
                        type="text"
                        value={nutritionFacts.fats || ''}
                        onChange={(e) => setNutritionFacts({ ...nutritionFacts, fats: e.target.value })}
                        placeholder="e.g., 1g"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Fiber</label>
                    <input
                      type="text"
                      value={nutritionFacts.fiber || ''}
                      onChange={(e) => setNutritionFacts({ ...nutritionFacts, fiber: e.target.value })}
                      placeholder="e.g., 3g"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: FAQ */}
              {activeTab === 'faq' && (
                <div className={styles.tabContent}>
                  {faq.map((item, index) => (
                    <div key={index} className={styles.faqItem}>
                      <div className={styles.faqHeader}>
                        <h4>FAQ #{index + 1}</h4>
                        {faq.length > 1 && (
                          <button
                            type="button"
                            className={styles.btnRemove}
                            onClick={() => removeFaqItem(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Question</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="e.g., How do I use this product?"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Answer</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                          placeholder="Provide a detailed answer..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.btnAdd}
                    onClick={addFaqItem}
                  >
                    + Add FAQ
                  </button>
                </div>
              )}

              {/* TAB 6: SEO */}
              {activeTab === 'seo' && (
                <div className={styles.tabContent}>
                  <p className={styles.tabNote}>Optimize for search engines</p>
                  
                  <div className={styles.formGroup}>
                    <label>Meta Title</label>
                    <input
                      type="text"
                      value={seoData.meta_title}
                      onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                      placeholder="e.g., Buy Organic Moringa Powder - Best Quality"
                      maxLength={60}
                    />
                    <small>{seoData.meta_title.length}/60 characters</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Meta Description</label>
                    <textarea
                      value={seoData.meta_description}
                      onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                      placeholder="Brief description for search results (150-160 characters)"
                      rows={3}
                      maxLength={160}
                    />
                    <small>{seoData.meta_description.length}/160 characters</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Meta Keywords</label>
                    <input
                      type="text"
                      value={seoData.meta_keywords}
                      onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                      placeholder="moringa, organic powder, superfood, health"
                    />
                    <small>Comma-separated keywords</small>
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
