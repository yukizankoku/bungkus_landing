import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ArrowLeft, Eye, FileText, Search, Settings } from 'lucide-react';
import { 
  useCustomPageById,
  useCustomPages,
  useCreateCustomPage,
  useUpdateCustomPage,
  generateSlug
} from '@/hooks/useCustomPages';
import ImageUploader from '@/components/admin/ImageUploader';
import ContentBlockEditor, { ContentBlock } from '@/components/admin/ContentBlockEditor';

interface PageFormData {
  title_en: string;
  title_id: string;
  slug: string;
  parent_id: string | null;
  template: string;
  status: string;
  content_en: any[];
  content_id: any[];
  meta_title_en: string;
  meta_title_id: string;
  meta_description_en: string;
  meta_description_id: string;
  og_image: string;
  is_in_menu: boolean;
}

const defaultFormData: PageFormData = {
  title_en: '',
  title_id: '',
  slug: '',
  parent_id: null,
  template: 'default',
  status: 'draft',
  content_en: [],
  content_id: [],
  meta_title_en: '',
  meta_title_id: '',
  meta_description_en: '',
  meta_description_id: '',
  og_image: '',
  is_in_menu: false,
};

export default function AdminCustomPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNew = id === 'new';
  
  const { data: existingPage, isLoading: isLoadingPage } = useCustomPageById(isNew ? '' : id || '');
  const { data: allPages } = useCustomPages();
  const createPage = useCreateCustomPage();
  const updatePage = useUpdateCustomPage();

  const [formData, setFormData] = useState<PageFormData>(defaultFormData);
  const [autoSlug, setAutoSlug] = useState(true);
  const [blocksEn, setBlocksEn] = useState<ContentBlock[]>([]);
  const [blocksId, setBlocksId] = useState<ContentBlock[]>([]);

  useEffect(() => {
    if (existingPage) {
      setFormData({
        title_en: existingPage.title_en,
        title_id: existingPage.title_id,
        slug: existingPage.slug,
        parent_id: existingPage.parent_id,
        template: existingPage.template,
        status: existingPage.status,
        content_en: existingPage.content_en || [],
        content_id: existingPage.content_id || [],
        meta_title_en: existingPage.meta_title_en || '',
        meta_title_id: existingPage.meta_title_id || '',
        meta_description_en: existingPage.meta_description_en || '',
        meta_description_id: existingPage.meta_description_id || '',
        og_image: existingPage.og_image || '',
        is_in_menu: existingPage.is_in_menu,
      });
      // Extract blocks from content arrays
      const enBlocks = Array.isArray(existingPage.content_en) ? existingPage.content_en : [];
      const idBlocks = Array.isArray(existingPage.content_id) ? existingPage.content_id : [];
      setBlocksEn(enBlocks as ContentBlock[]);
      setBlocksId(idBlocks as ContentBlock[]);
      setAutoSlug(false);
    }
  }, [existingPage]);

  useEffect(() => {
    if (autoSlug && formData.title_en) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title_en) }));
    }
  }, [formData.title_en, autoSlug]);

  const handleSave = async () => {
    const pageData = {
      ...formData,
      content_en: blocksEn,
      content_id: blocksId,
      sort_order: 0,
    };

    if (isNew) {
      await createPage.mutateAsync(pageData);
    } else {
      await updatePage.mutateAsync({ id: id!, ...pageData });
    }
    navigate('/admin/custom-pages');
  };

  const parentOptions = allPages?.filter(p => p.id !== id) || [];

  if (!isNew && isLoadingPage) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const isPending = createPage.isPending || updatePage.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/custom-pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {isNew 
                  ? (language === 'en' ? 'Create New Page' : 'Buat Halaman Baru')
                  : (language === 'en' ? 'Edit Page' : 'Edit Halaman')}
              </h1>
              {!isNew && formData.slug && (
                <p className="text-muted-foreground mt-1">/{formData.slug}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && formData.status === 'published' && (
              <Button variant="outline" asChild>
                <a href={`/p/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Preview' : 'Pratinjau'}
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={isPending || !formData.title_en || !formData.slug}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Save' : 'Simpan'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Content' : 'Konten'}
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Settings' : 'Pengaturan'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Page Details' : 'Detail Halaman'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                      placeholder="Page Title"
                    />
                  </div>
                  <div>
                    <Label>Title (Indonesian)</Label>
                    <Input
                      value={formData.title_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_id: e.target.value }))}
                      placeholder="Judul Halaman"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>URL Slug</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Auto-generate' : 'Otomatis'}
                      </span>
                      <Switch
                        checked={autoSlug}
                        onCheckedChange={setAutoSlug}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">/p/</span>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-url-slug"
                      disabled={autoSlug}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Page Content' : 'Konten Halaman'}</CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? 'Write your page content using the rich text editor' 
                    : 'Tulis konten halaman menggunakan editor teks kaya'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">Content (English)</Label>
                  <ContentBlockEditor
                    blocks={blocksEn}
                    onChange={setBlocksEn}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Content (Indonesian)</Label>
                  <ContentBlockEditor
                    blocks={blocksId}
                    onChange={setBlocksId}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'SEO Settings' : 'Pengaturan SEO'}</CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? 'Optimize your page for search engines' 
                    : 'Optimalkan halaman untuk mesin pencari'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Meta Title (English)</Label>
                    <Input
                      value={formData.meta_title_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title_en: e.target.value }))}
                      placeholder="SEO Title"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_title_en.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label>Meta Title (Indonesian)</Label>
                    <Input
                      value={formData.meta_title_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title_id: e.target.value }))}
                      placeholder="Judul SEO"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_title_id.length}/60 characters
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Meta Description (English)</Label>
                    <Textarea
                      value={formData.meta_description_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description_en: e.target.value }))}
                      placeholder="Brief description for search results"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_description_en.length}/160 characters
                    </p>
                  </div>
                  <div>
                    <Label>Meta Description (Indonesian)</Label>
                    <Textarea
                      value={formData.meta_description_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description_id: e.target.value }))}
                      placeholder="Deskripsi singkat untuk hasil pencarian"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_description_id.length}/160 characters
                    </p>
                  </div>
                </div>

                <div>
                  <Label>OG Image (Social Sharing)</Label>
                  <ImageUploader
                    value={formData.og_image}
                    onChange={(url) => setFormData(prev => ({ ...prev, og_image: url }))}
                    folder="pages"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Page Settings' : 'Pengaturan Halaman'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'en' ? 'Status' : 'Status'}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="draft">
                          {language === 'en' ? 'Draft' : 'Draf'}
                        </SelectItem>
                        <SelectItem value="published">
                          {language === 'en' ? 'Published' : 'Diterbitkan'}
                        </SelectItem>
                        <SelectItem value="archived">
                          {language === 'en' ? 'Archived' : 'Diarsipkan'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{language === 'en' ? 'Template' : 'Template'}</Label>
                    <Select
                      value={formData.template}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="default">
                          {language === 'en' ? 'Default (with header/footer)' : 'Default (dengan header/footer)'}
                        </SelectItem>
                        <SelectItem value="landing">
                          {language === 'en' ? 'Landing Page' : 'Landing Page'}
                        </SelectItem>
                        <SelectItem value="blank">
                          {language === 'en' ? 'Blank (no header/footer)' : 'Kosong (tanpa header/footer)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{language === 'en' ? 'Parent Page' : 'Halaman Induk'}</Label>
                  <Select
                    value={formData.parent_id || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value === 'none' ? null : value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="none">
                        {language === 'en' ? '— No parent (top level)' : '— Tanpa induk (level atas)'}
                      </SelectItem>
                      {parentOptions.map(page => (
                        <SelectItem key={page.id} value={page.id}>
                          {language === 'en' ? page.title_en : page.title_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div>
                    <Label>{language === 'en' ? 'Add to Navigation Menu' : 'Tambah ke Menu Navigasi'}</Label>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'Automatically add this page to the main navigation' 
                        : 'Otomatis tambahkan halaman ini ke navigasi utama'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_in_menu}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_in_menu: checked }))}
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
