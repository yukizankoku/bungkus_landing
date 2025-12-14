import React from 'react';
import { Package, Shield, Users, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  {
    icon: Package,
    titleId: 'Kapasitas Produksi Besar',
    titleEn: 'Large Production Capacity',
    descId: 'Mampu memenuhi kebutuhan kemasan dalam skala besar untuk berbagai industri.',
    descEn: 'Capable of meeting large-scale packaging needs for various industries.',
  },
  {
    icon: Shield,
    titleId: 'Food-Grade & Aman',
    titleEn: 'Food-Grade & Safe',
    descId: 'Material berkualitas tinggi yang aman untuk makanan dan minuman.',
    descEn: 'High-quality materials that are safe for food and beverages.',
  },
  {
    icon: Users,
    titleId: 'Kemitraan Jangka Panjang',
    titleEn: 'Long-term Partnership',
    descId: 'Kami fokus membangun hubungan bisnis yang berkelanjutan.',
    descEn: 'We focus on building sustainable business relationships.',
  },
  {
    icon: Zap,
    titleId: 'Custom Branding',
    titleEn: 'Custom Branding',
    descId: 'Desain kemasan custom sesuai identitas brand Anda.',
    descEn: 'Custom packaging design according to your brand identity.',
  },
];

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            {t('Mengapa Memilih Kami?', 'Why Choose Us?')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t(
              'Kami berkomitmen memberikan solusi kemasan terbaik untuk bisnis Anda.',
              'We are committed to providing the best packaging solutions for your business.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg transition-all duration-300 hover-lift"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <feature.icon className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {t(feature.titleId, feature.titleEn)}
              </h3>
              <p className="text-muted-foreground">
                {t(feature.descId, feature.descEn)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
