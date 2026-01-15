import React from 'react';
import { Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { iconMap } from '@/lib/iconMap';

function AboutPageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-12 w-80 mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto bg-white/20" />
        </div>
      </section>

      {/* Values Skeleton */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-8 rounded-2xl border border-border">
                <Skeleton className="w-14 h-14 rounded-xl mx-auto mb-4" />
                <Skeleton className="h-6 w-24 mx-auto mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function About() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('about');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="About" description="" pageKey="about" />
        <AboutPageSkeleton />
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const heroTitle = content?.hero?.title || t('Tentang Bungkus Indonesia', 'About Bungkus Indonesia');
  const heroSubtitle = content?.hero?.subtitle || t('Mitra kemasan terpercaya untuk korporasi dan UMKM di seluruh Indonesia sejak 2015.', 'Trusted packaging partner for corporations and SMEs across Indonesia since 2015.');
  
  const values = content?.values || [];
  const team = content?.team || [];

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || t('Tentang Kami', 'About Us')}
        description={content?.seo?.description || t('Tentang Bungkus Indonesia - mitra kemasan terpercaya untuk bisnis Indonesia.', 'About Bungkus Indonesia - trusted packaging partner for Indonesian businesses.')}
        pageKey="about"
      />
      <section 
        className="pt-32 pb-20 gradient-hero relative bg-cover bg-center"
        style={heroImage ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${heroImage})` 
        } : undefined}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            {heroTitle}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {values.length > 0 && (
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
      )}

      {team.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              {t('Tim Kami', 'Our Team')}
            </h2>
            <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
              {team.map((member: any, i: number) => (
                <div key={i} className="w-64 text-center group">
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                        <span className="text-3xl font-bold text-secondary">
                          {member.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
