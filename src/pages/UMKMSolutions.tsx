import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, DollarSign, Palette, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  Lightbulb,
  Palette,
  Heart,
};

export default function UMKMSolutions() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('umkm-solutions');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="UMKM Solutions" description="Loading..." pageKey="umkm-solutions" />
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
      title: t('Solusi Kemasan untuk UMKM', 'Packaging Solutions for SMEs'),
      subtitle: t('Kami memahami kebutuhan UMKM. Dapatkan kemasan berkualitas dengan harga terjangkau dan MOQ yang fleksibel.', 'We understand SME needs. Get quality packaging at affordable prices with flexible MOQ.'),
      buttonText: t('Mulai Konsultasi', 'Start Consultation')
    }),
    image: heroImage 
  };
  const benefits = content?.benefits || [
    { icon: 'DollarSign', title: t('MOQ Fleksibel', 'Flexible MOQ'), description: t('Minimum order quantity yang terjangkau untuk bisnis kecil dan menengah.', 'Affordable minimum order quantity for small and medium businesses.') },
    { icon: 'Lightbulb', title: t('Harga Kompetitif', 'Competitive Pricing'), description: t('Harga yang bersaing tanpa mengorbankan kualitas produk.', 'Competitive prices without sacrificing product quality.') },
    { icon: 'Palette', title: t('Desain Custom', 'Custom Design'), description: t('Bantuan desain kemasan sesuai identitas brand UMKM Anda.', 'Packaging design assistance according to your SME brand identity.') },
    { icon: 'Heart', title: t('Dukungan Penuh', 'Full Support'), description: t('Tim kami siap membantu UMKM berkembang dengan kemasan yang tepat.', 'Our team is ready to help SMEs grow with the right packaging.') },
  ];
  const benefitsSection = content?.benefitsSection || { title: t('Keunggulan untuk UMKM', 'Benefits for SMEs'), subtitle: t('Kami berkomitmen mendukung pertumbuhan UMKM Indonesia.', 'We are committed to supporting the growth of Indonesian SMEs.') };
  const successSection = content?.successSection || { title: t('Cerita Sukses UMKM', 'SME Success Stories'), subtitle: t('Lihat bagaimana UMKM lain berkembang bersama kami.', 'See how other SMEs have grown with us.'), buttonText: t('Lihat Case Studies', 'View Case Studies') };

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

      {/* Success Story Preview */}
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
              <Link to="/case-studies">
                {successSection.buttonText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
