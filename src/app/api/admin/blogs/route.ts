import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET is not configured or using default value');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return { authenticated: false, error: 'Unauthorized' };

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !adminUser || !adminUser.is_active) {
      return { authenticated: false, error: 'Unauthorized' };
    }
    return { authenticated: true, admin: adminUser };
  } catch (error) {
    return { authenticated: false, error: 'Unauthorized' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const { data, error } = await supabaseAdmin
        .from('blogs')
        .select('is_published, views_count');

      if (error) throw error;

      const total = data?.length || 0;
      const published = data?.filter(b => b.is_published).length || 0;
      const draft = total - published;
      const totalViews = data?.reduce((sum, b) => sum + (b.views_count || 0), 0) || 0;

      return NextResponse.json({
        success: true,
        stats: { total, published, draft, totalViews }
      });
    }

    const { data: blogs, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, blogs: blogs || [] });
  } catch (error) {
    console.error('Admin blogs GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const blogData = await request.json();

    if (!blogData.title || !blogData.slug || !blogData.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const insertData = {
      title: blogData.title,
      slug: blogData.slug,
      excerpt: blogData.excerpt || null,
      content: blogData.content,
      featured_image: blogData.featured_image || null,
      image_alt: blogData.image_alt || null,
      category: blogData.category || null,
      related_product_ids: blogData.related_product_ids || null,
      meta_title: blogData.meta_title || blogData.title,
      meta_description: blogData.meta_description || blogData.excerpt,
      meta_keywords: blogData.meta_keywords || null,
      og_title: blogData.og_title || blogData.title,
      og_description: blogData.og_description || blogData.excerpt,
      og_image: blogData.og_image || blogData.featured_image,
      canonical_url: blogData.canonical_url || null,
      author_name: blogData.author_name || 'VedPutra Team',
      read_time_minutes: blogData.read_time_minutes || null,
      is_published: blogData.is_published || false,
      is_featured: blogData.is_featured || false,
      published_at: blogData.is_published ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, blog: data });
  } catch (error: any) {
    console.error('Admin blogs POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, blogData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid blog ID' }, { status: 400 });
    }

    if (action === 'toggleStatus' && typeof blogData?.is_published === 'boolean') {
      const { data, error } = await supabaseAdmin
        .from('blogs')
        .update({
          is_published: blogData.is_published,
          published_at: blogData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, blog: data });
    }

    if (action === 'update' && blogData) {
      const updateData: any = { updated_at: new Date().toISOString() };

      const fields = [
        'title', 'slug', 'excerpt', 'content', 'featured_image', 'image_alt',
        'category', 'related_product_ids', 'meta_title', 'meta_description',
        'meta_keywords', 'og_title', 'og_description', 'og_image', 'canonical_url',
        'author_name', 'read_time_minutes', 'is_featured'
      ];

      fields.forEach(field => {
        if (blogData[field] !== undefined) updateData[field] = blogData[field];
      });

      if (blogData.is_published !== undefined) {
        updateData.is_published = blogData.is_published;
        updateData.published_at = blogData.is_published ? new Date().toISOString() : null;
      }

      const { data, error } = await supabaseAdmin
        .from('blogs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, blog: data });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin blogs PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid blog ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Admin blogs DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

