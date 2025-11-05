import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://www.vedputra.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.2,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = [];
  const blogEntries: MetadataRoute.Sitemap = [];

  const { data: products } = await supabase
    .from('products')
    .select('product_id, updated_at')
    .eq('is_active', true);

  if (products) {
    products.forEach((product) => {
      if (!product.product_id) return;
      productEntries.push({
        url: `${SITE_URL}/product/${product.product_id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });
  }

  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('is_published', true);

  if (blogs) {
    blogs.forEach((blog) => {
      if (!blog.slug) return;
      blogEntries.push({
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  }

  return [...staticRoutes, ...productEntries, ...blogEntries];
}


