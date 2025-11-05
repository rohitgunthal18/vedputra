import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://www.vedputra.com';

export async function GET() {
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, title, updated_at, published_at, meta_description, featured_image')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${
    blogs
      ?.map(
        (blog) => `
  <url>
    <loc>${SITE_URL}/blog/${blog.slug}</loc>
    <lastmod>${blog.updated_at ? new Date(blog.updated_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>VedPutra Organics Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${blog.published_at ? new Date(blog.published_at).toISOString() : new Date().toISOString()}</news:publication_date>
      <news:title>${blog.title}</news:title>
    </news:news>
    ${
      blog.featured_image
        ? `
    <image:image>
      <image:loc>${blog.featured_image}</image:loc>
      <image:title>${blog.title}</image:title>
      <image:caption>${blog.meta_description || blog.title}</image:caption>
    </image:image>`
        : ''
    }
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

