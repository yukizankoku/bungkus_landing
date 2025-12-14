import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';

const benefits = [
  {
    icon: TrendingUp,
    titleId: 'Kapasitas Produksi Besar',
    titleEn: 'Large Production Capacity',
    descId: 'Mampu memenuhi pesanan dalam jumlah besar dengan konsistensi kualitas.',
    descEn: 'Able to fulfill large orders with consistent quality.',
  },
  {
    icon: Shield,
    titleId: 'Sertifikasi & Standar',
    titleEn: 'Certifications & Standards',
    descId: 'Produk kami memenuhi standar food-grade dan sertifikasi industri.',
    descEn: 'Our products meet food-grade standards and industry certifications.',
  },
  {
    icon: Truck,
    titleId: 'Pengiriman Nasional',
    titleEn: 'National Delivery',
    descId: 'Jaringan distribusi luas ke seluruh Indonesia.',
    descEn: 'Wide distribution network throughout Indonesia.',
  },
  {
    icon: Building2,
    titleId: 'Dedicated Account Manager',
    titleEn: 'Dedicated Account Manager',
    descId: 'Tim khusus yang siap melayani kebutuhan bisnis Anda.',
    descEn: 'A dedicated team ready to serve your business needs.',
  },
];

export default function CorporateSolutions() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO
        title={t('Solusi Korporat', 'Corporate Solutions')}
        description={t(
          'Solusi kemasan untuk korporasi dengan kapasitas produksi besar dan layanan profesional.',
          'Packaging solutions for corporations with large production capacity and professional services.'
        )}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              {t('Solusi Kemasan untuk Korporat', 'Packaging Solutions for Corporations')}
            </h1>
            <p className="text-lg text-white/80 mb-8">
              {t(
                'Kami menyediakan solusi kemasan berskala besar dengan kualitas konsisten untuk memenuhi kebutuhan industri Anda.',
                'We provide large-scale packaging solutions with consistent quality to meet your industry needs.'
              )}
            </p>
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link to="/hubungi-kami">
                {t('Jadwalkan Konsultasi', 'Schedule Consultation')}
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
              {t('Keunggulan untuk Korporat', 'Benefits for Corporations')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t(
                'Mengapa perusahaan-perusahaan besar memilih Bungkus Indonesia.',
                'Why large companies choose Bungkus Indonesia.'
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

      {/* Process */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              {t('Proses Kerjasama', 'Partnership Process')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', titleId: 'Konsultasi', titleEn: 'Consultation' },
              { step: '02', titleId: 'Penawaran', titleEn: 'Quotation' },
              { step: '03', titleId: 'Produksi', titleEn: 'Production' },
              { step: '04', titleId: 'Pengiriman', titleEn: 'Delivery' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-display font-bold text-secondary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">
                  {t(item.titleId, item.titleEn)}
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
