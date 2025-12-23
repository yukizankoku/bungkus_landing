import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  pageKey?: string;
  noIndex?: boolean;
}

interface SeoSettings {
  meta_robots?: string;
  page_indexing?: Record<string, boolean>;
  site_url?: string;
  site_name?: string;
  default_og_image?: string;
}

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  pageKey,
  noIndex = false,
}: SEOProps) {
  const location = useLocation();
  const { language } = useLanguage();
  
  const { data: seoSettings } = useSiteSetting('seo');
  const seo = seoSettings?.value as SeoSettings | undefined;
  
  const siteTitle = seo?.site_name || 'Bungkus Indonesia';
  const baseUrl = seo?.site_url || 'https://bungkusindonesia.com';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const currentPath = location.pathname;
  const canonicalUrl = url || `${baseUrl}${currentPath}`;
  const ogImage = image || seo?.default_og_image || `${baseUrl}/og-image.png`;
  
  // Determine if this page should be indexed
  let robotsContent = seo?.meta_robots || 'index, follow';
  
  if (noIndex) {
    robotsContent = 'noindex, nofollow';
  } else if (pageKey && seo?.page_indexing) {
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
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang for multilingual SEO */}
      <link rel="alternate" hrefLang="id" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={language === 'id' ? 'id_ID' : 'en_US'} />
      <meta property="og:locale:alternate" content={language === 'id' ? 'en_US' : 'id_ID'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
