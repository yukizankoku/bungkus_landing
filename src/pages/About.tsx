import React from 'react';
import { Target, Eye, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';

export default function About() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO
        title={t('Tentang Kami', 'About Us')}
        description={t('Tentang Bungkus Indonesia - mitra kemasan terpercaya untuk bisnis Indonesia.', 'About Bungkus Indonesia - trusted packaging partner for Indonesian businesses.')}
      />
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            {t('Tentang Bungkus Indonesia', 'About Bungkus Indonesia')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t('Mitra kemasan terpercaya untuk korporasi dan UMKM di seluruh Indonesia.', 'Trusted packaging partner for corporations and SMEs across Indonesia.')}
          </p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Target, titleId: 'Misi', titleEn: 'Mission', descId: 'Menyediakan solusi kemasan berkualitas dan terjangkau untuk semua skala bisnis.', descEn: 'Providing quality and affordable packaging solutions for all business scales.' },
              { icon: Eye, titleId: 'Visi', titleEn: 'Vision', descId: 'Menjadi mitra kemasan pilihan utama di Indonesia.', descEn: 'To become the preferred packaging partner in Indonesia.' },
              { icon: Users, titleId: 'Nilai', titleEn: 'Values', descId: 'Kualitas, integritas, dan kemitraan jangka panjang.', descEn: 'Quality, integrity, and long-term partnership.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-card border border-border">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{t(item.titleId, item.titleEn)}</h3>
                <p className="text-muted-foreground">{t(item.descId, item.descEn)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </Layout>
  );
}
