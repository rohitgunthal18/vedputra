# Vedputra - Premium Organic Powder E-Commerce

A modern, minimalist e-commerce website for Vedputra's premium organic powder collection with a complete guest checkout system.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)

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
- **Coupon System**: Apply discount codes (WELCOME10, SAVE50, ORGANIC15) + Promotion coupons
- **Smart Checkout**: 
  - Auto-fill address from Indian pincode (India Post API)
  - WhatsApp order updates option
  - Professional payment options (COD & Online)
  - Form validation
  - **Backend Integration**: Orders saved to Supabase database
- **Order Confirmation**: 
  - Professional invoice with barcode
  - Two-column A4 print layout
  - Order ID with copy functionality
  - Complete order summary
  - Order tracking capability

### **Backend & Database (NEW! ✨)**
- **Supabase Integration**: Fully functional backend with PostgreSQL
- **Order Management**: Complete order tracking and management system
- **Contact Form**: Messages saved to database for admin review
- **Promotion System**: Coupon generation and validation system
- **Guest Checkout**: No authentication required for placing orders
- **Admin Ready**: All API functions ready for admin dashboard
- **Secure**: Row Level Security (RLS) enabled on all tables

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

# Create .env.local file with Supabase credentials
# (See Environment Variables section below)

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

### Environment Variables (Required for Backend)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zaqzyfiiapihjiexplqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Note**: The Supabase credentials are already configured in the code for development. For production, set these as environment variables in Vercel.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL)
- **Database**: 5 tables with RLS enabled
- **Storage**: localStorage (cart persistence)
- **APIs**: 
  - India Post Pincode API (address auto-fill)
  - Barcode API (invoice barcodes)
  - Supabase API (orders, contacts, coupons)
- **Fonts**: Inter (body), Space Grotesk (headings)

## 📁 Project Structure

```
vedputra/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout page (Supabase integrated)
│   │   ├── order-confirmation/ # Order success page
│   │   ├── promotion/         # Promotion coupon page (Supabase integrated)
│   │   ├── track-order/       # Order tracking page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── Products/
│   │   ├── Newsletter/        # Contact form (Supabase integrated)
│   │   ├── Footer/
│   │   └── ...
│   ├── context/               # React Context
│   │   └── CartContext.tsx   # Cart state management
│   ├── lib/                   # Backend & API (NEW!)
│   │   ├── supabase.ts       # Supabase client
│   │   └── api.ts            # API functions (orders, contacts, coupons)
│   ├── utils/                 # Utility functions
│   │   └── pincodeApi.ts     # Pincode API integration
│   ├── types/                 # TypeScript types
│   ├── data/                  # Static data
│   └── img/                   # Images
├── public/                    # Static assets
├── BACKEND_SETUP_COMPLETE.md  # Backend documentation
├── TESTING_GUIDE.md           # Testing instructions
├── ADMIN_DASHBOARD_GUIDE.md   # Admin guide
├── BACKEND_SUMMARY.md         # Backend summary
├── QUICK_REFERENCE.md         # Quick reference
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
- **Promotion Coupons** - Visit `/promotion` to generate a unique 10% discount coupon (saved to database)

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

## 📚 Documentation

- **[BACKEND_SETUP_COMPLETE.md](BACKEND_SETUP_COMPLETE.md)** - Complete backend setup guide
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Step-by-step testing instructions
- **[ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md)** - Admin dashboard development guide
- **[BACKEND_SUMMARY.md](BACKEND_SUMMARY.md)** - Backend architecture summary
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for API and database

## 🗄️ Database Schema

The project uses Supabase with the following tables:

1. **orders** - Complete order information (24 columns)
2. **order_items** - Individual items in each order
3. **contact_messages** - Contact form submissions
4. **promotion_coupons** - Promotion coupon claims
5. **order_status_history** - Automatic order status tracking

All tables have Row Level Security (RLS) enabled for secure operations.

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Guest checkout without authentication
- ✅ Secure API policies
- ✅ Data validation on frontend and backend
- ✅ No sensitive data exposed to client

## 📞 Support

For any deployment issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- Project documentation files listed above

---

**Built with ❤️ using Next.js, TypeScript & Supabase**
