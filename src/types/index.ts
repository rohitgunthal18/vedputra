import { StaticImageData } from 'next/image';

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  rating: number;
  reviews: number;
  badge?: 'bestseller' | 'new' | 'organic';
  image: StaticImageData;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

// Blog Post Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  slug: string;
}

// Feature Types
export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Process Step Types
export interface ProcessStep {
  id: string;
  number: string;
  icon: string;
  title: string;
  description: string;
}

// Cart Item Types
export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

// Checkout Types
export interface ShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  addressType: 'home' | 'work';
  whatsappUpdates: boolean;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Order {
  orderId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  orderSummary: OrderSummary;
  paymentMethod: string;
  orderDate: string;
  status: string;
}

// Newsletter Form Types
export interface NewsletterFormData {
  email: string;
}
