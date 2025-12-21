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

export default function Home() {
  const { language } = useLanguage();
  const { data: pageContent } = usePageContent('home');

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;

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