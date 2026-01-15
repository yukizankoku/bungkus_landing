import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';

function CaseStudiesPageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-12 w-56 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-md mx-auto bg-white/20" />
          </div>
        </div>
      </section>

      {/* Case Studies Grid Skeleton */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-6">
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function CaseStudies() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('case-studies');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="Case Studies" description="" pageKey="case-studies" />
        <CaseStudiesPageSkeleton />
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const heroTitle = content?.hero?.title || 'Case Studies';
  const heroSubtitle = content?.hero?.subtitle || t('Temukan bagaimana bisnis lain berhasil dengan solusi kemasan kami.', 'Discover how other businesses have succeeded with our packaging solutions.');
  
  const caseStudies = content?.caseStudies || [];

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || 'Case Studies'}
        description={content?.seo?.description || t('Cerita sukses klien Bungkus Indonesia dalam transformasi kemasan bisnis mereka.', 'Success stories of Bungkus Indonesia clients in transforming their business packaging.')}
        pageKey="case-studies"
      />

      {/* Hero */}
      <section 
        className="pt-32 pb-20 gradient-hero relative bg-cover bg-center"
        style={heroImage ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${heroImage})` 
        } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg text-white/80">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      {caseStudies.length > 0 ? (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((study: any) => (
                <div
                  key={study.id}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-secondary/50 transition-all duration-300 hover-lift"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="p-6">
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                        {study.category}
                      </span>
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        {study.industry}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-secondary transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {study.excerpt}
                    </p>
                    <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto text-secondary hover:text-secondary/80">
                      {t('Baca Selengkapnya', 'Read More')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">{t('Belum ada case study.', 'No case studies yet.')}</p>
          </div>
        </section>
      )}

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
