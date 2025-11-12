import { supabase } from '@/lib/supabase';

interface HeadProps {
  params: { productId: string };
}

export default async function Head({ params }: HeadProps) {
  const { productId } = params;
  const { data } = await supabase
    .from('products')
    .select('name, meta_title, meta_description, meta_keywords, image_url, product_id')
    .eq('product_id', productId)
    .eq('is_active', true)
    .single();

  const fallbackTitle = data?.name ? `${data.name} | VedPutra Organics` : 'VedPutra Organics Product';
  const title = data?.meta_title || fallbackTitle;
  const description =
    data?.meta_description ||
    'Discover farm to home superfoods from VedPutra Organics by rohitgunthal for balanced Indian nutrition.';
  const keywords =
    data?.meta_keywords ||
    'VedPutra Organics,rohitgunthal,organic superfoods,moringa powder,beetroot powder,roasted soyabean protein';
  const image = data?.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
  const canonical = `https://www.vedputra.store/product/${data?.product_id || productId}`;

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
      <meta property="og:type" content="product" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}


