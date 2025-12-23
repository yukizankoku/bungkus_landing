import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLocation } from 'react-router-dom';

interface SchemaSettings {
  business_type?: 'Organization' | 'LocalBusiness' | 'Corporation';
  industry?: string;
  founding_date?: string;
  employee_count?: string;
  price_range?: string;
  opening_hours?: string;
  geo_lat?: string;
  geo_lng?: string;
  service_area?: string;
  aggregate_rating?: string;
  review_count?: string;
}

interface SchemaMarkupProps {
  type?: 'website' | 'article' | 'organization';
  article?: {
    title: string;
    description: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SchemaMarkup({ type = 'website', article, breadcrumbs }: SchemaMarkupProps) {
  const { data: settings } = useSiteSettings();
  const location = useLocation();

  const seoSetting = settings?.find(s => s.key === 'seo')?.value as {
    site_url?: string;
    site_name?: string;
    default_description_en?: string;
    default_description_id?: string;
    default_og_image?: string;
    schema?: SchemaSettings;
  } | undefined;

  const socialSetting = settings?.find(s => s.key === 'social')?.value as {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  } | undefined;

  const contactSetting = settings?.find(s => s.key === 'contact')?.value as {
    email?: string;
    phone?: string;
    address?: string;
  } | undefined;

  const logoSetting = settings?.find(s => s.key === 'logo')?.value as {
    light?: string;
    dark?: string;
  } | undefined;

  // No hardcoded fallbacks - all data must come from CMS
  const baseUrl = seoSetting?.site_url || '';
  const siteName = seoSetting?.site_name || '';
  const currentUrl = baseUrl ? `${baseUrl}${location.pathname}` : '';
  const schema = seoSetting?.schema;
  
  // Don't render schema markup if essential data is missing
  if (!baseUrl || !siteName) {
    return null;
  }

  // Build social links array
  const sameAs: string[] = [];
  if (socialSetting?.instagram) sameAs.push(`https://instagram.com/${socialSetting.instagram.replace('@', '')}`);
  if (socialSetting?.facebook) sameAs.push(socialSetting.facebook.startsWith('http') ? socialSetting.facebook : `https://facebook.com/${socialSetting.facebook}`);
  if (socialSetting?.linkedin) sameAs.push(socialSetting.linkedin.startsWith('http') ? socialSetting.linkedin : `https://linkedin.com/company/${socialSetting.linkedin}`);
  if (socialSetting?.youtube) sameAs.push(socialSetting.youtube.startsWith('http') ? socialSetting.youtube : `https://youtube.com/@${socialSetting.youtube}`);
  if (socialSetting?.twitter) sameAs.push(`https://twitter.com/${socialSetting.twitter.replace('@', '')}`);

  // Parse opening hours if available
  const parseOpeningHours = (hoursString?: string) => {
    if (!hoursString) return undefined;
    // Format: Mo-Fr 09:00-17:00, Sa 10:00-14:00
    const specs: Array<{ '@type': string; dayOfWeek: string[]; opens: string; closes: string }> = [];
    const parts = hoursString.split(',').map(p => p.trim());
    
    parts.forEach(part => {
      const match = part.match(/^(\w+(?:-\w+)?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (match) {
        const [, days, opens, closes] = match;
        const dayMap: Record<string, string> = {
          'Mo': 'Monday', 'Tu': 'Tuesday', 'We': 'Wednesday', 
          'Th': 'Thursday', 'Fr': 'Friday', 'Sa': 'Saturday', 'Su': 'Sunday'
        };
        
        let dayOfWeek: string[] = [];
        if (days.includes('-')) {
          const [start, end] = days.split('-');
          const allDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
          const startIdx = allDays.indexOf(start);
          const endIdx = allDays.indexOf(end);
          if (startIdx !== -1 && endIdx !== -1) {
            dayOfWeek = allDays.slice(startIdx, endIdx + 1).map(d => dayMap[d]);
          }
        } else {
          dayOfWeek = [dayMap[days]].filter(Boolean);
        }
        
        if (dayOfWeek.length > 0) {
          specs.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek,
            opens,
            closes
          });
        }
      }
    });
    
    return specs.length > 0 ? specs : undefined;
  };

  // Build organization/business schema based on type
  const businessType = schema?.business_type || 'Organization';
  
  const organizationSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': businessType,
    name: siteName,
    url: baseUrl,
    logo: logoSetting?.light || (baseUrl ? `${baseUrl}/og-image.png` : undefined),
    description: seoSetting?.default_description_en,
    email: contactSetting?.email,
    telephone: contactSetting?.phone,
    address: contactSetting?.address ? {
      '@type': 'PostalAddress',
      streetAddress: contactSetting.address,
    } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  // Add schema-specific fields
  if (schema?.industry) {
    organizationSchema.industry = schema.industry;
  }
  
  if (schema?.founding_date) {
    organizationSchema.foundingDate = schema.founding_date;
  }
  
  if (schema?.employee_count) {
    organizationSchema.numberOfEmployees = {
      '@type': 'QuantitativeValue',
      value: schema.employee_count
    };
  }

  // LocalBusiness specific fields
  if (businessType === 'LocalBusiness') {
    if (schema?.price_range) {
      organizationSchema.priceRange = schema.price_range;
    }
    
    const openingHours = parseOpeningHours(schema?.opening_hours);
    if (openingHours) {
      organizationSchema.openingHoursSpecification = openingHours;
    }
    
    if (schema?.geo_lat && schema?.geo_lng) {
      organizationSchema.geo = {
        '@type': 'GeoCoordinates',
        latitude: parseFloat(schema.geo_lat),
        longitude: parseFloat(schema.geo_lng)
      };
    }
    
    if (schema?.service_area) {
      organizationSchema.areaServed = schema.service_area.split(',').map(area => ({
        '@type': 'Place',
        name: area.trim()
      }));
    }
  }

  // Add aggregate rating if available
  if (schema?.aggregate_rating && schema?.review_count) {
    organizationSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: parseFloat(schema.aggregate_rating),
      reviewCount: parseInt(schema.review_count),
      bestRating: 5,
      worstRating: 1
    };
  }

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: currentUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl,
    },
  };

  // Article Schema (for blog posts)
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || seoSetting?.default_og_image || (baseUrl ? `${baseUrl}/og-image.png` : undefined),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: logoSetting?.light || (baseUrl ? `${baseUrl}/og-image.png` : undefined),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
  } : null;

  // BreadcrumbList Schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  } : null;

  // Clean undefined values from objects
  const cleanObject = (obj: Record<string, unknown>): Record<string, unknown> => {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    );
  };

  return (
    <Helmet>
      {/* Organization Schema - always present */}
      <script type="application/ld+json">
        {JSON.stringify(cleanObject(organizationSchema))}
      </script>

      {/* WebSite Schema - always present */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* WebPage Schema - for regular pages */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify(webPageSchema)}
        </script>
      )}

      {/* Article Schema - for blog posts */}
      {type === 'article' && articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}