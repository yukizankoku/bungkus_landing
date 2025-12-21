import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSetting } from '@/hooks/useSiteSettings';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  pageKey?: string;
}

interface SeoSettings {
  meta_robots?: string;
  page_indexing?: Record<string, boolean>;
}

export function SEO({
  title,
  description,
  keywords,
  image = '/og-image.png',
  url,
  type = 'website',
  pageKey,
}: SEOProps) {
  const siteTitle = 'Bungkus Indonesia';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  const { data: seoSettings } = useSiteSetting('seo');
  const seo = seoSettings?.value as SeoSettings | undefined;
  
  // Determine if this page should be indexed
  let robotsContent = seo?.meta_robots || 'index, follow';
  
  if (pageKey && seo?.page_indexing) {
    const isIndexed = seo.page_indexing[pageKey];
    if (isIndexed === false) {
      robotsContent = 'noindex, nofollow';
    }
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
