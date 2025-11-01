# Vedputra - Premium Organic Powder E-Commerce

A modern, minimalist e-commerce website for Vedputra's premium organic powder collection with a complete guest checkout system.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)

## 🌟 Features

### **Homepage**
- Modern hero section with CTA
- Product showcase with ratings & badges
- Why choose us section
- Process timeline
- Customer testimonials
- Blog section
- Newsletter subscription
- Responsive design

### **Complete Guest Checkout System**
- **Shopping Cart**: Add/remove items, quantity control, live price calculations
- **Coupon System**: Apply discount codes (WELCOME10, SAVE50, ORGANIC15)
- **Smart Checkout**: 
  - Auto-fill address from Indian pincode (India Post API)
  - WhatsApp order updates option
  - Professional payment options (COD & Online)
  - Form validation
- **Order Confirmation**: 
  - Professional invoice with barcode
  - Two-column A4 print layout
  - Order ID with copy functionality
  - Complete order summary

### **Technical Features**
- Cart persistence with localStorage
- Real-time cart count updates
- Mobile-first responsive design
- Square-edge minimalist theme
- Professional invoice generation
- Barcode generation for orders
- Indian pincode validation & auto-fill
- SEO optimized

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rohitgunthal18/vedputra.git
cd vedputra

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📦 Deploy to Vercel

### Method 1: Import from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository: `rohitgunthal18/vedputra`
4. Vercel will auto-detect Next.js settings
5. Click **"Deploy"**
6. Done! Your site will be live in ~2 minutes

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Optional)
No environment variables required for basic functionality. The site works out of the box!

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Storage**: localStorage (cart persistence)
- **APIs**: 
  - India Post Pincode API (address auto-fill)
  - Barcode API (invoice barcodes)
- **Fonts**: Inter (body), Space Grotesk (headings)

## 📁 Project Structure

```
vedputra/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout page
│   │   ├── order-confirmation/ # Order success page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── Products/
│   │   ├── Footer/
│   │   └── ...
│   ├── context/               # React Context
│   │   └── CartContext.tsx   # Cart state management
│   ├── utils/                 # Utility functions
│   │   └── pincodeApi.ts     # Pincode API integration
│   ├── types/                 # TypeScript types
│   ├── data/                  # Static data
│   └── img/                   # Images
├── public/                    # Static assets
├── package.json
└── tsconfig.json
```

## 🎨 Design System

### Colors
- **Primary Green**: #4A6741
- **Primary Dark**: #3D5536
- **Primary Light**: #7FA64A
- **Background Cream**: #F5F0E8
- **Background White**: #FFFFFF
- **Text Dark**: #1A1A1A
- **Text Gray**: #666666

### Typography
- **Body**: Inter
- **Headings**: Space Grotesk

### Design Philosophy
- Minimalist aesthetic
- Square edges (border-radius: 0)
- Clean spacing
- Professional look
- Mobile-first approach

## 🛒 Guest Checkout Flow

```
1. Browse Products → Add to Cart
2. View Cart → Apply Coupon (optional)
3. Proceed to Checkout
4. Fill Details:
   - Contact Info (Name + Mobile)
   - WhatsApp updates (optional)
   - Address (Auto-fills from pincode)
   - Payment Method (COD / Online)
5. Place Order
6. Order Confirmation with Invoice
   - Copy Order ID for tracking
   - Print invoice (A4 format)
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📝 Sample Coupon Codes

- `WELCOME10` - 10% off
- `SAVE50` - ₹50 flat discount
- `ORGANIC15` - 15% off

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📄 License

This project is private and proprietary.

## 👤 Author

**Rohit Gunthal**
- GitHub: [@rohitgunthal18](https://github.com/rohitgunthal18)

## 🚀 Deployment Status

- **Repository**: [https://github.com/rohitgunthal18/vedputra](https://github.com/rohitgunthal18/vedputra)
- **Status**: ✅ Ready for Vercel deployment
- **Build**: ✅ All checks passed

## 📞 Support

For any deployment issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Built with ❤️ using Next.js & TypeScript**
