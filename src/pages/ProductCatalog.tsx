import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageContent } from '@/hooks/usePageContent';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CTASection } from '@/components/home/CTASection';

interface Product {
  image: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
}

export default function ProductCatalog() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('product-catalog');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  const hero = {
    title: content?.hero?.title || t('Katalog Produk', 'Product Catalog'),
    subtitle: content?.hero?.subtitle || t('Temukan koleksi lengkap produk kemasan berkualitas kami', 'Discover our complete collection of quality packaging products'),
    image: heroImage,
  };

  const products: Product[] = content?.products || [];
  
  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  // Filter products by category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
        </section>
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={content?.seo?.title || hero.title}
        description={content?.seo?.description || hero.subtitle}
        pageKey="product-catalog"
      />
      
      {/* Hero Section */}
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

      {/* Category Filter */}
      {categories.length > 1 && (
        <section className="py-8 bg-muted/30 border-b border-border/50 sticky top-20 z-40 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border'
                  }`}
                >
                  {category === 'all' ? t('Semua', 'All') : category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid - Modern 2026 Design */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {t('Belum ada produk yang ditambahkan.', 'No products have been added yet.')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('Kelola produk melalui panel admin.', 'Manage products through the admin panel.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card */}
                  <div className="relative bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                    {/* Image Container */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Category Badge */}
                      {product.category && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-primary backdrop-blur-sm font-medium">
                            {product.category}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      
                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {product.tags.slice(0, 3).map((tag, i) => (
                            <span 
                              key={i} 
                              className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hover Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
