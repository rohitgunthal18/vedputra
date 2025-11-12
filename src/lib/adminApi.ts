/**
 * Admin API Functions
 * Handles all admin dashboard operations
 */

import { supabase } from './supabase';

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

export interface Product {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  rating: number;
  reviews: number;
  badge: string | null;
  image_url: string | null;
  is_active: boolean;
  stock_quantity: number;
  sku: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  product_id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  image_url?: string;
  stock_quantity?: number;
  sku?: string;
  category?: string;
}

export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, products: data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error };
  }
}

export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, product: data };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error };
  }
}

export async function createProduct(productData: CreateProductData | any) {
  try {
    // Validate image data before insertion
    if (productData.image_urls && Array.isArray(productData.image_urls)) {
      // Check if images are too large
      const totalSize = productData.image_urls.reduce((sum: number, img: string) => sum + img.length, 0);
      console.log(`Total image data size: ${(totalSize / 1024).toFixed(0)}KB for ${productData.image_urls.length} images`);
      
      if (totalSize > 2 * 1024 * 1024) { // 2MB total limit
        console.warn('Image data exceeds recommended size, consider using external image hosting');
      }
    }

    // Prepare data for insertion - ALL FIELDS
    const insertData: any = {
      // Basic Info
      product_id: productData.product_id,
      name: productData.name,
      description: productData.description,
      long_description: productData.long_description || null,
      price: productData.price,
      weight: productData.weight,
      rating: productData.rating || 5.0,
      reviews: productData.reviews || 0,
      badge: productData.badge || null,
      stock_quantity: productData.stock_quantity || 0,
      sku: productData.sku || null,
      category: productData.category || null,
      is_active: true,
      
      // Product Details
      ingredients: productData.ingredients || null,
      how_to_use: productData.how_to_use || null,
      storage_instructions: productData.storage_instructions || null,
      shelf_life: productData.shelf_life || null,
      serving_size: productData.serving_size || null,
      origin_country: productData.origin_country || null,
      manufacturing_process: productData.manufacturing_process || null,
      safety_warnings: productData.safety_warnings || null,
      
      // Arrays (JSONB)
      benefits: productData.benefits || null,
      certifications: productData.certifications || null,
      suitable_for: productData.suitable_for || null,
      
      // Nutrition (JSONB)
      nutrition_facts: productData.nutrition_facts || null,
      
      // FAQ (JSONB)
      faq: productData.faq || null,
      
      // SEO
      meta_title: productData.meta_title || null,
      meta_description: productData.meta_description || null,
      meta_keywords: productData.meta_keywords || null,
    };

    // Handle images - store in JSONB for better handling of large data
    if (productData.image_urls && Array.isArray(productData.image_urls) && productData.image_urls.length > 0) {
      insertData.image_url = productData.image_urls[0]; // Primary image
      insertData.images_json = productData.image_urls; // All images in JSONB
      // Don't use TEXT[] array to avoid PostgreSQL array element size limits
      insertData.image_urls = null;
    } else if (productData.image_url) {
      insertData.image_url = productData.image_url;
      insertData.images_json = [productData.image_url];
      insertData.image_urls = null;
    }
    
    console.log('Inserting product with all fields:', Object.keys(insertData));

    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    
    console.log('Product created successfully:', data?.id);
    return { success: true, product: data };
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Provide more specific error message
    let errorMessage = 'Failed to create product';
    if (error?.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error?.code === '22001') {
      errorMessage = 'Image data too large. Please use smaller images or external hosting.';
    }
    
    return { success: false, error, message: errorMessage };
  }
}

export async function updateProduct(id: string, productData: Partial<CreateProductData> | any) {
  try {
    // Build update object with ALL valid database fields
    const updateData: any = {};
    
    // Basic Info
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.long_description !== undefined) updateData.long_description = productData.long_description || null;
    if (productData.price !== undefined) updateData.price = productData.price;
    if (productData.weight !== undefined) updateData.weight = productData.weight;
    if (productData.rating !== undefined) updateData.rating = productData.rating;
    if (productData.reviews !== undefined) updateData.reviews = productData.reviews;
    if (productData.badge !== undefined) updateData.badge = productData.badge || null;
    if (productData.stock_quantity !== undefined) updateData.stock_quantity = productData.stock_quantity;
    if (productData.sku !== undefined) updateData.sku = productData.sku || null;
    if (productData.category !== undefined) updateData.category = productData.category || null;

    // Product Details
    if (productData.ingredients !== undefined) updateData.ingredients = productData.ingredients || null;
    if (productData.how_to_use !== undefined) updateData.how_to_use = productData.how_to_use || null;
    if (productData.storage_instructions !== undefined) updateData.storage_instructions = productData.storage_instructions || null;
    if (productData.shelf_life !== undefined) updateData.shelf_life = productData.shelf_life || null;
    if (productData.serving_size !== undefined) updateData.serving_size = productData.serving_size || null;
    if (productData.origin_country !== undefined) updateData.origin_country = productData.origin_country || null;
    if (productData.manufacturing_process !== undefined) updateData.manufacturing_process = productData.manufacturing_process || null;
    if (productData.safety_warnings !== undefined) updateData.safety_warnings = productData.safety_warnings || null;
    
    // Arrays (JSONB)
    if (productData.benefits !== undefined) updateData.benefits = productData.benefits || null;
    if (productData.certifications !== undefined) updateData.certifications = productData.certifications || null;
    if (productData.suitable_for !== undefined) updateData.suitable_for = productData.suitable_for || null;
    
    // Nutrition (JSONB)
    if (productData.nutrition_facts !== undefined) updateData.nutrition_facts = productData.nutrition_facts || null;
    
    // FAQ (JSONB)
    if (productData.faq !== undefined) updateData.faq = productData.faq || null;
    
    // SEO
    if (productData.meta_title !== undefined) updateData.meta_title = productData.meta_title || null;
    if (productData.meta_description !== undefined) updateData.meta_description = productData.meta_description || null;
    if (productData.meta_keywords !== undefined) updateData.meta_keywords = productData.meta_keywords || null;

    // Handle images - store in JSONB for better handling of large data
    if (productData.image_urls && Array.isArray(productData.image_urls) && productData.image_urls.length > 0) {
      const totalSize = productData.image_urls.reduce((sum: number, img: string) => sum + img.length, 0);
      console.log(`Updating product with ${productData.image_urls.length} images (${(totalSize / 1024).toFixed(0)}KB total)`);
      
      updateData.image_url = productData.image_urls[0]; // Primary image
      updateData.images_json = productData.image_urls; // All images in JSONB
      // Don't use TEXT[] array to avoid PostgreSQL array element size limits
      updateData.image_urls = null;
    } else if (productData.image_url !== undefined) {
      updateData.image_url = productData.image_url;
      if (productData.image_url) {
        updateData.images_json = [productData.image_url];
      }
      updateData.image_urls = null;
    }
    
    console.log('Updating product with fields:', Object.keys(updateData));

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    
    console.log('Product updated successfully:', data?.id);
    return { success: true, product: data };
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    // Provide more specific error message
    let errorMessage = 'Failed to update product';
    if (error?.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error?.code === '22001') {
      errorMessage = 'Image data too large. Please use smaller images or external hosting.';
    }
    
    return { success: false, error, message: errorMessage };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, product: data };
  } catch (error) {
    console.error('Error toggling product status:', error);
    return { success: false, error };
  }
}

// ============================================
// ADMIN DASHBOARD STATISTICS
// ============================================

export async function getAdminDashboardStats() {
  try {
    // Get orders statistics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, order_status, payment_method, created_at');

    if (ordersError) throw ordersError;

    // Get contact messages statistics
    const { data: messages, error: messagesError } = await supabase
      .from('contact_messages')
      .select('status');

    if (messagesError) throw messagesError;

    // Get promotion coupons statistics
    const { data: coupons, error: couponsError } = await supabase
      .from('promotion_coupons')
      .select('is_used, expires_at');

    if (couponsError) throw couponsError;

    // Get products statistics
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('is_active, stock_quantity');

    if (productsError) throw productsError;

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;
    const pendingOrders = orders?.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length || 0;
    const completedOrders = orders?.filter(o => o.order_status === 'delivered').length || 0;
    const codOrders = orders?.filter(o => o.payment_method === 'cod').length || 0;
    const onlineOrders = orders?.filter(o => o.payment_method === 'online').length || 0;

    const newMessages = messages?.filter(m => m.status === 'new').length || 0;
    const totalMessages = messages?.length || 0;

    const activeCoupons = coupons?.filter(c => !c.is_used && new Date(c.expires_at) > new Date()).length || 0;
    const usedCoupons = coupons?.filter(c => c.is_used).length || 0;
    const totalCoupons = coupons?.length || 0;

    const activeProducts = products?.filter(p => p.is_active).length || 0;
    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock_quantity < 10).length || 0;

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders?.filter(o => new Date(o.created_at) >= today).length || 0;

    // Get this month's revenue
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthlyRevenue = orders?.filter(o => new Date(o.created_at) >= thisMonth)
      .reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;

    return {
      success: true,
      stats: {
        // Orders
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        codOrders,
        onlineOrders,
        
        // Revenue
        totalRevenue,
        monthlyRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        
        // Messages
        totalMessages,
        newMessages,
        
        // Coupons
        totalCoupons,
        activeCoupons,
        usedCoupons,
        couponUsageRate: totalCoupons > 0 ? (usedCoupons / totalCoupons) * 100 : 0,
        
        // Products
        totalProducts,
        activeProducts,
        lowStockProducts,
      },
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return { success: false, error };
  }
}

// ============================================
// RECENT ACTIVITY
// ============================================

export async function getRecentOrders(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, orders: data };
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return { success: false, error };
  }
}

export async function getRecentMessages(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, messages: data };
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return { success: false, error };
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getSalesAnalytics(days: number = 30) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount, order_status')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const salesByDate = data?.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += parseFloat(order.total_amount.toString());
      acc[date].orders += 1;
      return acc;
    }, {});

    return { success: true, analytics: Object.values(salesByDate || {}) };
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return { success: false, error };
  }
}

export async function getTopSellingProducts(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_name, quantity, total_price');

    if (error) throw error;

    // Aggregate products
    const productSales = data?.reduce((acc: any, item) => {
      if (!acc[item.product_name]) {
        acc[item.product_name] = {
          name: item.product_name,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      acc[item.product_name].totalQuantity += item.quantity;
      acc[item.product_name].totalRevenue += parseFloat(item.total_price.toString());
      return acc;
    }, {});

    const topProducts = Object.values(productSales || {})
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return { success: true, products: topProducts };
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return { success: false, error };
  }
}

// ============================================
// ORDER STATUS UPDATE
// ============================================

export async function updateOrderStatusAdmin(orderId: string, newStatus: string, notes?: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Add to status history if notes provided
    if (notes) {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: data.id,
          old_status: data.order_status,
          new_status: newStatus,
          changed_by: 'admin',
          notes: notes,
        });
    }

    return { success: true, order: data };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error };
  }
}

export async function updateOrderTracking(orderId: string, trackingNumber: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, order: data };
  } catch (error) {
    console.error('Error updating tracking number:', error);
    return { success: false, error };
  }
}

// ============================================
// BULK EXPORT FUNCTIONS
// ============================================

export function exportOrdersToCSV(orders: any[]) {
  try {
    // CSV Headers
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Mobile',
      'Email',
      'City',
      'State',
      'Pincode',
      'Items Count',
      'Subtotal',
      'Shipping',
      'Discount',
      'Coupon Code',
      'Total Amount',
      'Payment Method',
      'Status',
      'Tracking Number'
    ];

    // Convert orders to CSV rows
    const rows = orders.map(order => [
      order.order_id,
      new Date(order.created_at).toLocaleDateString(),
      order.customer_name,
      order.customer_mobile,
      order.customer_email || '',
      order.shipping_city,
      order.shipping_state,
      order.shipping_pincode,
      order.order_items?.length || 0,
      parseFloat(order.subtotal).toFixed(2),
      parseFloat(order.shipping_charge || 0).toFixed(2),
      parseFloat(order.discount || 0).toFixed(2),
      order.coupon_code || '',
      parseFloat(order.total_amount).toFixed(2),
      order.payment_method.toUpperCase(),
      order.order_status.toUpperCase(),
      order.tracking_number || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('Error exporting orders to CSV:', error);
    return { success: false, error };
  }
}

// ============================================
// COUPONS MANAGEMENT
// ============================================

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount: number | null;
  min_order_value: number;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount?: number;
  min_order_value?: number;
  usage_limit?: number;
  expires_at?: string;
}

export async function getAllCoupons() {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, coupons: data };
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return { success: false, error };
  }
}

export async function createCoupon(couponData: CreateCouponData) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: couponData.code.toUpperCase(),
        description: couponData.description || null,
        discount_type: couponData.discount_type,
        discount_value: couponData.discount_value,
        max_discount: couponData.max_discount || null,
        min_order_value: couponData.min_order_value || 0,
        usage_limit: couponData.usage_limit || null,
        expires_at: couponData.expires_at || null,
        is_active: true,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, coupon: data };
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return { success: false, error, message: error.message || 'Failed to create coupon' };
  }
}

export async function updateCoupon(id: string, couponData: Partial<CreateCouponData> & { is_active?: boolean }) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (couponData.code !== undefined) updateData.code = couponData.code.toUpperCase();
    if (couponData.description !== undefined) updateData.description = couponData.description;
    if (couponData.discount_type !== undefined) updateData.discount_type = couponData.discount_type;
    if (couponData.discount_value !== undefined) updateData.discount_value = couponData.discount_value;
    if (couponData.max_discount !== undefined) updateData.max_discount = couponData.max_discount;
    if (couponData.min_order_value !== undefined) updateData.min_order_value = couponData.min_order_value;
    if (couponData.usage_limit !== undefined) updateData.usage_limit = couponData.usage_limit;
    if (couponData.expires_at !== undefined) updateData.expires_at = couponData.expires_at;
    if (couponData.is_active !== undefined) updateData.is_active = couponData.is_active;

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, coupon: data };
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return { success: false, error, message: error.message || 'Failed to update coupon' };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return { success: false, error };
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, coupon: data };
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return { success: false, error };
  }
}

// ============================================
// REVIEWS MANAGEMENT
// ============================================

export interface ProductReview {
  id: string;
  product_id: string;
  order_id: string | null;
  reviewer_name: string;
  reviewer_mobile: string;
  reviewer_email: string | null;
  rating: number;
  title: string | null;
  review_text: string;
  review_images: string[] | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateReviewData {
  reviewer_name?: string;
  rating?: number;
  title?: string;
  review_text?: string;
  is_approved?: boolean;
}

export async function getAllReviews(productId?: string) {
  try {
    let query = supabase
      .from('product_reviews')
      .select(`
        *,
        products!inner(id, product_id, name, image_url, images_json)
      `)
      .order('created_at', { ascending: false });

    if (productId) {
      // Check if productId is UUID or string ID
      if (productId.includes('-')) {
        // UUID - query directly
        query = query.eq('product_id', productId);
      } else {
        // String ID - need to get UUID first
        const { data: productData } = await supabase
          .from('products')
          .select('id')
          .eq('product_id', productId)
          .single();
        
        if (productData) {
          query = query.eq('product_id', productData.id);
        }
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, reviews: data };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, error };
  }
}

export async function updateReview(id: string, reviewData: UpdateReviewData) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (reviewData.reviewer_name !== undefined) updateData.reviewer_name = reviewData.reviewer_name;
    if (reviewData.rating !== undefined) updateData.rating = reviewData.rating;
    if (reviewData.title !== undefined) updateData.title = reviewData.title;
    if (reviewData.review_text !== undefined) updateData.review_text = reviewData.review_text;
    if (reviewData.is_approved !== undefined) {
      updateData.is_approved = reviewData.is_approved;
      updateData.published_at = reviewData.is_approved ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update product ratings if rating or approval status changed
    if ((reviewData.rating !== undefined || reviewData.is_approved !== undefined) && data?.product_id) {
      const { updateProductRatingFromReviews } = await import('./api');
      await updateProductRatingFromReviews(data.product_id);
      console.log('✅ Product ratings updated after review update');
    }

    return { success: true, review: data };
  } catch (error: any) {
    console.error('Error updating review:', error);
    return { success: false, error, message: error.message || 'Failed to update review' };
  }
}

export async function deleteReview(id: string) {
  try {
    // Get product_id before deleting
    const { data: review, error: fetchError } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching review for deletion:', fetchError);
      throw fetchError;
    }

    const productId = review?.product_id;

    // Delete the review
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update product ratings
    if (productId) {
      const { updateProductRatingFromReviews } = await import('./api');
      await updateProductRatingFromReviews(productId);
      console.log('✅ Product ratings updated after review deletion');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error };
  }
}

export async function toggleReviewApproval(id: string, isApproved: boolean) {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ 
        is_approved: isApproved,
        published_at: isApproved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update product ratings (import needed at top of file)
    if (data?.product_id) {
      const { updateProductRatingFromReviews } = await import('./api');
      await updateProductRatingFromReviews(data.product_id);
      console.log('✅ Product ratings updated after approval toggle');
    }

    return { success: true, review: data };
  } catch (error) {
    console.error('Error toggling review approval:', error);
    return { success: false, error };
  }
}

export async function getReviewStats() {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('is_approved, rating');

    if (error) throw error;

    const total = data?.length || 0;
    const approved = data?.filter(r => r.is_approved).length || 0;
    const pending = total - approved;
    const avgRating = data?.length 
      ? (data.reduce((sum, r) => sum + r.rating, 0) / data.length).toFixed(1)
      : '0.0';

    return {
      success: true,
      stats: {
        total,
        approved,
        pending,
        avgRating: parseFloat(avgRating)
      }
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { success: false, error };
  }
}

// ============================================
// BLOGS MANAGEMENT
// ============================================

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  image_alt: string | null;
  category: string | null;
  related_product_ids: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  author_name: string | null;
  author_id: string | null;
  published_at: string | null;
  is_published: boolean;
  is_featured: boolean;
  read_time_minutes: number | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  image_alt?: string;
  category?: string;
  related_product_ids?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  author_name?: string;
  read_time_minutes?: number;
  is_published?: boolean;
  is_featured?: boolean;
}

export async function getAllBlogs() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, blogs: data };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return { success: false, error };
  }
}

export async function getBlogById(id: string) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, blog: data };
  } catch (error) {
    console.error('Error fetching blog:', error);
    return { success: false, error };
  }
}

export async function createBlog(blogData: CreateBlogData) {
  try {
    const insertData: any = {
      title: blogData.title,
      slug: blogData.slug,
      excerpt: blogData.excerpt || null,
      content: blogData.content,
      featured_image: blogData.featured_image || null,
      image_alt: blogData.image_alt || null,
      category: blogData.category || null,
      related_product_ids: blogData.related_product_ids || null,
      meta_title: blogData.meta_title || blogData.title,
      meta_description: blogData.meta_description || blogData.excerpt,
      meta_keywords: blogData.meta_keywords || null,
      og_title: blogData.og_title || blogData.title,
      og_description: blogData.og_description || blogData.excerpt,
      og_image: blogData.og_image || blogData.featured_image,
      canonical_url: blogData.canonical_url || null,
      author_name: blogData.author_name || 'VedPutra Team',
      read_time_minutes: blogData.read_time_minutes || null,
      is_published: blogData.is_published || false,
      is_featured: blogData.is_featured || false,
      published_at: blogData.is_published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('blogs')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return { success: true, blog: data };
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return { success: false, error, message: error.message || 'Failed to create blog' };
  }
}

export async function updateBlog(id: string, blogData: Partial<CreateBlogData>) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (blogData.title !== undefined) updateData.title = blogData.title;
    if (blogData.slug !== undefined) updateData.slug = blogData.slug;
    if (blogData.excerpt !== undefined) updateData.excerpt = blogData.excerpt;
    if (blogData.content !== undefined) updateData.content = blogData.content;
    if (blogData.featured_image !== undefined) updateData.featured_image = blogData.featured_image;
    if (blogData.image_alt !== undefined) updateData.image_alt = blogData.image_alt;
    if (blogData.category !== undefined) updateData.category = blogData.category;
    if (blogData.related_product_ids !== undefined) updateData.related_product_ids = blogData.related_product_ids;
    if (blogData.meta_title !== undefined) updateData.meta_title = blogData.meta_title;
    if (blogData.meta_description !== undefined) updateData.meta_description = blogData.meta_description;
    if (blogData.meta_keywords !== undefined) updateData.meta_keywords = blogData.meta_keywords;
    if (blogData.og_title !== undefined) updateData.og_title = blogData.og_title;
    if (blogData.og_description !== undefined) updateData.og_description = blogData.og_description;
    if (blogData.og_image !== undefined) updateData.og_image = blogData.og_image;
    if (blogData.canonical_url !== undefined) updateData.canonical_url = blogData.canonical_url;
    if (blogData.author_name !== undefined) updateData.author_name = blogData.author_name;
    if (blogData.read_time_minutes !== undefined) updateData.read_time_minutes = blogData.read_time_minutes;
    if (blogData.is_featured !== undefined) updateData.is_featured = blogData.is_featured;
    
    if (blogData.is_published !== undefined) {
      updateData.is_published = blogData.is_published;
      updateData.published_at = blogData.is_published ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, blog: data };
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return { success: false, error, message: error.message || 'Failed to update blog' };
  }
}

export async function deleteBlog(id: string) {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { success: false, error };
  }
}

export async function toggleBlogStatus(id: string, isPublished: boolean) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .update({ 
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, blog: data };
  } catch (error) {
    console.error('Error toggling blog status:', error);
    return { success: false, error };
  }
}

export async function getBlogStats() {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('is_published, views_count');

    if (error) throw error;

    const total = data?.length || 0;
    const published = data?.filter(b => b.is_published).length || 0;
    const draft = total - published;
    const totalViews = data?.reduce((sum, b) => sum + (b.views_count || 0), 0) || 0;

    return {
      success: true,
      stats: {
        total,
        published,
        draft,
        totalViews
      }
    };
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return { success: false, error };
  }
}

