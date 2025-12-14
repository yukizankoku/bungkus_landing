import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';

export default function Blog() {
  const { t } = useLanguage();
  return (
    <Layout>
      <SEO title="Blog" description={t('Artikel dan tips seputar kemasan dari Bungkus Indonesia.', 'Articles and packaging tips from Bungkus Indonesia.')} />
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">Blog</h1>
          <p className="text-lg text-white/80">{t('Artikel dan tips seputar kemasan.', 'Articles and tips about packaging.')}</p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">{t('Belum ada artikel.', 'No articles yet.')}</p>
        </div>
      </section>
    </Layout>
  );
}
