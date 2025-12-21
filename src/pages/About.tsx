import React from 'react';
import { Target, Eye, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Eye,
  Users,
};

export default function About() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('about');

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-[500px] mx-auto bg-white/20" />
          </div>
        </section>
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const hero = { 
    ...(content?.hero || { title: t('Tentang Bungkus Indonesia', 'About Bungkus Indonesia'), subtitle: t('Mitra kemasan terpercaya untuk korporasi dan UMKM di seluruh Indonesia sejak 2015.', 'Trusted packaging partner for corporations and SMEs across Indonesia since 2015.') }),
    image: heroImage 
  };
  const values = content?.values || [
    { icon: 'Target', title: t('Misi', 'Mission'), description: t('Menyediakan solusi kemasan berkualitas dan terjangkau untuk semua skala bisnis.', 'Providing quality and affordable packaging solutions for all business scales.') },
    { icon: 'Eye', title: t('Visi', 'Vision'), description: t('Menjadi mitra kemasan pilihan utama di Indonesia.', 'To become the preferred packaging partner in Indonesia.') },
    { icon: 'Users', title: t('Nilai', 'Values'), description: t('Kualitas, integritas, dan kemitraan jangka panjang.', 'Quality, integrity, and long-term partnership.') },
  ];

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || t('Tentang Kami', 'About Us')}
        description={content?.seo?.description || t('Tentang Bungkus Indonesia - mitra kemasan terpercaya untuk bisnis Indonesia.', 'About Bungkus Indonesia - trusted packaging partner for Indonesian businesses.')}
        pageKey="about"
      />
      <section 
        className="pt-32 pb-20 gradient-hero relative bg-cover bg-center"
        style={hero.image ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${hero.image})` 
        } : undefined}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            {hero.title}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {values.map((item: any, i: number) => {
              const IconComponent = iconMap[item.icon] || Target;
              return (
                <div key={i} className="text-center p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover-lift">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <CTASection />
    </Layout>
  );
}
