import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  image: string;
  name: string;
  description: string;
}

interface ProductsSectionProps {
  title?: string;
  subtitle?: string;
  items?: Product[];
}

export function ProductsSection({ title, subtitle, items }: ProductsSectionProps) {
  const { t, language } = useLanguage();

  const defaultItems: Product[] = [
    { image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600', name: 'Paper Bag', description: t('Tas kertas ramah lingkungan', 'Eco-friendly paper bags') },
    { image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600', name: 'Food Container', description: t('Wadah makanan food-grade', 'Food-grade containers') },
    { image: 'https://images.unsplash.com/photo-1617952385804-7b326fa42678?w=600', name: 'Coffee Cup', description: t('Gelas minuman', 'Beverage cups') },
    { image: 'https://images.unsplash.com/photo-1571211905393-6de67ff8fb61?w=600', name: 'Custom Packaging', description: t('Kemasan custom', 'Custom packaging') },
  ];

  const displayItems = items?.length ? items : defaultItems;
  const displayTitle = title || t('Produk Kami', 'Our Products');
  const displaySubtitle = subtitle || t('Temukan berbagai solusi kemasan berkualitas kami.', 'Discover our wide range of quality packaging solutions.');

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {displaySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayItems.map((product, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 hover-lift"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="gap-2">
            <Link to="/produk">
              {t('Lihat Semua Produk', 'View All Products')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}