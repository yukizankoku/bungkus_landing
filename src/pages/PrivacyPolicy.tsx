import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { usePageContent } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import DOMPurify from 'dompurify';

export default function PrivacyPolicy() {
  const { language, t } = useLanguage();
  const { data: pageContent, isLoading } = usePageContent('privacy-policy');

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-[500px] mx-auto bg-white/20" />
          </div>
        </section>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </section>
      </Layout>
    );
  }

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  const hero = content?.hero || { 
    title: t('Kebijakan Privasi', 'Privacy Policy'), 
    subtitle: t('Bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda', 'How we collect, use, and protect your information') 
  };
  const htmlContent = content?.content || '';
  const sanitizedContent = DOMPurify.sanitize(htmlContent);

  return (
    <Layout>
      <SEO
        title={content?.seo?.title || t('Kebijakan Privasi', 'Privacy Policy')}
        description={content?.seo?.description || t('Kebijakan Privasi Bungkus Indonesia', 'Bungkus Indonesia Privacy Policy')}
        pageKey="privacy-policy"
      />
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            {hero.title}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-display prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </section>
    </Layout>
  );
}
