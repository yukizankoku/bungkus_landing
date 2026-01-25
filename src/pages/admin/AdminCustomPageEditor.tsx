import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Save, ArrowLeft, Eye, FileText, Search, Settings, Languages } from 'lucide-react';
import { 
  useCustomPageById,
  useCustomPages,
  useCreateCustomPage,
  useUpdateCustomPage,
  generateSlug
} from '@/hooks/useCustomPages';
import ImageUploader from '@/components/admin/ImageUploader';
import ContentBlockEditor, { ContentBlock } from '@/components/admin/ContentBlockEditor';
import SEOAudit from '@/components/admin/SEOAudit';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  use_prefix: boolean;
}

const defaultFormData: PageFormData = {
  title_en: '',
  title_id: '',
  slug: '',
  parent_id: null,
  template: 'landing',
  status: 'draft',
  content_en: [],
  content_id: [],
  meta_title_en: '',
  meta_title_id: '',
  meta_description_en: '',
  meta_description_id: '',
  og_image: '',
  is_in_menu: false,
  use_prefix: false,
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
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

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
        use_prefix: existingPage.use_prefix ?? false,
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
    if (autoSlug && formData.title_id) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title_id) }));
    }
  }, [formData.title_id, autoSlug]);

  // Extract images from blocks to preserve during translation
  const extractImagesFromBlocks = (blocks: ContentBlock[]) => {
    const images: Record<string, any> = {};
    blocks.forEach((block, index) => {
      if (block.data.background_image) {
        images[`${index}_background_image`] = block.data.background_image;
      }
      if (block.data.author_image) {
        images[`${index}_author_image`] = block.data.author_image;
      }
      if (block.data.images) {
        images[`${index}_images`] = block.data.images;
      }
      if (block.data.items && Array.isArray(block.data.items)) {
        block.data.items.forEach((item: any, itemIndex: number) => {
          if (item.image) {
            images[`${index}_items_${itemIndex}_image`] = item.image;
          }
        });
      }
      if (block.data.members && Array.isArray(block.data.members)) {
        block.data.members.forEach((member: any, memberIndex: number) => {
          if (member.image) {
            images[`${index}_members_${memberIndex}_image`] = member.image;
          }
        });
      }
    });
    return images;
  };

  // Apply preserved images back to translated blocks
  const applyImagesToBlocks = (blocks: ContentBlock[], images: Record<string, any>) => {
    return blocks.map((block, index) => {
      const newData = { ...block.data };
      
      if (images[`${index}_background_image`]) {
        newData.background_image = images[`${index}_background_image`];
      }
      if (images[`${index}_author_image`]) {
        newData.author_image = images[`${index}_author_image`];
      }
      if (images[`${index}_images`]) {
        newData.images = images[`${index}_images`];
      }
      if (newData.items && Array.isArray(newData.items)) {
        newData.items = newData.items.map((item: any, itemIndex: number) => {
          if (images[`${index}_items_${itemIndex}_image`]) {
            return { ...item, image: images[`${index}_items_${itemIndex}_image`] };
          }
          return item;
        });
      }
      if (newData.members && Array.isArray(newData.members)) {
        newData.members = newData.members.map((member: any, memberIndex: number) => {
          if (images[`${index}_members_${memberIndex}_image`]) {
            return { ...member, image: images[`${index}_members_${memberIndex}_image`] };
          }
          return member;
        });
      }
      
      return { ...block, data: newData };
    });
  };

  const handleTranslateToEnglish = async () => {
    setIsTranslating(true);
    try {
      // Preserve images from Indonesian blocks (source)
      const preservedImages = extractImagesFromBlocks(blocksId);

      // Prepare content for translation
      const contentToTranslate = {
        title: formData.title_id,
        meta_title: formData.meta_title_id,
        meta_description: formData.meta_description_id,
        blocks: blocksId,
      };

      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          pageKey: `custom-${formData.slug}`,
          contentId: contentToTranslate,
        },
      });

      if (error) throw error;

      if (data?.translated) {
        const translated = data.translated;
        
        // Update form data
        if (translated.title) {
          setFormData(prev => ({ ...prev, title_en: translated.title }));
        }
        if (translated.meta_title) {
          setFormData(prev => ({ ...prev, meta_title_en: translated.meta_title }));
        }
        if (translated.meta_description) {
          setFormData(prev => ({ ...prev, meta_description_en: translated.meta_description }));
        }
        
        // Update blocks with preserved images
        if (translated.blocks && Array.isArray(translated.blocks)) {
          const translatedBlocks = applyImagesToBlocks(translated.blocks as ContentBlock[], preservedImages);
          setBlocksEn(translatedBlocks);
        }

        toast({
          title: language === 'en' ? 'Translation Complete' : 'Terjemahan Selesai',
          description: language === 'en' 
            ? 'Indonesian content has been translated to English. You can now edit freely.' 
            : 'Konten Indonesia telah diterjemahkan ke Inggris. Anda dapat mengedit dengan bebas.',
        });
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: language === 'en' ? 'Translation Failed' : 'Terjemahan Gagal',
        description: error.message || (language === 'en' ? 'Failed to translate content' : 'Gagal menerjemahkan konten'),
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

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
              <p className="text-muted-foreground mt-1">
                {formData.use_prefix ? `/p/${formData.slug}` : `/${formData.slug}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && formData.status === 'published' && (
            <Button variant="outline" asChild>
              <a href={formData.use_prefix ? `/p/${formData.slug}` : `/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Preview' : 'Pratinjau'}
              </a>
            </Button>
          )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isTranslating || blocksId.length === 0}>
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Languages className="h-4 w-4 mr-2" />
                  )}
                  {language === 'en' ? 'AI Translate' : 'Terjemah AI'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === 'en' ? 'Translate to English?' : 'Terjemahkan ke Inggris?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === 'en' 
                      ? 'This will translate the Indonesian content to English using AI. Existing English content will be replaced. Images will be preserved. You can edit the results freely after translation.'
                      : 'Ini akan menerjemahkan konten Indonesia ke Inggris menggunakan AI. Konten Inggris yang ada akan diganti. Gambar akan dipertahankan. Anda dapat mengedit hasil terjemahan dengan bebas.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Batal'}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTranslateToEnglish}>
                    {language === 'en' ? 'Translate' : 'Terjemahkan'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSave} disabled={isPending || !formData.title_id || !formData.slug} className="min-w-[100px]">
              <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </span>
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
                    <span className="text-muted-foreground">
                      {formData.use_prefix ? '/p/' : '/'}
                    </span>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{language === 'en' ? 'Page Content' : 'Konten Halaman'}</CardTitle>
                    <CardDescription>
                      {language === 'en' 
                        ? 'Write your page content using the rich text editor' 
                        : 'Tulis konten halaman menggunakan editor teks kaya'}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Sync images from EN blocks to ID blocks
                      const syncedBlocksId = blocksId.map((block, index) => {
                        const enBlock = blocksEn[index];
                        if (!enBlock) return block;
                        
                        // Deep copy and sync image fields
                        const syncedData = { ...block.data };
                        
                        // Sync common image fields
                        if (enBlock.data.background_image) syncedData.background_image = enBlock.data.background_image;
                        if (enBlock.data.author_image) syncedData.author_image = enBlock.data.author_image;
                        if (enBlock.data.images) syncedData.images = enBlock.data.images;
                        
                        // Sync images in array items (team members, etc.)
                        if (enBlock.data.items && Array.isArray(enBlock.data.items)) {
                          syncedData.items = (syncedData.items || []).map((item: any, i: number) => {
                            const enItem = enBlock.data.items?.[i];
                            if (enItem?.image) return { ...item, image: enItem.image };
                            return item;
                          });
                        }
                        
                        return { ...block, data: syncedData };
                      });
                      setBlocksId(syncedBlocksId);
                    }}
                  >
                    {language === 'en' ? 'Sync Images EN → ID' : 'Sinkron Gambar EN → ID'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-muted-foreground -mt-2">
                  {language === 'en' 
                    ? 'Tip: Write content in Indonesian first, then use "AI Translate" button to generate English version.' 
                    : 'Tips: Tulis konten dalam Bahasa Indonesia dulu, lalu gunakan tombol "Terjemah AI" untuk generate versi Inggris.'}
                </p>
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    Content (Indonesian) 
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                  </Label>
                  <ContentBlockEditor
                    blocks={blocksId}
                    onChange={setBlocksId}
                  />
                </div>
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    Content (English)
                    {blocksEn.length === 0 && blocksId.length > 0 && (
                      <span className="text-xs text-muted-foreground">(Use AI Translate to generate)</span>
                    )}
                  </Label>
                  <ContentBlockEditor
                    blocks={blocksEn}
                    onChange={setBlocksEn}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
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
              </div>

              {/* SEO Audit Panel */}
              <div className="space-y-4">
                <div className="sticky top-6">
                  <Tabs defaultValue="id">
                    <TabsList className="w-full">
                      <TabsTrigger value="id" className="flex-1">Indonesia</TabsTrigger>
                      <TabsTrigger value="en" className="flex-1">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="id" className="mt-4">
                      <SEOAudit
                        title={formData.title_id}
                        metaTitle={formData.meta_title_id}
                        metaDescription={formData.meta_description_id}
                        content={blocksId.map(b => JSON.stringify(b.data || {})).join(' ')}
                        language="id"
                      />
                    </TabsContent>
                    <TabsContent value="en" className="mt-4">
                      <SEOAudit
                        title={formData.title_en}
                        metaTitle={formData.meta_title_en}
                        metaDescription={formData.meta_description_en}
                        content={blocksEn.map(b => JSON.stringify(b.data || {})).join(' ')}
                        language="en"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
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
                    <Label>{language === 'en' ? 'URL Prefix (/p/)' : 'Prefix URL (/p/)'}</Label>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'Use /p/ prefix for this page URL. OFF = root level (better for SEO)' 
                        : 'Gunakan prefix /p/ untuk URL halaman ini. OFF = level root (lebih baik untuk SEO)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${!formData.use_prefix ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                      /{formData.slug || 'slug'}
                    </span>
                    <Switch
                      checked={formData.use_prefix}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_prefix: checked }))}
                    />
                    <span className={`text-sm ${formData.use_prefix ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                      /p/{formData.slug || 'slug'}
                    </span>
                  </div>
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
