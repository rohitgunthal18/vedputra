import { supabase } from '@/lib/supabase';

interface HeadProps {
  params: { slug: string };
}

export default async function Head({ params }: HeadProps) {
  const { slug } = params;
  const { data } = await supabase
    .from('blogs')
    .select('title, meta_title, meta_description, meta_keywords, featured_image, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  const fallbackTitle = data?.title ? `${data.title} | VedPutra Organics Blog` : 'VedPutra Organics Blog';
  const title = data?.meta_title || fallbackTitle;
  const description =
    data?.meta_description ||
    'Read the VedPutra Organics wellness blog curated by rohitgunthal for recipes, benefits, and farm to home nutrition tips.';
  const keywords =
    data?.meta_keywords ||
    'VedPutra Organics blog,rohitgunthal,organic recipes,moringa tips,beetroot benefits,soyabean protein ideas';
  const image = data?.featured_image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
  const canonical = `https://www.vedputra.store/blog/${data?.slug || slug}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}


