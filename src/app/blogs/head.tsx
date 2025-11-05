export default function Head() {
  const title = 'VedPutra Organics Blog | Recipes, Wellness, and AI Shopping Tips';
  const description =
    'Explore VedPutra Organics blogs by rohitgunthal covering moringa recipes, beetroot benefits, roasted soyabean protein ideas, and AI-ready shopping insights.';
  const keywords =
    'VedPutra Organics blog,rohitgunthal wellness tips,moringa recipes,beetroot powder benefits,soyabean protein ideas,AI shopping seo';
  const canonical = 'https://www.vedputra.com/blogs';
  const image = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';

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
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}


