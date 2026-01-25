import { useParams } from 'react-router-dom';
import { usePageRoutes } from '@/hooks/usePageContent';
import { useCustomPageBySlugRootLevel } from '@/hooks/useCustomPages';
import CustomPage from '@/pages/CustomPage';
import NotFound from '@/pages/NotFound';
import { Loader2 } from 'lucide-react';

// Built-in page components
import CorporateSolutions from '@/pages/CorporateSolutions';
import UMKMSolutions from '@/pages/UMKMSolutions';
import Products from '@/pages/Products';
import ProductCatalog from '@/pages/ProductCatalog';
import CaseStudies from '@/pages/CaseStudies';
import Blog from '@/pages/Blog';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';

// Map page_key to component
const pageComponents: Record<string, React.ComponentType> = {
  'product-catalog': ProductCatalog,
  'products': Products,
  'corporate-solutions': CorporateSolutions,
  'umkm-solutions': UMKMSolutions,
  'about': About,
  'contact': Contact,
  'case-studies': CaseStudies,
  'blog': Blog,
  'privacy-policy': PrivacyPolicy,
  'terms-conditions': TermsConditions,
};

/**
 * Dynamic router that checks both built-in pages (page_content table) 
 * and custom pages (custom_pages table) for matching slugs.
 * 
 * Priority:
 * 1. Check built-in pages first (from page_content with use_prefix = false)
 * 2. Then check custom pages (from custom_pages with use_prefix = false)
 * 3. If nothing matches, show 404
 */
export default function DynamicBuiltInPageRouter() {
  const { slug, subslug } = useParams();
  
  // Combine slug and subslug for nested paths like "produk/industri"
  const fullSlug = subslug ? `${slug}/${subslug}` : slug;
  
  const { data: pageRoutes, isLoading: isLoadingRoutes } = usePageRoutes();
  const { data: customPage, isLoading: isLoadingCustom } = useCustomPageBySlugRootLevel(fullSlug || '');

  if (isLoadingRoutes || isLoadingCustom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // First, check if this slug matches a built-in page
  const matchedBuiltInPage = pageRoutes?.find(
    (p) => p.slug === fullSlug && !p.use_prefix
  );

  if (matchedBuiltInPage) {
    const Component = pageComponents[matchedBuiltInPage.page_key];
    if (Component) {
      return <Component />;
    }
  }

  // Next, check if this slug matches a custom page
  if (customPage) {
    return <CustomPage />;
  }

  // Nothing matched - show 404
  return <NotFound />;
}
