import React from 'react';
import { Package, Coffee, ShoppingBag, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { CTASection } from '@/components/home/CTASection';

const productCategories = [
  {
    icon: Coffee,
    titleId: 'Kemasan Makanan',
    titleEn: 'Food Packaging',
    descId: 'Paper cup, paper bowl, food container, dan kemasan makanan lainnya.',
    descEn: 'Paper cup, paper bowl, food container, and other food packaging.',
    products: ['Paper Cup', 'Paper Bowl', 'Food Container', 'Lunch Box', 'Bento Box'],
  },
  {
    icon: ShoppingBag,
    titleId: 'Kemasan Retail',
    titleEn: 'Retail Packaging',
    descId: 'Paper bag, shopping bag, dan kemasan retail berkualitas.',
    descEn: 'Paper bag, shopping bag, and quality retail packaging.',
    products: ['Paper Bag', 'Shopping Bag', 'Carry Bag', 'Gift Bag'],
  },
  {
    icon: Package,
    titleId: 'Kemasan Custom',
    titleEn: 'Custom Packaging',
    descId: 'Solusi kemasan custom sesuai kebutuhan spesifik bisnis Anda.',
    descEn: 'Custom packaging solutions according to your specific business needs.',
    products: ['Custom Box', 'Branded Packaging', 'Special Design'],
  },
  {
    icon: Gift,
    titleId: 'Kemasan Premium',
    titleEn: 'Premium Packaging',
    descId: 'Kemasan premium untuk produk eksklusif dan hadiah.',
    descEn: 'Premium packaging for exclusive products and gifts.',
    products: ['Gift Box', 'Premium Container', 'Luxury Packaging'],
  },
];

export default function Products() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO
        title={t('Produk', 'Products')}
        description={t(
          'Katalog produk kemasan Bungkus Indonesia: kemasan makanan, retail, custom, dan premium.',
          'Bungkus Indonesia packaging product catalog: food, retail, custom, and premium packaging.'
        )}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              {t('Produk Kemasan Kami', 'Our Packaging Products')}
            </h1>
            <p className="text-lg text-white/80">
              {t(
                'Berbagai pilihan kemasan berkualitas untuk berbagai kebutuhan bisnis Anda.',
                'Various quality packaging options for your various business needs.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {productCategories.map((category, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover-lift"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <category.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                  {t(category.titleId, category.titleEn)}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t(category.descId, category.descEn)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.products.map((product, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Info */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                {t('Material Berkualitas', 'Quality Materials')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t(
                  'Semua produk kami menggunakan material berkualitas tinggi.',
                  'All our products use high-quality materials.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { titleId: 'Food-Grade', titleEn: 'Food-Grade', descId: 'Aman untuk makanan', descEn: 'Safe for food' },
                { titleId: 'Eco-Friendly', titleEn: 'Eco-Friendly', descId: 'Ramah lingkungan', descEn: 'Environmentally friendly' },
                { titleId: 'Bersertifikat', titleEn: 'Certified', descId: 'Standar industri', descEn: 'Industry standards' },
              ].map((item, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-card">
                  <h4 className="font-display font-semibold text-foreground mb-2">
                    {t(item.titleId, item.titleEn)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t(item.descId, item.descEn)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
