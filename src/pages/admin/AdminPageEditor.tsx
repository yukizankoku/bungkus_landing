import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageContent, useUpdatePageContent } from '@/hooks/usePageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminPageEditor() {
  const { pageKey } = useParams<{ pageKey: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: page, isLoading } = usePageContent(pageKey || '');
  const updatePage = useUpdatePageContent();

  const [contentEn, setContentEn] = useState<Record<string, any>>({});
  const [contentId, setContentId] = useState<Record<string, any>>({});

  useEffect(() => {
    if (page) {
      setContentEn(page.content_en || {});
      setContentId(page.content_id || {});
    }
  }, [page]);

  const handleSave = () => {
    if (!pageKey) return;
    updatePage.mutate({ pageKey, contentEn, contentId });
  };

  const updateHero = (lang: 'en' | 'id', field: string, value: string) => {
    if (lang === 'en') {
      setContentEn(prev => ({
        ...prev,
        hero: { ...prev.hero, [field]: value }
      }));
    } else {
      setContentId(prev => ({
        ...prev,
        hero: { ...prev.hero, [field]: value }
      }));
    }
  };

  const updateMeta = (lang: 'en' | 'id', field: string, value: string) => {
    if (lang === 'en') {
      setContentEn(prev => ({ ...prev, [field]: value }));
    } else {
      setContentId(prev => ({ ...prev, [field]: value }));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold capitalize">{pageKey}</h1>
          </div>
          <Button onClick={handleSave} disabled={updatePage.isPending}>
            {updatePage.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {language === 'en' ? 'Save Changes' : 'Simpan'}
          </Button>
        </div>

        <Tabs defaultValue="en">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="id">Indonesia</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Hero Image</Label>
                  <ImageUploader
                    value={contentEn.hero?.image || ''}
                    onChange={(url) => updateHero('en', 'image', url)}
                    folder="heroes"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={contentEn.hero?.title || ''}
                    onChange={(e) => updateHero('en', 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={contentEn.hero?.subtitle || ''}
                    onChange={(e) => updateHero('en', 'subtitle', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={contentEn.meta_title || ''}
                    onChange={(e) => updateMeta('en', 'meta_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Input
                    value={contentEn.meta_description || ''}
                    onChange={(e) => updateMeta('en', 'meta_description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="id" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Hero Image</Label>
                  <ImageUploader
                    value={contentId.hero?.image || ''}
                    onChange={(url) => updateHero('id', 'image', url)}
                    folder="heroes"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={contentId.hero?.title || ''}
                    onChange={(e) => updateHero('id', 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={contentId.hero?.subtitle || ''}
                    onChange={(e) => updateHero('id', 'subtitle', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={contentId.meta_title || ''}
                    onChange={(e) => updateMeta('id', 'meta_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Input
                    value={contentId.meta_description || ''}
                    onChange={(e) => updateMeta('id', 'meta_description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
