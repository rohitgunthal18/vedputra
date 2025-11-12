import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://www.vedputra.store';

export async function GET() {
  const { data: products } = await supabase
    .from('products')
    .select('product_id, name, updated_at, meta_description')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${
    products
      ?.map(
        (product) => `
  <url>
    <loc>${SITE_URL}/product/${product.product_id}</loc>
    <lastmod>${product.updated_at ? new Date(product.updated_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${SITE_URL}/images/products/${product.product_id}.jpg</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>${product.meta_description || product.name}</image:caption>
    </image:image>
  </url>`
      )
      .join('') || ''
  }
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

