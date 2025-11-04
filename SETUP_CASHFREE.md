# 🚀 CASHFREE PAYMENT GATEWAY - QUICK SETUP

## ✅ **Step 1: Database Migration - COMPLETE!**

The database columns have been successfully added:
- ✅ `payment_order_id` - Added
- ✅ `payment_mode` - Added

---

## 📝 **Step 2: Create Environment Variables File**

Create a file named `.env.local` in your project root directory (same level as `package.json`).

**Copy and paste this content into `.env.local`:**

```env
# Cashfree Payment Gateway Configuration
NEXT_PUBLIC_CASHFREE_APP_ID=TEST396120fe019398a6e734e591fd021693
CASHFREE_SECRET_KEY=TEST49ec52c404ecd510c7124c8f434e0c29a124a91d
NEXT_PUBLIC_CASHFREE_ENVIRONMENT=TEST

# Base URL (for production, update this)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Your existing Supabase variables (if not already present)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:**
- If you already have a `.env.local` file, just add the Cashfree variables to it
- The `CASHFREE_SECRET_KEY` is sensitive - never commit it to git (it's already in `.gitignore`)

---

## 🔄 **Step 3: Restart Development Server**

After creating/updating `.env.local`:

1. **Stop your current server** (Press `Ctrl+C` in the terminal)
2. **Restart the server:**
   ```bash
   npm run dev
   ```

Environment variables are loaded when the server starts, so you must restart after adding them.

---

## ✅ **Step 4: Test the Integration**

1. **Add products to cart** on your website
2. **Go to checkout**
3. **Fill shipping details**
4. **Select "Online Payment"**
5. **Click "Place Order"**
6. **You should be redirected to Cashfree payment page**

### **Test Card Details:**
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVV:** `123`
- **Name:** Any name

### **Test UPI:**
- **UPI ID:** `success@cashfree`

---

## 📋 **What's Already Done:**

✅ Cashfree SDK installed (`cashfree-pg@5.1.0`)  
✅ Payment utility functions created  
✅ API routes created (`/api/payment/create-order`, `/api/payment/verify`)  
✅ Checkout page integrated with Cashfree  
✅ Payment callback page created  
✅ Database columns added  
✅ Order creation updated to store payment details  

---

## 🎯 **Next Steps After Setup:**

1. ✅ Create `.env.local` file (you're here)
2. ✅ Restart server
3. ✅ Test payment flow
4. 🚀 Get production keys from Cashfree dashboard when ready
5. 🚀 Update environment variables for production
6. 🚀 Go live!

---

## 🐛 **Troubleshooting:**

### **"Payment gateway is loading" error:**
- Wait a few seconds for Cashfree script to load
- Check browser console for errors
- Verify `.env.local` file exists and has correct values

### **"Failed to create payment session":**
- Verify environment variables are set correctly
- Check that server was restarted after adding `.env.local`
- Check terminal for API route errors

### **Payment not working:**
- Verify Cashfree credentials are correct
- Check Cashfree dashboard for API status
- Ensure you're using TEST environment with test credentials

---

## 📞 **Need Help?**

- Check the detailed guide: `CASHFREE_INTEGRATION_GUIDE.md`
- Cashfree Documentation: https://docs.cashfree.com/
- Cashfree Dashboard: https://dashboard.cashfree.com/

---

**Status:** ✅ **READY TO TEST** (after adding `.env.local`)

