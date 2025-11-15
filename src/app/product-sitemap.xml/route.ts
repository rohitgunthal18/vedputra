import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://www.vedputra.store';

// Escape XML special characters
function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// URL encode product ID to handle special characters
function encodeProductId(productId: string | null | undefined): string {
  if (!productId) return '';
  return encodeURIComponent(String(productId));
}

export async function GET() {
  const { data: products } = await supabase
    .from('products')
    .select('product_id, name, updated_at, meta_description, image_url, images_json')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  // Build sitemap entries
  const urlEntries = (products || [])
    .filter((product) => product.product_id) // Only include products with valid IDs
    .map((product) => {
      const productId = encodeProductId(product.product_id);
      const productName = escapeXml(product.name);
      const metaDescription = escapeXml(product.meta_description || product.name);
      const lastmod = product.updated_at 
        ? new Date(product.updated_at).toISOString() 
        : new Date().toISOString();
      
      // Get the first available image
      const productImage = product.images_json && Array.isArray(product.images_json) && product.images_json.length > 0
        ? product.images_json[0]
        : product.image_url || null;
      
      // Build image tag only if image exists
      const imageTag = productImage
        ? `<image:image>
      <image:loc>${escapeXml(productImage)}</image:loc>
      <image:title>${productName}</image:title>
      <image:caption>${metaDescription}</image:caption>
    </image:image>`
        : '';

      return `  <url>
    <loc>${SITE_URL}/product/${productId}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag ? '\n    ' + imageTag : ''}
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries || '  <!-- No products found -->'}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

