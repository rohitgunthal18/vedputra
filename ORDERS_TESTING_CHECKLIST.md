# Orders Section - Testing Checklist ✅

## Quick Testing Guide

### 🖥️ Desktop Testing

#### 1. **Shipping Label Print**
- [ ] Navigate to `/admin/orders`
- [ ] Click "Print" button on any order
- [ ] Verify label shows:
  - [ ] Vedputra branding
  - [ ] Your address (FROM section)
  - [ ] Customer address (TO section)
  - [ ] Order ID and barcode
  - [ ] Mobile number
  - [ ] COD amount (if applicable)
- [ ] Click "Print Label" button
- [ ] Verify it prints in one page (A4)
- [ ] Click "Close" to exit

#### 2. **Export to CSV**
- [ ] Click "Export CSV" button
- [ ] Verify CSV file downloads
- [ ] Open in Excel/Sheets
- [ ] Verify all columns are present:
  - Order ID, Date, Customer details
  - Address components
  - Price breakdown with coupon
  - Payment and status info
  - Tracking number column

#### 3. **Tracking Number**
- [ ] Click "View" on any order
- [ ] Find "Tracking Number" field
- [ ] Enter a test tracking number (e.g., "TRACK12345")
- [ ] Click outside the field
- [ ] Verify success alert appears
- [ ] Close and reopen modal
- [ ] Verify tracking number is saved

#### 4. **Coupon Display**
- [ ] Find an order that used a coupon
- [ ] Click "View" on that order
- [ ] Verify you see:
  - [ ] "Discount" row with amount
  - [ ] Coupon code in green badge
  - [ ] Discount is subtracted from total

#### 5. **Filters and Search**
- [ ] Test each status filter (All, Confirmed, Processing, Shipped, Delivered)
- [ ] Search by Order ID
- [ ] Search by Customer Name
- [ ] Search by Mobile Number
- [ ] Verify Export CSV respects filters

### 📱 Mobile Testing

#### 1. **Responsive Layout**
- [ ] Open on mobile browser (or use browser DevTools mobile view)
- [ ] Verify page header adapts properly
- [ ] Check Export and Refresh buttons are full width
- [ ] Stats should be in 2 columns on mobile

#### 2. **Table Scroll**
- [ ] Orders table should scroll horizontally
- [ ] Swipe left/right smoothly
- [ ] All columns visible when scrolling

#### 3. **Action Buttons**
- [ ] View and Print buttons stack vertically
- [ ] Buttons are full width in mobile
- [ ] Easy to tap (not too small)

#### 4. **Modal on Mobile**
- [ ] Click View on any order
- [ ] Modal should fill screen
- [ ] All content readable
- [ ] Tracking number input works
- [ ] Close button accessible

### 🎨 Visual Quality Check

#### Desktop
- [ ] All icons display correctly
- [ ] Hover effects work on buttons
- [ ] Colors match theme (green for primary actions)
- [ ] Spacing looks professional
- [ ] No overlapping elements

#### Mobile
- [ ] No horizontal overflow (except table)
- [ ] Text is readable (not too small)
- [ ] Touch targets are adequate size
- [ ] No weird wrapping issues

### 🔍 Edge Cases

#### Empty States
- [ ] Apply filter with no results
- [ ] Verify "No Orders Found" message shows
- [ ] Export button is disabled

#### Large Data
- [ ] Export CSV with 50+ orders
- [ ] Verify file downloads successfully
- [ ] Check CSV opens without errors

#### Long Text
- [ ] Order with very long address
- [ ] Verify shipping label handles it well
- [ ] No text overflow

#### No Tracking Number
- [ ] Order without tracking number
- [ ] Field should be empty but functional
- [ ] Can add tracking number

---

## 🐛 Common Issues & Solutions

### Issue: Shipping label cuts off in print
**Solution**: Set printer to A4 paper size, portrait orientation

### Issue: CSV has garbled characters
**Solution**: Open with UTF-8 encoding in Excel

### Issue: Can't click Print button
**Solution**: Check browser console for errors, verify order has all required fields

### Issue: Mobile table is cramped
**Solution**: This is expected - swipe left/right to see all columns

### Issue: Tracking number doesn't save
**Solution**: Make sure to click outside the input field to trigger auto-save

---

## ✅ All Tests Passed?

Once you've completed all tests:
1. ✅ Shipping labels print correctly
2. ✅ CSV export works with all data
3. ✅ Tracking numbers save properly
4. ✅ Coupons display in order details
5. ✅ Mobile layout is functional
6. ✅ All buttons and actions work

**Your orders system is production-ready! 🎉**

---

## 📋 Before Going Live

- [ ] Update FROM address in shipping label to your actual address
- [ ] Test with real printer (not PDF)
- [ ] Verify barcode scans with a scanner
- [ ] Train staff on new features
- [ ] Create internal documentation
- [ ] Set up tracking number system with courier

---

*Happy Order Management! 🚀*

