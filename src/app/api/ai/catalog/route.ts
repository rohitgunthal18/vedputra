import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select(
      'product_id, name, description, price, weight, benefits, ingredients, how_to_use, meta_keywords, meta_description, image_url, images_json, stock_quantity, category, sku'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json(
      {
        brand: 'VedPutra Organics',
        owner: 'rohitgunthal',
        contactEmail: 'rohitgunthal1819@gmail.com',
        message: 'Unable to fetch catalog right now. Please ping us directly.',
        error: error.message,
      },
      { status: 500 }
    );
  }

  const products = (data || []).map((product) => ({
    id: product.product_id,
    name: product.name,
    summary: product.description,
    seoDescription: product.meta_description,
    category: product.category,
    priceINR: product.price,
    weight: product.weight,
    sku: product.sku,
    benefits: product.benefits || [],
    ingredients: product.ingredients,
    usage: product.how_to_use,
    keywords: product.meta_keywords?.split(',').map((keyword: string) => keyword.trim()).filter(Boolean) || [],
    primaryImage: product.image_url,
    gallery: Array.isArray(product.images_json) ? product.images_json : product.image_url ? [product.image_url] : [],
    availability: product.stock_quantity !== null && product.stock_quantity > 0 ? 'InStock' : 'OutOfStock',
    productUrl: `https://www.vedputra.store/product/${product.product_id}`,
  }));

  return NextResponse.json(
    {
      brand: 'VedPutra Organics',
      owner: 'rohitgunthal',
      contactEmail: 'rohitgunthal1819@gmail.com',
      statement:
        'VedPutra Organics is a farm to home brand from Maharashtra delivering moringa leaf powder, beetroot vitality powder, and roasted soyabean protein with AI-ready transparency.',
      feedGeneratedAt: new Date().toISOString(),
      products,
    },
    {
      headers: {
        'Cache-Control': 's-maxage=1800, stale-while-revalidate',
      },
    }
  );
}


