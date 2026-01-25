import { useParams, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomPageBySlugRootLevel, useCustomPageBySlugWithPrefix } from '@/hooks/useCustomPages';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/common/SEO';
import BlockRenderer from '@/components/common/BlockRenderer';
import { Loader2 } from 'lucide-react';
import NotFound from './NotFound';

export default function CustomPage() {
  const { slug, subslug } = useParams();
  const location = useLocation();
  const { language } = useLanguage();
  
  // Combine slug and subslug for nested paths like "industri/kardus"
  const fullSlug = subslug ? `${slug}/${subslug}` : slug;
  
  // Determine if we're on /p/:slug route or root /:slug route
  const isPrefixedRoute = location.pathname.startsWith('/p/');
  
  // Use appropriate hook based on route
  const rootQuery = useCustomPageBySlugRootLevel(fullSlug || '');
  const prefixQuery = useCustomPageBySlugWithPrefix(fullSlug || '');
  
  // Select the correct query based on route
  const { data: page, isLoading, error } = isPrefixedRoute ? prefixQuery : rootQuery;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!page || error) {
    return <NotFound />;
  }

  const title = language === 'en' ? page.title_en : page.title_id;
  const metaTitle = language === 'en' ? (page.meta_title_en || page.title_en) : (page.meta_title_id || page.title_id);
  const metaDescription = language === 'en' ? page.meta_description_en : page.meta_description_id;
  const content = language === 'en' ? page.content_en : page.content_id;
  
  // Parse content blocks - content is stored as array of blocks
  const blocks = Array.isArray(content) ? content : [];

  // Check if first block is a hero to avoid duplicate title
  const firstBlockIsHero = blocks.length > 0 && blocks[0]?.type === 'hero';

  // Render based on template
  const renderContent = () => {
    // Create pageKey for custom pages to support per-page indexing
    const pageKey = `custom-${page.slug}`;

    if (page.template === 'blank') {
      return (
        <>
          <SEO
            title={metaTitle}
            description={metaDescription || ''}
            image={page.og_image || undefined}
            pageKey={pageKey}
          />
          <div className="min-h-screen">
            <BlockRenderer blocks={blocks} />
          </div>
        </>
      );
    }

    if (page.template === 'landing') {
      return (
        <Layout>
          <SEO
            title={metaTitle}
            description={metaDescription || ''}
            image={page.og_image || undefined}
            pageKey={pageKey}
          />
          <BlockRenderer blocks={blocks} />
        </Layout>
      );
    }

    // Default template - skip H1 if first block is Hero to prevent duplication
    return (
      <Layout>
        <SEO
          title={metaTitle}
          description={metaDescription || ''}
          image={page.og_image || undefined}
          pageKey={pageKey}
        />
        {firstBlockIsHero ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <div className="container mx-auto px-4 pt-24 pb-12">
            <article className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">{title}</h1>
              <BlockRenderer blocks={blocks} />
            </article>
          </div>
        )}
      </Layout>
    );
  };

  return renderContent();
}
