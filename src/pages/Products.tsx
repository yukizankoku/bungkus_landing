import React from 'react';
import { Package, ShieldCheck, Leaf, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { iconMap } from '@/lib/iconMap';

const materialIcons = [ShieldCheck, Leaf, Award];

function ProductsPageSkeleton() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-12 w-80 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full max-w-lg mx-auto bg-white/20" />
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-8 rounded-2xl border border-border">
                <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
                <Skeleton className="h-8 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Skeleton */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-8 rounded-2xl border border-border">
                  <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-5" />
                  <Skeleton className="h-6 w-24 mx-auto mb-3" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Products() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('products');

  if (isLoading) {
    return (
      <Layout>
        <SEO title="Products" description="" pageKey="products" />
        <ProductsPageSkeleton />
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const heroTitle = content?.hero?.title || t('Produk Kemasan Kami', 'Our Packaging Products');
  const heroSubtitle = content?.hero?.subtitle || t('Berbagai pilihan kemasan berkualitas untuk berbagai kebutuhan bisnis Anda.', 'Various quality packaging options for your various business needs.');
  
  const categories = content?.categories || [];
  const materials = content?.materials || [];
  const materialsSection = content?.materialsSection || { 
    title: t('Material Berkualitas', 'Quality Materials'), 
    subtitle: t('Semua produk kami menggunakan material berkualitas tinggi.', 'All our products use high-quality materials.') 
  };

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || t('Produk', 'Products')}
        description={content?.seo?.description || t('Katalog produk kemasan Bungkus Indonesia: kemasan makanan, retail, custom, dan premium.', 'Bungkus Indonesia packaging product catalog: food, retail, custom, and premium packaging.')}
        pageKey="products"
      />

      {/* Hero */}
      <section 
        className="pt-32 pb-20 gradient-hero relative bg-cover bg-center"
        style={heroImage ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${heroImage})` 
        } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg text-white/80">
              {heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      {categories.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category: any, index: number) => {
                const IconComponent = iconMap[category.icon] || Package;
                return (
                  <div
                    key={index}
                    className="p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover-lift"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                      <IconComponent className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(category.products || []).map((product: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Materials Info - Enhanced Section */}
      {materials.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                  {materialsSection.title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {materialsSection.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {materials.map((item: any, index: number) => {
                  const IconComponent = materialIcons[index] || ShieldCheck;
                  return (
                    <div 
                      key={index} 
                      className="relative text-center p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover-lift group overflow-hidden"
                    >
                      {/* Gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <IconComponent className="h-8 w-8 text-secondary" />
                        </div>
                        <h4 className="font-display text-xl font-semibold text-foreground mb-3">
                          {item.title}
                        </h4>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
