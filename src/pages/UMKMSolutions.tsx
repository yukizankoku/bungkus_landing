import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, DollarSign, Palette, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';

const benefits = [
  {
    icon: DollarSign,
    titleId: 'MOQ Fleksibel',
    titleEn: 'Flexible MOQ',
    descId: 'Minimum order quantity yang terjangkau untuk bisnis kecil dan menengah.',
    descEn: 'Affordable minimum order quantity for small and medium businesses.',
  },
  {
    icon: Lightbulb,
    titleId: 'Harga Kompetitif',
    titleEn: 'Competitive Pricing',
    descId: 'Harga yang bersaing tanpa mengorbankan kualitas produk.',
    descEn: 'Competitive prices without sacrificing product quality.',
  },
  {
    icon: Palette,
    titleId: 'Desain Custom',
    titleEn: 'Custom Design',
    descId: 'Bantuan desain kemasan sesuai identitas brand UMKM Anda.',
    descEn: 'Packaging design assistance according to your SME brand identity.',
  },
  {
    icon: Heart,
    titleId: 'Dukungan Penuh',
    titleEn: 'Full Support',
    descId: 'Tim kami siap membantu UMKM berkembang dengan kemasan yang tepat.',
    descEn: 'Our team is ready to help SMEs grow with the right packaging.',
  },
];

export default function UMKMSolutions() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO
        title={t('Solusi UMKM', 'SME Solutions')}
        description={t(
          'Solusi kemasan terjangkau untuk UMKM dengan MOQ fleksibel dan desain custom.',
          'Affordable packaging solutions for SMEs with flexible MOQ and custom design.'
        )}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              {t('Solusi Kemasan untuk UMKM', 'Packaging Solutions for SMEs')}
            </h1>
            <p className="text-lg text-white/80 mb-8">
              {t(
                'Kami memahami kebutuhan UMKM. Dapatkan kemasan berkualitas dengan harga terjangkau dan MOQ yang fleksibel.',
                'We understand SME needs. Get quality packaging at affordable prices with flexible MOQ.'
              )}
            </p>
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link to="/hubungi-kami">
                {t('Mulai Konsultasi', 'Start Consultation')}
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
              {t('Keunggulan untuk UMKM', 'Benefits for SMEs')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t(
                'Kami berkomitmen mendukung pertumbuhan UMKM Indonesia.',
                'We are committed to supporting the growth of Indonesian SMEs.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex gap-6 p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-colors hover-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {t(benefit.titleId, benefit.titleEn)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(benefit.descId, benefit.descEn)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Story Preview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              {t('Cerita Sukses UMKM', 'SME Success Stories')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t(
                'Lihat bagaimana UMKM lain berkembang bersama kami.',
                'See how other SMEs have grown with us.'
              )}
            </p>
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/case-studies">
                {t('Lihat Case Studies', 'View Case Studies')}
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
