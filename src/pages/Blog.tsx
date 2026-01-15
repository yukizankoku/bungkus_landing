import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { useBlogs } from '@/hooks/useBlogs';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function Blog() {
  const { language, t } = useLanguage();
  const { data: blogs, isLoading: blogsLoading } = useBlogs(true);
  const { data: pageContent, isLoading: contentLoading } = usePageContent('blog');

  // Show full loading state when content is loading
  if (contentLoading) {
    return (
      <Layout>
        <SEO title="Blog" description="" pageKey="blog" />
        {/* Hero Skeleton */}
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-48 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
          </div>
        </section>
        {/* Blog Grid Skeleton */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;
  
  const heroTitle = content?.hero?.title || 'Blog';
  const heroSubtitle = content?.hero?.subtitle || t('Artikel dan tips seputar kemasan.', 'Articles and tips about packaging.');

  return (
    <Layout>
      <SEO 
        title={content?.seo?.title || 'Blog'} 
        description={content?.seo?.description || t('Artikel dan tips seputar kemasan dari Bungkus Indonesia.', 'Articles and packaging tips from Bungkus Indonesia.')} 
        pageKey="blog"
      />
      
      {/* Hero Section */}
      <section 
        className="pt-32 pb-20 gradient-hero relative bg-cover bg-center"
        style={heroImage ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${heroImage})` 
        } : undefined}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">{heroTitle}</h1>
          <p className="text-lg text-white/80">{heroSubtitle}</p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => {
                const title = language === 'id' ? blog.title_id : blog.title_en;
                const excerpt = language === 'id' ? blog.excerpt_id : blog.excerpt_en;
                
                return (
                  <Link 
                    key={blog.id} 
                    to={`/blog/${blog.slug}`}
                    className="group"
                  >
                    <article className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Featured Image */}
                      <div className="aspect-video overflow-hidden bg-muted">
                        {blog.featured_image ? (
                          <img
                            src={blog.featured_image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          {blog.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" />
                              {blog.category}
                            </span>
                          )}
                          {blog.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(blog.created_at), 'dd MMM yyyy')}
                            </span>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
                          {title}
                        </h2>
                        
                        {/* Excerpt */}
                        {excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
                            {excerpt}
                          </p>
                        )}
                        
                        {/* Read More */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <span className="text-primary font-medium text-sm group-hover:underline">
                            {t('Baca selengkapnya', 'Read more')} →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('Belum ada artikel.', 'No articles yet.')}</p>
            </div>
          )}
        </div>
      </section>
      
      <CTASection 
        title={content?.cta?.title}
        subtitle={content?.cta?.subtitle}
        primaryButton={content?.cta?.primary_button}
        secondaryButton={content?.cta?.secondary_button}
        primaryButtonLink={content?.cta?.primary_button_link}
        secondaryButtonLink={content?.cta?.secondary_button_link}
      />
    </Layout>
  );
}
