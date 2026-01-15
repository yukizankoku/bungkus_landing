import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { ClientsSection } from '@/components/home/ClientsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';

function HomePageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="relative min-h-screen flex items-center gradient-hero">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-8 bg-white/20" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto mb-10 bg-white/20" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-40 bg-white/20" />
              <Skeleton className="h-12 w-40 bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="py-16 gradient-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-12 w-24 mx-auto mb-2 bg-white/20" />
                <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('home');

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;

  if (isLoading) {
    return (
      <Layout>
        <SEO
          title="Bungkus Indonesia - Solusi Kemasan"
          description=""
          keywords="kemasan, packaging, food packaging, Indonesia, UMKM, corporate"
          pageKey="home"
        />
        <HomePageSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={content?.meta_title || 'Bungkus Indonesia - Solusi Kemasan'}
        description={content?.meta_description || ''}
        keywords="kemasan, packaging, food packaging, Indonesia, UMKM, corporate"
        pageKey="home"
      />

      {/* Hero Section with Carousel */}
      <HeroCarousel content={content?.hero} />

      {/* Features Section */}
      <FeaturesSection 
        title={content?.features?.title}
        subtitle={content?.features?.subtitle}
        items={content?.features?.items}
      />

      {/* Stats Section */}
      <StatsSection items={content?.stats?.items} />

      {/* Products Section */}
      <ProductsSection 
        title={content?.products?.title}
        subtitle={content?.products?.subtitle}
        items={content?.products?.items}
      />

      {/* Clients Section */}
      <ClientsSection 
        title={content?.clients?.title}
        subtitle={content?.clients?.subtitle}
        logos={content?.clients?.logos}
        marqueeSpeed={content?.clients?.marquee_speed}
      />

      {/* Testimonials Section */}
      <TestimonialsSection 
        title={content?.testimonials?.title}
        subtitle={content?.testimonials?.subtitle}
        items={content?.testimonials?.items}
      />

      {/* CTA Section */}
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
