import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAllPageContent } from '@/hooks/usePageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const pageNames: Record<string, { en: string; id: string }> = {
  home: { en: 'Home', id: 'Beranda' },
  corporate: { en: 'Corporate Solutions', id: 'Solusi Korporat' },
  umkm: { en: 'UMKM Solutions', id: 'Solusi UMKM' },
  products: { en: 'Products', id: 'Produk' },
  'case-studies': { en: 'Case Studies', id: 'Studi Kasus' },
  about: { en: 'About', id: 'Tentang' },
  contact: { en: 'Contact', id: 'Kontak' },
  blog: { en: 'Blog', id: 'Blog' }
};

export default function AdminPages() {
  const { language } = useLanguage();
  const { data: pages, isLoading } = useAllPageContent();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Manage Pages' : 'Kelola Halaman'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages?.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {pageNames[page.page_key]?.[language] || page.page_key}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to={page.page_key === 'home' ? '/admin/home' : `/admin/pages/${page.page_key}`}>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Edit Page' : 'Edit Halaman'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
