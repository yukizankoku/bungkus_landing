import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { SchemaMarkup } from '@/components/common/SchemaMarkup';
import { Layout } from '@/components/layout/Layout';
import { useBlogBySlug } from '@/hooks/useBlogs';
import { Skeleton } from '@/components/ui/skeleton';
import { useSiteSetting } from '@/hooks/useSiteSettings';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const { data: blog, isLoading } = useBlogBySlug(slug || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-96 w-full rounded-2xl mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold mb-4">
              {t('Artikel tidak ditemukan', 'Article not found')}
            </h1>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Kembali ke Blog', 'Back to Blog')}
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const title = language === 'id' ? blog.title_id : blog.title_en;
  const content = language === 'id' ? blog.content_id : blog.content_en;
  const metaTitle = language === 'id' ? blog.meta_title_id : blog.meta_title_en;
  const metaDescription = language === 'id' ? blog.meta_description_id : blog.meta_description_en;
  const excerpt = language === 'id' ? blog.excerpt_id : blog.excerpt_en;
  
  const { data: seoSettings } = useSiteSetting('seo');
  const seo = seoSettings?.value as { site_url?: string } | undefined;
  const baseUrl = seo?.site_url || 'https://bungkusindonesia.com';
  const blogUrl = `${baseUrl}/blog/${slug}`;

  return (
    <Layout>
      <SEO
        title={metaTitle || title}
        description={metaDescription || excerpt || ''}
        url={blogUrl}
        type="article"
        image={blog.featured_image || undefined}
        pageKey="blog"
      />
      
      <SchemaMarkup 
        type="article"
        article={{
          title: metaTitle || title,
          description: metaDescription || excerpt || '',
          image: blog.featured_image || undefined,
          datePublished: blog.created_at || undefined,
          dateModified: blog.updated_at || blog.created_at || undefined,
        }}
        breadcrumbs={[
          { name: t('Beranda', 'Home'), url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: title, url: `/blog/${slug}` },
        ]}
      />

      {/* Hero Image */}
      {blog.featured_image && (
        <div className="w-full h-[50vh] relative">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${blog.featured_image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}

      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-8">
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Kembali ke Blog', 'Back to Blog')}
              </Link>
            </Button>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              {blog.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                  <Tag className="h-3 w-3" />
                  {blog.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(blog.created_at || '').toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-8">
              {title}
            </h1>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-a:text-secondary prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '') }}
            />
          </div>
        </div>
      </article>
    </Layout>
  );
}