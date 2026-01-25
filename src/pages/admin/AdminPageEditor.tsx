import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageContent, useUpdatePageContent } from '@/hooks/usePageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Eye, EyeOff, GripVertical, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import LivePreview from '@/components/admin/LivePreview';
import IconSelector from '@/components/admin/IconSelector';
import SEOAudit from '@/components/admin/SEOAudit';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface ContentItem {
  icon?: string;
  title?: string;
  description?: string;
  image?: string;
  name?: string;
  role?: string;
  quote?: string;
  step?: string;
  client?: string;
  category?: string;
  products?: string[];
  tags?: string[];
}

// Sortable Item Component
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "opacity-50 z-50")}
    >
      <div className="absolute left-2 top-4 z-10">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="pl-8">
        {children}
      </div>
    </div>
  );
}

export default function AdminPageEditor() {
  const { pageKey } = useParams<{ pageKey: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: page, isLoading } = usePageContent(pageKey || '');
  const updatePage = useUpdatePageContent();

  const [contentEn, setContentEn] = useState<Record<string, any>>({});
  const [contentId, setContentId] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(true);
  const [slug, setSlug] = useState('');
  const [usePrefix, setUsePrefix] = useState(false);

  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTranslateToEnglish = async () => {
    if (!pageKey || !contentId || Object.keys(contentId).length === 0) {
      toast({
        title: language === 'en' ? 'Error' : 'Kesalahan',
        description: language === 'en' ? 'No Indonesian content to translate' : 'Tidak ada konten Indonesia untuk diterjemahkan',
        variant: 'destructive'
      });
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { pageKey, contentId }
      });

      if (error) {
        throw new Error(error.message || 'Translation failed');
      }

      if (data?.translatedContent) {
        // Preserve images from current English content
        const mergedContent = { ...data.translatedContent };
        
        // Keep hero image from current English content if exists
        if (contentEn?.hero?.image) {
          mergedContent.hero = { ...mergedContent.hero, image: contentEn.hero.image };
        }
        
        // Keep team images from current English content if exists
        if (contentEn?.team && mergedContent?.team) {
          mergedContent.team = mergedContent.team.map((item: any, idx: number) => ({
            ...item,
            image: contentEn?.team?.[idx]?.image || item.image
          }));
        }
        
        // Keep product images
        if (contentEn?.products && mergedContent?.products) {
          mergedContent.products = mergedContent.products.map((item: any, idx: number) => ({
            ...item,
            image: contentEn?.products?.[idx]?.image || item.image
          }));
        }

        setContentEn(mergedContent);
        toast({
          title: language === 'en' ? 'Translation Complete' : 'Terjemahan Selesai',
          description: language === 'en' 
            ? 'Indonesian content has been translated to English. Review and save your changes.' 
            : 'Konten Indonesia telah diterjemahkan ke Inggris. Tinjau dan simpan perubahan Anda.'
        });
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: language === 'en' ? 'Translation Failed' : 'Terjemahan Gagal',
        description: error.message || (language === 'en' ? 'Failed to translate content' : 'Gagal menerjemahkan konten'),
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (page) {
      setContentEn(page.content_en || {});
      setContentId(page.content_id || {});
      setSlug(page.slug || '');
      setUsePrefix(page.use_prefix ?? false);
    }
  }, [page]);

  const handleSave = () => {
    if (!pageKey) return;
    updatePage.mutate({ pageKey, contentEn, contentId, slug, usePrefix });
  };

  // Reorder handler for drag-and-drop
  const handleDragEnd = (section: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reorderInBoth = (arr: any[]) => {
      const oldIndex = arr.findIndex((_, i) => `${section}-${i}` === active.id);
      const newIndex = arr.findIndex((_, i) => `${section}-${i}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return arr;
      return arrayMove(arr, oldIndex, newIndex);
    };

    setContentEn((prev: Record<string, any>) => ({
      ...prev,
      [section]: reorderInBoth(prev[section] || [])
    }));
    setContentId((prev: Record<string, any>) => ({
      ...prev,
      [section]: reorderInBoth(prev[section] || [])
    }));
  };

  const updateField = (lang: 'en' | 'id', section: string, field: string, value: any) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter((prev: Record<string, any>) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const updateArrayItem = (lang: 'en' | 'id', section: string, index: number, field: string, value: any) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter((prev: Record<string, any>) => {
      const arr = [...(prev[section] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (lang: 'en' | 'id', section: string, template: ContentItem) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter((prev: Record<string, any>) => ({
      ...prev,
      [section]: [...(prev[section] || []), template]
    }));
  };

  const removeArrayItem = (lang: 'en' | 'id', section: string, index: number) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter((prev: Record<string, any>) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const renderHeroSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Hero Image</Label>
          <ImageUploader
            value={content.hero?.image || ''}
            onChange={(url) => {
              // Sync image to both languages
              updateField('en', 'hero', 'image', url);
              updateField('id', 'hero', 'image', url);
            }}
            folder="heroes"
          />
        </div>
        <div>
          <Label>Title</Label>
          <Input
            value={content.hero?.title || ''}
            onChange={(e) => updateField(lang, 'hero', 'title', e.target.value)}
          />
        </div>
        <div>
          <Label>Subtitle</Label>
          <Textarea
            value={content.hero?.subtitle || ''}
            onChange={(e) => updateField(lang, 'hero', 'subtitle', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderSEOSection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Meta Title</Label>
          <Input
            value={content.meta_title || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({ ...prev, meta_title: e.target.value }))}
          />
        </div>
        <div>
          <Label>Meta Description</Label>
          <Textarea
            value={content.meta_description || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({ ...prev, meta_description: e.target.value }))}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderURLSettingsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>URL Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>URL Slug</Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground text-sm">
              {usePrefix ? '/p/' : '/'}
            </span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-\/]/g, ''))}
              placeholder="page-url"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Use lowercase letters, numbers, hyphens, and forward slashes only.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Use /p/ Prefix</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, page will be at /p/{slug}
            </p>
          </div>
          <Switch
            checked={usePrefix}
            onCheckedChange={setUsePrefix}
          />
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-xs text-muted-foreground">Preview URL</Label>
          <p className="font-mono text-sm mt-1">
            {usePrefix ? `/p/${slug || 'page-url'}` : `/${slug || 'page-url'}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactInfoNote = () => (
    <Card className="bg-muted/50 border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Contact information (email, phone, address) is managed globally in{' '}
          <a href="/admin/settings" className="text-primary underline hover:no-underline">
            Site Settings
          </a>
          . This ensures consistency across all pages.
        </p>
      </CardContent>
    </Card>
  );

  const renderContactFormSection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Contact Info Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={content.contactInfoTitle || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({ ...prev, contactInfoTitle: e.target.value }))}
              placeholder={lang === 'id' ? 'Informasi Kontak' : 'Contact Information'}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Form Labels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name Field</Label>
              <Input
                value={content.formLabels?.name || ''}
                onChange={(e) => setContent((prev: Record<string, any>) => ({
                  ...prev,
                  formLabels: { ...prev.formLabels, name: e.target.value }
                }))}
                placeholder={lang === 'id' ? 'Nama' : 'Name'}
              />
            </div>
            <div>
              <Label>Email Field</Label>
              <Input
                value={content.formLabels?.email || ''}
                onChange={(e) => setContent((prev: Record<string, any>) => ({
                  ...prev,
                  formLabels: { ...prev.formLabels, email: e.target.value }
                }))}
                placeholder="Email"
              />
            </div>
            <div>
              <Label>Phone Field</Label>
              <Input
                value={content.formLabels?.phone || ''}
                onChange={(e) => setContent((prev: Record<string, any>) => ({
                  ...prev,
                  formLabels: { ...prev.formLabels, phone: e.target.value }
                }))}
                placeholder={lang === 'id' ? 'Telepon' : 'Phone'}
              />
            </div>
            <div>
              <Label>Company Field</Label>
              <Input
                value={content.formLabels?.company || ''}
                onChange={(e) => setContent((prev: Record<string, any>) => ({
                  ...prev,
                  formLabels: { ...prev.formLabels, company: e.target.value }
                }))}
                placeholder={lang === 'id' ? 'Perusahaan' : 'Company'}
              />
            </div>
            <div>
              <Label>Message Field</Label>
              <Input
                value={content.formLabels?.message || ''}
                onChange={(e) => setContent((prev: Record<string, any>) => ({
                  ...prev,
                  formLabels: { ...prev.formLabels, message: e.target.value }
                }))}
                placeholder={lang === 'id' ? 'Pesan' : 'Message'}
              />
            </div>
            <div>
              <Label>Submit Button</Label>
              <Input
                value={content.formLabels?.submit || ''}
                onChange={(e) => setContent((prev: Record<string, any>) => ({
                  ...prev,
                  formLabels: { ...prev.formLabels, submit: e.target.value }
                }))}
                placeholder={lang === 'id' ? 'Kirim Pesan' : 'Send Message'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Form Field Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose which optional fields to show on the contact form. Name and Email are always required.
            These settings apply to both languages.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-phone" className="cursor-pointer">Show Phone Field</Label>
              <Switch
                id="show-phone"
                checked={contentEn.formConfig?.showPhone !== false}
                onCheckedChange={(checked) => {
                  // Sync formConfig to both languages
                  setContentEn((prev: Record<string, any>) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, showPhone: checked }
                  }));
                  setContentId((prev: Record<string, any>) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, showPhone: checked }
                  }));
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-company" className="cursor-pointer">Show Company Field</Label>
              <Switch
                id="show-company"
                checked={contentEn.formConfig?.showCompany !== false}
                onCheckedChange={(checked) => {
                  // Sync formConfig to both languages
                  setContentEn((prev: Record<string, any>) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, showCompany: checked }
                  }));
                  setContentId((prev: Record<string, any>) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, showCompany: checked }
                  }));
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-message" className="cursor-pointer">Show Message Field</Label>
              <Switch
                id="show-message"
                checked={contentEn.formConfig?.showMessage !== false}
                onCheckedChange={(checked) => {
                  // Sync formConfig to both languages
                  setContentEn((prev: Record<string, any>) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, showMessage: checked }
                  }));
                  setContentId((prev: Record<string, any>) => ({
                    ...prev,
                    formConfig: { ...prev.formConfig, showMessage: checked }
                  }));
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderProductCatalogSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Add to both languages to keep sync
            const newProduct = { image: '', name: '', description: '', category: '', tags: [] };
            addArrayItem('en', 'products', newProduct);
            addArrayItem('id', 'products', newProduct);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {language === 'en' 
            ? 'Images sync across languages. Text is language-specific.' 
            : 'Gambar disinkronkan antar bahasa. Teks khusus per bahasa.'}
        </p>
        {(content.products || []).map((item: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Product {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => {
                // Remove from both languages
                removeArrayItem('en', 'products', index);
                removeArrayItem('id', 'products', index);
              }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Image</Label>
              <ImageUploader
                value={item.image || ''}
                onChange={(url) => {
                  // Sync image to both languages
                  updateArrayItem('en', 'products', index, 'image', url);
                  updateArrayItem('id', 'products', index, 'image', url);
                }}
                folder="products"
              />
            </div>
            <div>
              <Label>Product Name</Label>
              <Input
                value={item.name || ''}
                onChange={(e) => updateArrayItem(lang, 'products', index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'products', index, 'description', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={item.category || ''}
                onChange={(e) => updateArrayItem(lang, 'products', index, 'category', e.target.value)}
                placeholder="Paper Cup, Paper Bag, Container, etc."
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={(item.tags || []).join(', ')}
                onChange={(e) => updateArrayItem(lang, 'products', index, 'tags', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                placeholder="Eco-Friendly, Food Grade, Custom"
              />
            </div>
          </div>
        ))}
        {(!content.products || content.products.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No products yet. Click "Add Product" to add your first product.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderBenefitsSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Benefits</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'benefits', { icon: 'Check', title: '', description: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.benefits || []).map((item: ContentItem, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Benefit {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'benefits', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Icon</Label>
              <IconSelector
                value={item.icon || 'Package'}
                onChange={(iconName) => {
                  // Update icon for both languages to keep them in sync
                  updateArrayItem('en', 'benefits', index, 'icon', iconName);
                  updateArrayItem('id', 'benefits', index, 'icon', iconName);
                }}
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem(lang, 'benefits', index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'benefits', index, 'description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderFeaturesSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Features</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'features', { icon: 'Star', title: '', description: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.features || []).map((item: ContentItem, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Feature {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'features', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Icon</Label>
              <IconSelector
                value={item.icon || 'Star'}
                onChange={(iconName) => {
                  updateArrayItem('en', 'features', index, 'icon', iconName);
                  updateArrayItem('id', 'features', index, 'icon', iconName);
                }}
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem(lang, 'features', index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'features', index, 'description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderProcessSection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Process Section Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input
              value={content.processSection?.title || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                processSection: { ...prev.processSection, title: e.target.value }
              }))}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Process Steps</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem(lang, 'processSteps', { step: '', title: '' })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(content.processSteps || []).map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Step {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'processSteps', index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div>
                <Label>Step Number (e.g., 01, 02)</Label>
                <Input
                  value={item.step || ''}
                  onChange={(e) => updateArrayItem(lang, 'processSteps', index, 'step', e.target.value)}
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem(lang, 'processSteps', index, 'title', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  const renderSuccessSection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <Card>
      <CardHeader>
        <CardTitle>Success Stories Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Show Section</Label>
          <Switch
            checked={content.successSection?.isVisible !== false}
            onCheckedChange={(checked) => setContent((prev: Record<string, any>) => ({
              ...prev,
              successSection: { ...prev.successSection, isVisible: checked }
            }))}
          />
        </div>
        <div>
          <Label>Section Title</Label>
          <Input
            value={content.successSection?.title || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({
              ...prev,
              successSection: { ...prev.successSection, title: e.target.value }
            }))}
          />
        </div>
        <div>
          <Label>Section Subtitle</Label>
          <Textarea
            value={content.successSection?.subtitle || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({
              ...prev,
              successSection: { ...prev.successSection, subtitle: e.target.value }
            }))}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Button Text</Label>
            <Input
              value={content.successSection?.buttonText || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                successSection: { ...prev.successSection, buttonText: e.target.value }
              }))}
              placeholder={lang === 'id' ? 'Lihat Case Studies' : 'View Case Studies'}
            />
          </div>
          <div>
            <Label>Button Link</Label>
            <Input
              value={content.successSection?.buttonLink || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                successSection: { ...prev.successSection, buttonLink: e.target.value }
              }))}
              placeholder="/case-studies"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBenefitsSectionHeader = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <Card>
      <CardHeader>
        <CardTitle>Benefits Section Header</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Section Title</Label>
          <Input
            value={content.benefitsSection?.title || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({
              ...prev,
              benefitsSection: { ...prev.benefitsSection, title: e.target.value }
            }))}
          />
        </div>
        <div>
          <Label>Section Subtitle</Label>
          <Textarea
            value={content.benefitsSection?.subtitle || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({
              ...prev,
              benefitsSection: { ...prev.benefitsSection, subtitle: e.target.value }
            }))}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderAboutSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <>
      {renderValuesSection(lang, content)}
      {renderTeamSection(lang, content)}
    </>
  );

  const renderValuesSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Values / Mission / Vision</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'values', { icon: 'Target', title: '', description: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.values || []).map((item: ContentItem, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Value {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'values', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Icon</Label>
              <IconSelector
                value={item.icon || 'Target'}
                onChange={(iconName) => {
                  updateArrayItem('en', 'values', index, 'icon', iconName);
                  updateArrayItem('id', 'values', index, 'icon', iconName);
                }}
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem(lang, 'values', index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'values', index, 'description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderTeamSection = (lang: 'en' | 'id', content: Record<string, any>) => {
    const teamItems = content.team || [];
    const teamIds = teamItems.map((_: any, i: number) => `team-${i}`);
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Add to both languages to keep sync
              const newMember = { name: '', role: '', image: '' };
              addArrayItem('en', 'team', newMember);
              addArrayItem('id', 'team', newMember);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {language === 'en' 
              ? 'Drag items to reorder. Photos sync across languages.' 
              : 'Seret untuk mengatur urutan. Foto disinkronkan antar bahasa.'}
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('team')}>
            <SortableContext items={teamIds} strategy={verticalListSortingStrategy}>
              {teamItems.map((item: ContentItem, index: number) => (
                <SortableItem key={`team-${index}`} id={`team-${index}`}>
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Member {index + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          // Remove from both languages
                          removeArrayItem('en', 'team', index);
                          removeArrayItem('id', 'team', index);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div>
                      <Label>Photo</Label>
                      <ImageUploader
                        value={item.image || ''}
                        onChange={(url) => {
                          // Sync image to both languages
                          updateArrayItem('en', 'team', index, 'image', url);
                          updateArrayItem('id', 'team', index, 'image', url);
                        }}
                        folder="team"
                      />
                    </div>
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={item.name || ''}
                        onChange={(e) => updateArrayItem(lang, 'team', index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={item.role || ''}
                        onChange={(e) => updateArrayItem(lang, 'team', index, 'role', e.target.value)}
                      />
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
          {teamItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'en' ? 'No team members yet. Click "Add" to add your first team member.' : 'Belum ada anggota tim. Klik "Tambah" untuk menambahkan.'}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCategoriesSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Categories</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'categories', { icon: 'Package', title: '', description: '', products: [] })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.categories || []).map((item: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Category {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'categories', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Icon</Label>
              <IconSelector
                value={item.icon || 'Package'}
                onChange={(iconName) => {
                  updateArrayItem('en', 'categories', index, 'icon', iconName);
                  updateArrayItem('id', 'categories', index, 'icon', iconName);
                }}
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem(lang, 'categories', index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'categories', index, 'description', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Products (comma-separated)</Label>
              <Input
                value={(item.products || []).join(', ')}
                onChange={(e) => updateArrayItem(lang, 'categories', index, 'products', e.target.value.split(',').map((s: string) => s.trim()))}
                placeholder="Paper Cup, Paper Bowl, Food Container"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderMaterialsSection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Materials Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input
              value={content.materialsSection?.title || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                materialsSection: { ...prev.materialsSection, title: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label>Section Subtitle</Label>
            <Textarea
              value={content.materialsSection?.subtitle || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                materialsSection: { ...prev.materialsSection, subtitle: e.target.value }
              }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Materials</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addArrayItem(lang, 'materials', { icon: 'ShieldCheck', title: '', description: '' })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(content.materials || []).map((item: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Material {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'materials', index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div>
                <Label>Icon Name (ShieldCheck, Leaf, Award)</Label>
                <Input
                  value={item.icon || ''}
                  onChange={(e) => updateArrayItem(lang, 'materials', index, 'icon', e.target.value)}
                  placeholder="ShieldCheck, Leaf, Award"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => updateArrayItem(lang, 'materials', index, 'title', e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={item.description || ''}
                  onChange={(e) => updateArrayItem(lang, 'materials', index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  const renderCaseStudiesSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Case Studies</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'caseStudies', { title: '', client: '', description: '', image: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.caseStudies || []).map((item: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Case Study {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'caseStudies', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Image</Label>
              <ImageUploader
                value={item.image || ''}
                onChange={(url) => updateArrayItem(lang, 'caseStudies', index, 'image', url)}
                folder="case-studies"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem(lang, 'caseStudies', index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Client</Label>
              <Input
                value={item.client || ''}
                onChange={(e) => updateArrayItem(lang, 'caseStudies', index, 'client', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'caseStudies', index, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderCTASection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <Card>
      <CardHeader>
        <CardTitle>Call to Action Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={content.cta?.title || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({
              ...prev,
              cta: { ...prev.cta, title: e.target.value }
            }))}
            placeholder={lang === 'id' ? 'Siap Memulai Kemitraan dengan Kami?' : 'Ready to Start a Partnership with Us?'}
          />
        </div>
        <div>
          <Label>Subtitle</Label>
          <Textarea
            value={content.cta?.subtitle || ''}
            onChange={(e) => setContent((prev: Record<string, any>) => ({
              ...prev,
              cta: { ...prev.cta, subtitle: e.target.value }
            }))}
            placeholder={lang === 'id' ? 'Hubungi kami sekarang untuk konsultasi gratis.' : 'Contact us now for free consultation.'}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Primary Button Text</Label>
            <Input
              value={content.cta?.primary_button || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                cta: { ...prev.cta, primary_button: e.target.value }
              }))}
              placeholder={lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
            />
          </div>
          <div>
            <Label>Primary Button Link</Label>
            <Input
              value={content.cta?.primary_button_link || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                cta: { ...prev.cta, primary_button_link: e.target.value }
              }))}
              placeholder="/hubungi-kami"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Secondary Button Text</Label>
            <Input
              value={content.cta?.secondary_button || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                cta: { ...prev.cta, secondary_button: e.target.value }
              }))}
              placeholder={lang === 'id' ? 'Lihat Produk' : 'View Products'}
            />
          </div>
          <div>
            <Label>Secondary Button Link</Label>
            <Input
              value={content.cta?.secondary_button_link || ''}
              onChange={(e) => setContent((prev: Record<string, any>) => ({
                ...prev,
                cta: { ...prev.cta, secondary_button_link: e.target.value }
              }))}
              placeholder="/produk"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Leave fields empty to use the global CTA defaults from Site Settings.
        </p>
      </CardContent>
    </Card>
  );

  const renderLegalPageSection = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => (
    <Card>
      <CardHeader>
        <CardTitle>{lang === 'en' ? 'Page Content' : 'Konten Halaman'}</CardTitle>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          value={content.content || ''}
          onChange={(value) => setContent((prev: Record<string, any>) => ({ ...prev, content: value }))}
          placeholder={lang === 'en' ? 'Enter page content...' : 'Masukkan konten halaman...'}
        />
      </CardContent>
    </Card>
  );

  const renderPageContent = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => {
    const sections = [];
    
    // Legal pages only need hero, content, and SEO
    if (pageKey === 'privacy-policy' || pageKey === 'terms-conditions') {
      sections.push(renderHeroSection(lang, content));
      sections.push(renderLegalPageSection(lang, content, setContent));
      sections.push(renderSEOSection(lang, content, setContent));
      return sections;
    }
    
    // Always render hero and SEO
    sections.push(renderHeroSection(lang, content));
    sections.push(renderSEOSection(lang, content, setContent));
    
    // Page-specific sections
    switch (pageKey) {
      case 'contact':
        sections.push(renderContactInfoNote());
        sections.push(renderContactFormSection(lang, content, setContent));
        break;
      case 'about':
        sections.push(renderAboutSection(lang, content));
        sections.push(renderCTASection(lang, content, setContent));
        break;
      case 'products':
        sections.push(renderCategoriesSection(lang, content));
        sections.push(renderMaterialsSection(lang, content, setContent));
        sections.push(renderCTASection(lang, content, setContent));
        break;
      case 'product-catalog':
        sections.push(renderProductCatalogSection(lang, content));
        break;
      case 'corporate-solutions':
        sections.push(renderBenefitsSectionHeader(lang, content, setContent));
        sections.push(renderBenefitsSection(lang, content));
        sections.push(renderProcessSection(lang, content, setContent));
        sections.push(renderCTASection(lang, content, setContent));
        break;
      case 'umkm-solutions':
        sections.push(renderBenefitsSectionHeader(lang, content, setContent));
        sections.push(renderBenefitsSection(lang, content));
        sections.push(renderSuccessSection(lang, content, setContent));
        sections.push(renderCTASection(lang, content, setContent));
        break;
      case 'case-studies':
        sections.push(renderCaseStudiesSection(lang, content));
        sections.push(renderCTASection(lang, content, setContent));
        break;
      case 'blog':
        sections.push(renderCTASection(lang, content, setContent));
        break;
    }
    
    return sections;
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

  const pageLabels: Record<string, string> = {
    'contact': 'Kontak / Contact',
    'about': 'Tentang Kami / About',
    'products': 'Kategori Industri / Industry Categories',
    'product-catalog': 'Katalog Produk / Product Catalog',
    'corporate-solutions': 'Solusi Korporat / Corporate Solutions',
    'umkm-solutions': 'Solusi UMKM / UMKM Solutions',
    'case-studies': 'Studi Kasus / Case Studies',
    'blog': 'Blog',
    'privacy-policy': 'Kebijakan Privasi / Privacy Policy',
    'terms-conditions': 'Syarat & Ketentuan / Terms & Conditions'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{pageLabels[pageKey || ''] || pageKey}</h1>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isTranslating}
                  className="hidden sm:flex"
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Languages className="h-4 w-4 mr-2" />
                  )}
                  {language === 'en' ? 'AI Translate' : 'Terjemahkan AI'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === 'en' ? 'Translate to English?' : 'Terjemahkan ke Inggris?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === 'en' 
                      ? 'This will use AI to translate all Indonesian content to English. The existing English content will be replaced. Images and "Bungkus Indonesia" will not be translated.'
                      : 'Ini akan menggunakan AI untuk menerjemahkan semua konten Indonesia ke Inggris. Konten Inggris yang ada akan diganti. Gambar dan "Bungkus Indonesia" tidak akan diterjemahkan.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {language === 'en' ? 'Cancel' : 'Batal'}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleTranslateToEnglish}>
                    {language === 'en' ? 'Translate' : 'Terjemahkan'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden xl:flex"
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview 
                ? (language === 'en' ? 'Hide Preview' : 'Sembunyikan Preview')
                : (language === 'en' ? 'Show Preview' : 'Tampilkan Preview')}
            </Button>
            <Button onClick={handleSave} disabled={updatePage.isPending} className="min-w-[120px]">
              <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">
                {updatePage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </span>
              {language === 'en' ? 'Save Changes' : 'Simpan'}
            </Button>
          </div>
        </div>

        <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
          <div className={showPreview ? '' : 'lg:col-span-2'}>
            {/* URL Settings - Language Independent */}
            {renderURLSettingsSection()}
            
            <Tabs defaultValue="en" className="mt-6">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="id">Indonesia</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-6">
                {renderPageContent('en', contentEn, setContentEn)}
              </TabsContent>

              <TabsContent value="id" className="space-y-6">
                {renderPageContent('id', contentId, setContentId)}
              </TabsContent>
            </Tabs>

            {/* SEO Audit below form when preview is ON */}
            {showPreview && (
              <div className="mt-6">
                <Tabs defaultValue="id">
                  <TabsList className="w-full">
                    <TabsTrigger value="id" className="flex-1">SEO (ID)</TabsTrigger>
                    <TabsTrigger value="en" className="flex-1">SEO (EN)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="id" className="mt-4">
                    <SEOAudit
                      title={contentId?.hero?.title || contentId?.title || ''}
                      metaTitle={contentId?.meta_title || contentId?.hero?.title || ''}
                      metaDescription={contentId?.meta_description || contentId?.hero?.subtitle || ''}
                      content={JSON.stringify(contentId)}
                      language="id"
                    />
                  </TabsContent>
                  <TabsContent value="en" className="mt-4">
                    <SEOAudit
                      title={contentEn?.hero?.title || contentEn?.title || ''}
                      metaTitle={contentEn?.meta_title || contentEn?.hero?.title || ''}
                      metaDescription={contentEn?.meta_description || contentEn?.hero?.subtitle || ''}
                      content={JSON.stringify(contentEn)}
                      language="en"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* SEO Audit side-by-side when preview is OFF */}
          {!showPreview && (
            <div className="hidden lg:block sticky top-6">
              <Tabs defaultValue="id">
                <TabsList className="w-full">
                  <TabsTrigger value="id" className="flex-1">SEO (ID)</TabsTrigger>
                  <TabsTrigger value="en" className="flex-1">SEO (EN)</TabsTrigger>
                </TabsList>
                <TabsContent value="id" className="mt-4">
                  <SEOAudit
                    title={contentId?.hero?.title || contentId?.title || ''}
                    metaTitle={contentId?.meta_title || contentId?.hero?.title || ''}
                    metaDescription={contentId?.meta_description || contentId?.hero?.subtitle || ''}
                    content={JSON.stringify(contentId)}
                    language="id"
                  />
                </TabsContent>
                <TabsContent value="en" className="mt-4">
                  <SEOAudit
                    title={contentEn?.hero?.title || contentEn?.title || ''}
                    metaTitle={contentEn?.meta_title || contentEn?.hero?.title || ''}
                    metaDescription={contentEn?.meta_description || contentEn?.hero?.subtitle || ''}
                    content={JSON.stringify(contentEn)}
                    language="en"
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {showPreview && (
            <div className="hidden xl:block sticky top-6">
              <LivePreview 
                path={usePrefix ? `/p/${slug}` : `/${slug}`} 
                title="Live Preview" 
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
