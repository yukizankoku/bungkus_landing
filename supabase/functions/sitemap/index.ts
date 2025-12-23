import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get SEO settings to check if sitemap is enabled and get page indexing
    const { data: seoSettings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'seo')
      .single();

    const seo = seoSettings?.value as {
      sitemap_enabled?: boolean;
      page_indexing?: Record<string, boolean>;
      site_url?: string;
    } | null;

    // If sitemap is disabled, return empty response
    if (seo?.sitemap_enabled === false) {
      return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: corsHeaders,
      });
    }

    const baseUrl = seo?.site_url || 'https://bungkusindonesia.com';
    const pageIndexing = seo?.page_indexing || {};

    // Define all static pages with their routes
    const staticPages = [
      { key: 'home', path: '/', priority: '1.0', changefreq: 'weekly' },
      { key: 'about', path: '/tentang-kami', priority: '0.8', changefreq: 'monthly' },
      { key: 'products', path: '/produk', priority: '0.9', changefreq: 'weekly' },
      { key: 'product-catalog', path: '/produk/katalog', priority: '0.8', changefreq: 'weekly' },
      { key: 'corporate-solutions', path: '/solusi-korporat', priority: '0.8', changefreq: 'monthly' },
      { key: 'umkm-solutions', path: '/solusi-umkm', priority: '0.8', changefreq: 'monthly' },
      { key: 'case-studies', path: '/case-studies', priority: '0.7', changefreq: 'monthly' },
      { key: 'blog', path: '/blog', priority: '0.8', changefreq: 'daily' },
      { key: 'contact', path: '/hubungi-kami', priority: '0.7', changefreq: 'monthly' },
      { key: 'terms-conditions', path: '/terms', priority: '0.3', changefreq: 'yearly' },
      { key: 'privacy-policy', path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    ];

    // Filter pages based on indexing settings (default is indexed)
    const indexedPages = staticPages.filter(page => pageIndexing[page.key] !== false);

    // Get published blog posts
    const { data: blogs } = await supabase
      .from('blogs')
      .select('slug, updated_at, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    const today = new Date().toISOString().split('T')[0];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of indexedPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Add blog posts (if blog page is indexed)
    if (pageIndexing['blog'] !== false && blogs) {
      for (const blog of blogs) {
        const lastmod = blog.updated_at || blog.created_at || today;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/blog/${blog.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod.split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += '</urlset>';

    console.log(`Sitemap generated with ${indexedPages.length} pages and ${blogs?.length || 0} blog posts`);

    return new Response(xml, { headers: corsHeaders });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: corsHeaders,
    });
  }
});
