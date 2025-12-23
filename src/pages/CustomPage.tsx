import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomPageBySlug } from '@/hooks/useCustomPages';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/common/SEO';
import BlockRenderer from '@/components/common/BlockRenderer';
import { Loader2 } from 'lucide-react';
import NotFound from './NotFound';

export default function CustomPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const { data: page, isLoading, error } = useCustomPageBySlug(slug || '');

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

  // Render based on template
  const renderContent = () => {
    if (page.template === 'blank') {
      return (
        <>
          <SEO
            title={metaTitle}
            description={metaDescription || ''}
            image={page.og_image || undefined}
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
          />
          <BlockRenderer blocks={blocks} />
        </Layout>
      );
    }

    // Default template
    return (
      <Layout>
        <SEO
          title={metaTitle}
          description={metaDescription || ''}
          image={page.og_image || undefined}
        />
        <div className="container mx-auto px-4 py-12">
          <article className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">{title}</h1>
            <BlockRenderer blocks={blocks} />
          </article>
        </div>
      </Layout>
    );
  };

  return renderContent();
}
