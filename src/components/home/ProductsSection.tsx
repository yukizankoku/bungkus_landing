import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface Product {
  image: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

interface ProductsSectionProps {
  title?: string;
  subtitle?: string;
  items?: Product[];
}

export function ProductsSection({ title, subtitle, items }: ProductsSectionProps) {
  const { t } = useLanguage();

  const defaultItems: Product[] = [
    { 
      image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600', 
      name: 'Paper Bag', 
      description: t('Tas kertas ramah lingkungan', 'Eco-friendly paper bags'),
      category: 'Paper Bag',
      tags: ['Eco-Friendly']
    },
    { 
      image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600', 
      name: 'Food Container', 
      description: t('Wadah makanan food-grade', 'Food-grade containers'),
      category: 'Container',
      tags: ['Food Grade']
    },
    { 
      image: 'https://images.unsplash.com/photo-1617952385804-7b326fa42678?w=600', 
      name: 'Coffee Cup', 
      description: t('Gelas minuman', 'Beverage cups'),
      category: 'Paper Cup',
      tags: ['Hot & Cold']
    },
    { 
      image: 'https://images.unsplash.com/photo-1571211905393-6de67ff8fb61?w=600', 
      name: 'Custom Packaging', 
      description: t('Kemasan custom', 'Custom packaging'),
      category: 'Custom',
      tags: ['Branded']
    },
  ];

  const displayItems = items?.length ? items : defaultItems;
  const displayTitle = title || t('Produk Kami', 'Our Products');
  const displaySubtitle = subtitle || t('Temukan berbagai solusi kemasan berkualitas kami.', 'Discover our wide range of quality packaging solutions.');

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {displaySubtitle}
          </p>
        </div>

        {/* Modern 2026 Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayItems.map((product, index) => (
            <div
              key={index}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card */}
              <div className="relative bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-3">
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
                      <Badge variant="secondary" className="bg-white/90 text-primary backdrop-blur-sm font-medium shadow-sm">
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
                      {product.tags.slice(0, 2).map((tag, i) => (
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

        <div className="text-center mt-16">
          <Button asChild size="lg" className="gap-2 rounded-full px-8">
            <Link to="/produk/katalog">
              {t('Lihat Semua Produk', 'View All Products')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
