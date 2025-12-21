import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';

export default function CaseStudies() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('case-studies');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="Case Studies" description="Loading..." pageKey="case-studies" />
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="h-12 w-64 mx-auto mb-6 bg-white/20 rounded animate-pulse" />
            <div className="h-6 w-[400px] mx-auto bg-white/20 rounded animate-pulse" />
          </div>
        </section>
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const hero = { 
    ...(content?.hero || {
      title: 'Case Studies',
      subtitle: t('Temukan bagaimana bisnis lain berhasil dengan solusi kemasan kami.', 'Discover how other businesses have succeeded with our packaging solutions.')
    }),
    image: heroImage 
  };
  const caseStudies = content?.caseStudies || [
    { id: 1, title: t('PT Makanan Nusantara - Transformasi Kemasan', 'PT Makanan Nusantara - Packaging Transformation'), excerpt: t('Bagaimana kami membantu perusahaan F&B besar meningkatkan efisiensi kemasan hingga 40%.', 'How we helped a large F&B company improve packaging efficiency by 40%.'), category: 'Corporate', industry: 'Food & Beverage' },
    { id: 2, title: t('Dapur Mama Siti - Dari UMKM ke Brand Nasional', 'Dapur Mama Siti - From SME to National Brand'), excerpt: t('Cerita sukses UMKM kuliner yang berkembang dengan kemasan yang tepat.', 'Success story of a culinary SME that grew with the right packaging.'), category: 'UMKM', industry: 'Culinary' },
    { id: 3, title: t('Coffee Chain - Rebranding dengan Kemasan Baru', 'Coffee Chain - Rebranding with New Packaging'), excerpt: t('Proyek rebranding lengkap dengan kemasan custom untuk jaringan kopi premium.', 'Complete rebranding project with custom packaging for premium coffee chain.'), category: 'Corporate', industry: 'Coffee & Beverages' },
  ];

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
        style={hero.image ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${hero.image})` 
        } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              {hero.title}
            </h1>
            <p className="text-lg text-white/80">
              {hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
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

      <CTASection />
    </Layout>
  );
}
