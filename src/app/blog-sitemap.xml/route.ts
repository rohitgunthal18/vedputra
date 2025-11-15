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

// URL encode slug to handle special characters
function encodeSlug(slug: string | null | undefined): string {
  if (!slug) return '';
  return encodeURIComponent(String(slug));
}

export async function GET() {
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, title, updated_at, published_at, meta_description, featured_image')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  // Build sitemap entries
  const urlEntries = (blogs || [])
    .filter((blog) => blog.slug) // Only include blogs with valid slugs
    .map((blog) => {
      const slug = encodeSlug(blog.slug);
      const title = escapeXml(blog.title);
      const metaDescription = escapeXml(blog.meta_description || blog.title);
      const lastmod = blog.updated_at 
        ? new Date(blog.updated_at).toISOString() 
        : new Date().toISOString();
      const pubDate = blog.published_at 
        ? new Date(blog.published_at).toISOString() 
        : new Date().toISOString();
      
      // Build image tag only if image exists
      const imageTag = blog.featured_image
        ? `    <image:image>
      <image:loc>${escapeXml(blog.featured_image)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${metaDescription}</image:caption>
    </image:image>`
        : '';

      return `  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>VedPutra Organics Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>${imageTag ? '\n    ' + imageTag : ''}
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries || '  <!-- No blogs found -->'}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

