-- ============================================
-- QUICK FIX: Sync Products to Match Cart
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check what products currently exist
SELECT 
  product_id, 
  name, 
  price,
  is_active,
  created_at
FROM products 
ORDER BY product_id;

-- ============================================
-- If you see products with UUID or different IDs,
-- and want to use simple IDs like "1", "2", "3":
-- ============================================

-- Option A: Update existing products to use simple IDs
-- (Replace 'existing-uuid-1' with actual UUID from Step 1)

-- UPDATE products SET product_id = '1' WHERE id = 'existing-uuid-1';
-- UPDATE products SET product_id = '2' WHERE id = 'existing-uuid-2';
-- UPDATE products SET product_id = '3' WHERE id = 'existing-uuid-3';

-- ============================================
-- Option B: Insert products with IDs that match your cart
-- Adjust values to match your actual products
-- ============================================

-- First, let's see what's trying to be added to cart
-- (You'll see this in browser console or error message)

-- Then insert products with those IDs:

INSERT INTO products (
  product_id,
  name,
  description,
  long_description,
  price,
  weight,
  category,
  image_url,
  is_active,
  stock_quantity
) VALUES 
  (
    '2',  -- This is the missing product ID from your error
    'VedPutra Product 2',  -- Change to your actual product name
    'High-quality product description',
    'Longer description with details about the product...',
    499.00,  -- Price
    '500g',  -- Weight
    'herbs',  -- Category
    '/images/product-2.jpg',  -- Image URL
    true,  -- Active
    100  -- Stock quantity
  )
ON CONFLICT (product_id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active;

-- Add more products as needed:
-- INSERT INTO products (...) VALUES ('3', ...), ('4', ...), ('5', ...);

-- ============================================
-- Step 2: Verify products were added
-- ============================================

SELECT 
  product_id, 
  name, 
  price,
  is_active
FROM products 
WHERE product_id IN ('1', '2', '3', '4', '5')
ORDER BY product_id;

-- ============================================
-- Step 3: Check if any products are inactive
-- ============================================

SELECT 
  product_id, 
  name,
  is_active,
  stock_quantity
FROM products 
WHERE is_active = false;

-- If you want to activate them:
-- UPDATE products SET is_active = true WHERE product_id = 'X';

-- ============================================
-- ALTERNATIVE: Quick Test Product
-- Add a simple test product with ID '2'
-- ============================================

INSERT INTO products (
  product_id,
  name,
  description,
  price,
  weight,
  category,
  image_url,
  is_active,
  stock_quantity
) VALUES (
  '2',
  'Test Product',
  'Test product for payment testing',
  99.00,
  '100g',
  'test',
  '/placeholder-product.svg',
  true,
  999
)
ON CONFLICT (product_id) DO UPDATE SET
  is_active = true,
  stock_quantity = 999;

-- ============================================
-- Verify the fix worked
-- ============================================

SELECT product_id, name, price FROM products WHERE product_id = '2';

-- Expected result: 1 row showing product with ID '2'

-- ============================================
-- NOTES:
-- - Make sure product_id matches what's in your cart
-- - Check browser console for exact product ID in error
-- - After running this, clear browser cart and re-add products
-- ============================================

