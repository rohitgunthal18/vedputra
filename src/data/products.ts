import { Product, Testimonial, BlogPost, ProcessStep } from '@/types';
import product1 from '@/img/product1.png';
import product2 from '@/img/product2.png';
import product3 from '@/img/product3.png';

export const products: Product[] = [
  {
    id: '1',
    name: 'Moringa Leaf Powder',
    description: 'Rich in vitamins and minerals',
    price: 450,
    weight: '100g',
    rating: 5,
    reviews: 124,
    badge: 'bestseller',
    image: product1,
  },
  {
    id: '2',
    name: 'Ashwagandha Powder',
    description: 'Stress relief & energy boost',
    price: 500,
    weight: '100g',
    rating: 5,
    reviews: 98,
    badge: 'new',
    image: product2,
  },
  {
    id: '3',
    name: 'Tulsi Leaf Powder',
    description: 'Immunity & respiratory health',
    price: 400,
    weight: '100g',
    rating: 5,
    reviews: 156,
    badge: 'organic',
    image: product3,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sneha Sharma',
    location: 'Mumbai, India',
    rating: 5,
    text: 'Best quality moringa powder I\'ve ever tried! The difference is noticeable in my daily energy levels. Highly recommend Vedputra!',
    avatar: 'S',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    location: 'Delhi, India',
    rating: 5,
    text: 'Excellent products and fast delivery. The ashwagandha powder has helped me manage stress better. Will definitely order again!',
    avatar: 'R',
  },
  {
    id: '3',
    name: 'Priya Patel',
    location: 'Bangalore, India',
    rating: 5,
    text: 'Love the commitment to organic and sustainable practices. The packaging is eco-friendly and products are top-notch!',
    avatar: 'P',
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Benefits of Moringa Powder for Daily Health',
    excerpt: 'Discover how incorporating moringa powder into your daily routine can boost your overall wellness...',
    category: 'Wellness',
    date: 'October 28, 2025',
    readTime: '5 min read',
    slug: 'benefits-moringa-powder',
  },
  {
    id: '2',
    title: 'Delicious Smoothie Recipes with Organic Powders',
    excerpt: 'Try these delicious and nutritious smoothie recipes featuring our organic powders...',
    category: 'Recipes',
    date: 'October 25, 2025',
    readTime: '7 min read',
    slug: 'smoothie-recipes',
  },
  {
    id: '3',
    title: 'The Importance of Choosing Organic Products',
    excerpt: 'Learn why choosing organic products matters for your health and the environment...',
    category: 'Lifestyle',
    date: 'October 22, 2025',
    readTime: '6 min read',
    slug: 'choosing-organic',
  },
];

export const processSteps: ProcessStep[] = [
  {
    id: '1',
    number: '01',
    icon: '🌱',
    title: 'Sourcing',
    description: 'Ethically sourced from certified organic farms',
  },
  {
    id: '2',
    number: '02',
    icon: '🔬',
    title: 'Testing',
    description: 'Rigorous quality control and purity testing',
  },
  {
    id: '3',
    number: '03',
    icon: '⚙️',
    title: 'Processing',
    description: 'Carefully processed to retain nutrients',
  },
  {
    id: '4',
    number: '04',
    icon: '📦',
    title: 'Packaging',
    description: 'Eco-friendly packaging for freshness',
  },
];
