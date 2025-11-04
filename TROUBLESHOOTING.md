# 🔧 CASHFREE PAYMENT - TROUBLESHOOTING GUIDE

## ❌ **Error: "Failed to fetch"**

This error means the API request couldn't reach the server. Here's how to fix it:

### **Step 1: Restart Your Development Server**

After making changes to API routes or environment variables, you **MUST** restart the server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### **Step 2: Check Environment Variables**

Make sure `.env.local` exists and has the correct values:

```env
CASHFREE_SECRET_KEY=TEST49ec52c404ecd510c7124c8f434e0c29a124a91d
NEXT_PUBLIC_CASHFREE_APP_ID=TEST396120fe019398a6e734e591fd021693
NEXT_PUBLIC_CASHFREE_ENVIRONMENT=TEST
```

**Important:** After adding/updating `.env.local`, restart the server!

### **Step 3: Check Server Logs**

When you try to make a payment, check your terminal (where `npm run dev` is running) for:
- Any error messages
- Console logs from the API route
- Cashfree SDK errors

### **Step 4: Verify API Route is Working**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to place an order
4. Check if `/api/payment/create-order` appears in the network requests
5. Click on it to see the request/response details

### **Step 5: Common Issues**

#### **Issue: Route crashes on import**
- **Symptom:** Server won't start or crashes immediately
- **Fix:** Check if `cashfree-pg` package is installed: `npm list cashfree-pg`

#### **Issue: Environment variables not loaded**
- **Symptom:** API returns "Payment gateway not configured"
- **Fix:** 
  1. Verify `.env.local` exists in project root
  2. Restart server
  3. Check terminal for env var loading messages

#### **Issue: Port mismatch**
- **Symptom:** Request goes to wrong port
- **Fix:** Make sure you're accessing the site on the same port as the server (usually `localhost:3000`)

### **Step 6: Test API Route Directly**

You can test the API route directly using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "orderId": "TEST123",
    "customerDetails": {
      "customerName": "Test User",
      "customerPhone": "9876543210"
    },
    "returnUrl": "http://localhost:3000/payment-callback"
  }'
```

### **Step 7: Check Browser Console**

1. Open DevTools (F12)
2. Go to Console tab
3. Try to place order
4. Look for detailed error messages (now with improved logging)

### **Step 8: Verify Cashfree Credentials**

Make sure your Cashfree test credentials are correct:
- App ID: `TEST396120fe019398a6e734e591fd021693`
- Secret Key: `TEST49ec52c404ecd510c7124c8f434e0c29a124a91d`

You can verify these in your Cashfree dashboard.

---

## ✅ **What's Fixed**

1. ✅ **CSP Updated** - Cashfree SDK can now load
2. ✅ **Error Handling Improved** - Better error messages
3. ✅ **Logging Added** - More detailed console logs
4. ✅ **API Route Defensive Coding** - Better error handling

---

## 🚀 **Next Steps**

1. **Restart your server** (most important!)
2. **Try the payment flow again**
3. **Check browser console** for detailed error messages
4. **Check server terminal** for API logs

If you still see errors, the improved logging will show exactly what's wrong!

