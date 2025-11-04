# 🧪 Testing Guide - Vedputra Backend

This guide will help you test all the backend functionality to ensure everything is working correctly.

## 📋 Prerequisites

Before testing, make sure:
- ✅ Supabase is configured (check `src/lib/supabase.ts`)
- ✅ All migrations are applied
- ✅ Development server is running (`npm run dev`)

## 🧪 Test Scenarios

### 1. Test Order Creation (Guest Checkout)

#### Steps:
1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Add items to cart**
   - Go to http://localhost:3000
   - Scroll to Products section
   - Click "Add to Cart" on any product
   - Click cart icon in header to view cart

3. **Proceed to checkout**
   - Click "Proceed to Checkout" button
   - Fill in all required fields:
     - Full Name: `Test User`
     - Mobile: `9876543210`
     - Pincode: `400001` (it should auto-fill city and state)
     - Address: `123 Test Street`
     - Locality: `Test Area`
   - Select "Cash on Delivery" payment method

4. **Place order**
   - Click "Place Order" button
   - Wait for processing
   - You should be redirected to order confirmation page

5. **Verify in Supabase**
   - Go to Supabase Dashboard → Table Editor
   - Check `orders` table - you should see your order
   - Check `order_items` table - you should see the items
   - Check `order_status_history` table - you should see status change

#### Expected Results:
✅ Order is created with status "confirmed"
✅ Order items are saved
✅ Order ID is generated (format: VED12345678)
✅ Order confirmation page shows order details
✅ Cart is cleared after order placement

#### SQL Query to Verify:
```sql
-- Check latest order
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

-- Check order items
SELECT oi.* FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY o.created_at DESC LIMIT 10;

-- Check status history
SELECT * FROM order_status_history ORDER BY created_at DESC LIMIT 5;
```

---

### 2. Test Contact Form

#### Steps:
1. **Navigate to contact section**
   - Go to http://localhost:3000
   - Scroll to bottom of page
   - Click "Contact Form" tab (on mobile)

2. **Fill the form**
   - Your Name: `Test Contact`
   - Email: `test@example.com`
   - Phone: `+91 98765 43210`
   - Message: `This is a test message from the contact form.`

3. **Submit the form**
   - Click "SEND MESSAGE" button
   - Wait for success message
   - Form should clear after submission

4. **Verify in Supabase**
   - Go to Supabase Dashboard → Table Editor
   - Check `contact_messages` table
   - You should see your message with status "new"

#### Expected Results:
✅ Success alert appears
✅ Form is cleared
✅ Message is saved in database with status "new"

#### SQL Query to Verify:
```sql
-- Check latest contact messages
SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5;
```

---

### 3. Test Promotion Coupon

#### Steps:
1. **Visit promotion page**
   - Go to http://localhost:3000/promotion

2. **Claim coupon**
   - Enter mobile number: `9876543210`
   - Click "Claim Discount" button
   - Wait for coupon generation

3. **Verify coupon details**
   - You should see a coupon code (format: VED10-XXXX)
   - Discount: 10% OFF
   - Max discount: ₹100
   - Validity: 30 days

4. **Copy coupon**
   - Click "Copy" button
   - Coupon code should be copied to clipboard

5. **Test duplicate prevention**
   - Refresh the page
   - Try entering the same mobile number again
   - You should see the same coupon (not a new one)

6. **Verify in Supabase**
   - Go to Supabase Dashboard → Table Editor
   - Check `promotion_coupons` table
   - You should see your coupon with `is_used = false`

#### Expected Results:
✅ Coupon is generated successfully
✅ Coupon code is unique
✅ Same mobile number gets same coupon (no duplicates)
✅ Coupon is saved in database
✅ Expiry date is 30 days from now

#### SQL Query to Verify:
```sql
-- Check latest promotion coupons
SELECT * FROM promotion_coupons ORDER BY created_at DESC LIMIT 5;

-- Check if mobile has existing coupon
SELECT * FROM promotion_coupons WHERE mobile = '9876543210';
```

---

### 4. Test Coupon Application in Cart

#### Steps:
1. **Add items to cart**
   - Add any product to cart

2. **Go to cart page**
   - Click cart icon in header

3. **Apply coupon**
   - Enter the coupon code you generated earlier
   - Click "Apply" button
   - Discount should be applied

4. **Proceed to checkout and place order**
   - Fill in checkout form
   - Select COD payment
   - Place order

5. **Verify coupon usage**
   - Go to Supabase Dashboard → Table Editor
   - Check `promotion_coupons` table
   - Your coupon should now have `is_used = true`
   - `used_at` should have a timestamp
   - `order_id` should be linked to your order

#### Expected Results:
✅ Coupon is validated successfully
✅ Discount is applied to cart
✅ After order placement, coupon is marked as used
✅ Coupon is linked to the order

#### SQL Query to Verify:
```sql
-- Check coupon usage
SELECT 
  pc.*,
  o.order_id,
  o.total_amount
FROM promotion_coupons pc
LEFT JOIN orders o ON pc.order_id = o.id
WHERE pc.mobile = '9876543210';
```

---

### 5. Test Order Tracking

#### Steps:
1. **Get your order ID**
   - After placing an order, note down the Order ID (e.g., VED12345678)

2. **Visit track order page**
   - Go to http://localhost:3000/track-order
   - Enter your Order ID or Mobile Number
   - Click "Track Order"

3. **Verify order details**
   - You should see your order details
   - Order status should be "confirmed"

#### Expected Results:
✅ Order can be tracked by Order ID
✅ Order can be tracked by Mobile Number
✅ Order details are displayed correctly

---

### 6. Test Order Status History

#### Steps:
1. **Update order status manually**
   - Go to Supabase Dashboard → SQL Editor
   - Run this query:
   ```sql
   UPDATE orders 
   SET order_status = 'processing' 
   WHERE order_id = 'VED12345678';  -- Replace with your order ID
   ```

2. **Check status history**
   - Go to Table Editor → `order_status_history`
   - You should see a new record with:
     - `old_status`: "confirmed"
     - `new_status`: "processing"
     - `changed_by`: "system"

#### Expected Results:
✅ Status change is automatically tracked
✅ History record is created with old and new status

#### SQL Query to Verify:
```sql
-- Check status history for an order
SELECT 
  o.order_id,
  osh.old_status,
  osh.new_status,
  osh.changed_by,
  osh.created_at
FROM order_status_history osh
JOIN orders o ON osh.order_id = o.id
WHERE o.order_id = 'VED12345678'  -- Replace with your order ID
ORDER BY osh.created_at DESC;
```

---

## 🔍 Verification Checklist

After running all tests, verify the following:

### Database Tables
- [ ] `orders` table has at least one order
- [ ] `order_items` table has items for that order
- [ ] `contact_messages` table has at least one message
- [ ] `promotion_coupons` table has at least one coupon
- [ ] `order_status_history` table has status change records

### Data Integrity
- [ ] Order items are linked to correct order
- [ ] Coupon is linked to correct order after use
- [ ] Status history is linked to correct order
- [ ] All timestamps are correct
- [ ] All required fields have values

### Functionality
- [ ] Guest checkout works without authentication
- [ ] Cart data is stored in localStorage
- [ ] Order data is saved to database on order placement
- [ ] Contact form submissions are saved
- [ ] Promotion coupons are generated and saved
- [ ] Coupon validation works
- [ ] Duplicate coupon prevention works
- [ ] Order tracking works

---

## 🐛 Common Issues & Solutions

### Issue: Order not saving to database
**Solution:**
1. Check browser console for errors
2. Verify Supabase URL and API key in `.env.local`
3. Check RLS policies in Supabase dashboard
4. Ensure all required fields are filled in checkout form

### Issue: Contact form not submitting
**Solution:**
1. Check browser console for errors
2. Verify all form fields are filled
3. Check network tab for API errors
4. Verify RLS policies allow public insert

### Issue: Coupon not generating
**Solution:**
1. Check browser console for errors
2. Verify mobile number is exactly 10 digits
3. Check if coupon already exists for that mobile
4. Verify RLS policies allow public insert

### Issue: "Failed to place order" error
**Solution:**
1. Open browser console and check the error message
2. Verify Supabase connection is working
3. Check if all required fields are filled
4. Try with a different mobile number

---

## 📊 Sample Test Data

Use this data for consistent testing:

### Test User 1
- Name: `John Doe`
- Mobile: `9876543210`
- Email: `john@example.com`
- Pincode: `400001`
- Address: `123 Test Street, Andheri`
- City: `Mumbai`
- State: `Maharashtra`

### Test User 2
- Name: `Jane Smith`
- Mobile: `9876543211`
- Email: `jane@example.com`
- Pincode: `110001`
- Address: `456 Sample Road, Connaught Place`
- City: `New Delhi`
- State: `Delhi`

### Test Contact Message
- Name: `Test Contact`
- Email: `test@example.com`
- Phone: `+91 98765 43210`
- Message: `This is a test message to verify the contact form functionality.`

---

## 🎯 Success Criteria

Your backend is working correctly if:

✅ **Orders**
- Orders are created successfully
- Order items are saved correctly
- Order ID is generated in correct format
- Order status is "confirmed" for COD orders
- Order confirmation page displays correctly

✅ **Contact Messages**
- Messages are saved to database
- Status is "new" by default
- All fields are captured correctly

✅ **Promotion Coupons**
- Coupons are generated successfully
- Coupon codes are unique
- Duplicate prevention works
- Coupons are marked as used after order placement
- Coupons are linked to orders

✅ **Data Integrity**
- All foreign key relationships work
- Timestamps are set correctly
- Status history is tracked automatically
- No data loss or corruption

---

## 📞 Need Help?

If you encounter any issues:

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for error messages

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Check Database**
   - Go to Supabase Dashboard → Table Editor
   - Verify data is being saved
   - Check RLS policies

4. **Review Code**
   - Check `src/lib/api.ts` for API functions
   - Check component files for integration
   - Verify Supabase client is initialized correctly

---

## 🎉 Congratulations!

If all tests pass, your backend is fully functional and ready for production! 🚀

