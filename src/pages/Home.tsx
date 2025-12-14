import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Shield, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

export default function Home() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO
        title={t('Solusi Kemasan Terpercaya', 'Trusted Packaging Solutions')}
        description={t(
          'Bungkus Indonesia menyediakan solusi kemasan berkualitas untuk korporasi dan UMKM di seluruh Indonesia.',
          'Bungkus Indonesia provides quality packaging solutions for corporations and SMEs across Indonesia.'
        )}
        keywords="kemasan, packaging, food packaging, Indonesia, UMKM, corporate"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                {t('Mitra Kemasan Terpercaya', 'Your Trusted Packaging Partner')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6 animate-fade-up stagger-1">
              {t(
                'Solusi Kemasan untuk Bisnis Indonesia',
                'Packaging Solutions for Indonesian Businesses'
              )}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-up stagger-2">
              {t(
                'Dari korporasi hingga UMKM, kami menyediakan kemasan berkualitas dengan harga kompetitif dan layanan terbaik.',
                'From corporations to SMEs, we provide quality packaging with competitive prices and excellent service.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                <Link to="/solusi-korporat">
                  {t('Solusi Korporat', 'Corporate Solutions')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Link to="/solusi-umkm">
                  {t('Solusi UMKM', 'SME Solutions')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse-soft" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </Layout>
  );
}
