import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { iconMap } from '@/lib/iconMap';

function UMKMPageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-12 w-80 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto mb-8 bg-white/20" />
            <Skeleton className="h-12 w-48 mx-auto bg-white/20" />
          </div>
        </div>
      </section>

      {/* Benefits Skeleton */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-6 p-8 rounded-2xl border border-border">
                <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Skeleton */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-12 w-48 mx-auto" />
          </div>
        </div>
      </section>
    </>
  );
}

export default function UMKMSolutions() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('umkm-solutions');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="UMKM Solutions" description="" pageKey="umkm-solutions" />
        <UMKMPageSkeleton />
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const heroTitle = content?.hero?.title || t('Solusi Kemasan untuk UMKM', 'Packaging Solutions for SMEs');
  const heroSubtitle = content?.hero?.subtitle || t('Kami memahami kebutuhan UMKM. Dapatkan kemasan berkualitas dengan harga terjangkau dan MOQ yang fleksibel.', 'We understand SME needs. Get quality packaging at affordable prices with flexible MOQ.');
  const heroButtonText = content?.hero?.buttonText || t('Mulai Konsultasi', 'Start Consultation');
  
  const benefits = content?.benefits || [];
  const benefitsSection = content?.benefitsSection || { 
    title: t('Keunggulan untuk UMKM', 'Benefits for SMEs'), 
    subtitle: t('Kami berkomitmen mendukung pertumbuhan UMKM Indonesia.', 'We are committed to supporting the growth of Indonesian SMEs.') 
  };
  const successSection = content?.successSection || { 
    title: t('Cerita Sukses UMKM', 'SME Success Stories'), 
    subtitle: t('Lihat bagaimana UMKM lain berkembang bersama kami.', 'See how other SMEs have grown with us.'), 
    buttonText: t('Lihat Case Studies', 'View Case Studies'),
    buttonLink: '/case-studies',
    isVisible: true
  };
  const showSuccessSection = successSection.isVisible !== false;

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || t('Solusi UMKM', 'SME Solutions')}
        description={content?.seo?.description || t('Solusi kemasan terjangkau untuk UMKM dengan MOQ fleksibel dan desain custom.', 'Affordable packaging solutions for SMEs with flexible MOQ and custom design.')}
        pageKey="umkm-solutions"
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
            <p className="text-lg text-white/80 mb-8">
              {heroSubtitle}
            </p>
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link to="/hubungi-kami">
                {heroButtonText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {benefits.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                {benefitsSection.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {benefitsSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {benefits.map((benefit: any, index: number) => {
                const IconComponent = iconMap[benefit.icon] || Heart;
                return (
                  <div
                    key={index}
                    className="flex gap-6 p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-colors hover-lift"
                  >
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-7 w-7 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Success Story Preview */}
      {showSuccessSection && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                {successSection.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {successSection.subtitle}
              </p>
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link to={successSection.buttonLink || '/case-studies'}>
                  {successSection.buttonText}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
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
