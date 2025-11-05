import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://www.vedputra.com';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, title, excerpt, published_at, author_name, featured_image')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>VedPutra Organics Blog - Farm to Home Superfoods</title>
    <link>${SITE_URL}/blogs</link>
    <description>Expert tips, recipes, and wellness guides for moringa, beetroot, and plant-based protein from VedPutra Organics farm in Maharashtra</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <copyright>Copyright ${new Date().getFullYear()} VedPutra Organics. All rights reserved.</copyright>
    <managingEditor>info@vedputra.com (VedPutra Organics Team)</managingEditor>
    <webMaster>rohitgunthal1819@gmail.com (Rohit Gunthal)</webMaster>
    <category>Health &amp; Wellness</category>
    <category>Organic Food</category>
    <category>Nutrition</category>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>VedPutra Organics</title>
      <link>${SITE_URL}</link>
    </image>
    ${
      blogs
        ?.map(
          (blog) => `
    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${SITE_URL}/blog/${blog.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${blog.slug}</guid>
      <description>${escapeXml(blog.excerpt || '')}</description>
      <pubDate>${blog.published_at ? new Date(blog.published_at).toUTCString() : new Date().toUTCString()}</pubDate>
      <dc:creator>${escapeXml(blog.author_name || 'VedPutra Team')}</dc:creator>
      <category>Organic Superfoods</category>
      ${blog.featured_image ? `<enclosure url="${blog.featured_image}" type="image/jpeg" />` : ''}
    </item>`
        )
        .join('') || ''
    }
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

