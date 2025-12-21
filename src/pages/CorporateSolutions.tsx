import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  TrendingUp,
  Shield,
  Truck,
};

export default function CorporateSolutions() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('corporate-solutions');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="Corporate Solutions" description="Loading..." pageKey="corporate-solutions" />
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="h-12 w-96 mx-auto mb-6 bg-white/20 rounded animate-pulse" />
            <div className="h-6 w-[500px] mx-auto bg-white/20 rounded animate-pulse" />
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
      title: t('Solusi Kemasan untuk Korporat', 'Packaging Solutions for Corporations'), 
      subtitle: t('Kami menyediakan solusi kemasan berskala besar dengan kualitas konsisten untuk memenuhi kebutuhan industri Anda.', 'We provide large-scale packaging solutions with consistent quality to meet your industry needs.'),
      buttonText: t('Jadwalkan Konsultasi', 'Schedule Consultation')
    }),
    image: heroImage 
  };
  const benefits = content?.benefits || [
    { icon: 'TrendingUp', title: t('Kapasitas Produksi Besar', 'Large Production Capacity'), description: t('Mampu memenuhi pesanan dalam jumlah besar dengan konsistensi kualitas.', 'Able to fulfill large orders with consistent quality.') },
    { icon: 'Shield', title: t('Sertifikasi & Standar', 'Certifications & Standards'), description: t('Produk kami memenuhi standar food-grade dan sertifikasi industri.', 'Our products meet food-grade standards and industry certifications.') },
    { icon: 'Truck', title: t('Pengiriman Nasional', 'National Delivery'), description: t('Jaringan distribusi luas ke seluruh Indonesia.', 'Wide distribution network throughout Indonesia.') },
    { icon: 'Building2', title: 'Dedicated Account Manager', description: t('Tim khusus yang siap melayani kebutuhan bisnis Anda.', 'A dedicated team ready to serve your business needs.') },
  ];
  const benefitsSection = content?.benefitsSection || { title: t('Keunggulan untuk Korporat', 'Benefits for Corporations'), subtitle: t('Mengapa perusahaan-perusahaan besar memilih Bungkus Indonesia.', 'Why large companies choose Bungkus Indonesia.') };
  const processSection = content?.processSection || { title: t('Proses Kerjasama', 'Partnership Process') };
  const processSteps = content?.processSteps || [
    { step: '01', title: t('Konsultasi', 'Consultation') },
    { step: '02', title: t('Penawaran', 'Quotation') },
    { step: '03', title: t('Produksi', 'Production') },
    { step: '04', title: t('Pengiriman', 'Delivery') },
  ];

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || t('Solusi Korporat', 'Corporate Solutions')}
        description={content?.seo?.description || t('Solusi kemasan untuk korporasi dengan kapasitas produksi besar dan layanan profesional.', 'Packaging solutions for corporations with large production capacity and professional services.')}
        pageKey="corporate-solutions"
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
            <p className="text-lg text-white/80 mb-8">
              {hero.subtitle}
            </p>
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link to="/hubungi-kami">
                {hero.buttonText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
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
              const IconComponent = iconMap[benefit.icon] || Building2;
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

      {/* Process */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              {processSection.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {processSteps.map((item: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-display font-bold text-secondary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
