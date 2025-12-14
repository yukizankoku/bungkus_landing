import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageContent, useUpdatePageContent } from '@/hooks/usePageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';

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
}

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
            onChange={(url) => updateField(lang, 'hero', 'image', url)}
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

  const renderContactSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            value={content.contact?.email || ''}
            onChange={(e) => updateField(lang, 'contact', 'email', e.target.value)}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={content.contact?.phone || ''}
            onChange={(e) => updateField(lang, 'contact', 'phone', e.target.value)}
          />
        </div>
        <div>
          <Label>Address</Label>
          <Input
            value={content.contact?.address || ''}
            onChange={(e) => updateField(lang, 'contact', 'address', e.target.value)}
          />
        </div>
        <div>
          <Label>WhatsApp Number</Label>
          <Input
            value={content.contact?.whatsapp || ''}
            onChange={(e) => updateField(lang, 'contact', 'whatsapp', e.target.value)}
          />
        </div>
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
              <Label>Icon Name (Lucide)</Label>
              <Input
                value={item.icon || ''}
                onChange={(e) => updateArrayItem(lang, 'benefits', index, 'icon', e.target.value)}
                placeholder="Check, Shield, Zap, etc."
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
              <Label>Icon Name (Lucide)</Label>
              <Input
                value={item.icon || ''}
                onChange={(e) => updateArrayItem(lang, 'features', index, 'icon', e.target.value)}
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

  const renderProcessSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Process Steps</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'process', { step: '', title: '', description: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.process || []).map((item: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Step {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'process', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Step Number</Label>
              <Input
                value={item.step || ''}
                onChange={(e) => updateArrayItem(lang, 'process', index, 'step', e.target.value)}
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={item.title || ''}
                onChange={(e) => updateArrayItem(lang, 'process', index, 'title', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateArrayItem(lang, 'process', index, 'description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderAboutSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>About Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Story Title</Label>
            <Input
              value={content.about?.storyTitle || ''}
              onChange={(e) => updateField(lang, 'about', 'storyTitle', e.target.value)}
            />
          </div>
          <div>
            <Label>Story Content</Label>
            <Textarea
              value={content.about?.storyContent || ''}
              onChange={(e) => updateField(lang, 'about', 'storyContent', e.target.value)}
              rows={5}
            />
          </div>
          <div>
            <Label>Mission</Label>
            <Textarea
              value={content.about?.mission || ''}
              onChange={(e) => updateField(lang, 'about', 'mission', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Vision</Label>
            <Textarea
              value={content.about?.vision || ''}
              onChange={(e) => updateField(lang, 'about', 'vision', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      {renderTeamSection(lang, content)}
    </>
  );

  const renderTeamSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'team', { name: '', role: '', image: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.team || []).map((item: ContentItem, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Member {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'team', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Photo</Label>
              <ImageUploader
                value={item.image || ''}
                onChange={(url) => updateArrayItem(lang, 'team', index, 'image', url)}
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
        ))}
      </CardContent>
    </Card>
  );

  const renderProductsSection = (lang: 'en' | 'id', content: Record<string, any>) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(lang, 'products', { name: '', description: '', image: '' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {(content.products || []).map((item: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Product {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem(lang, 'products', index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div>
              <Label>Image</Label>
              <ImageUploader
                value={item.image || ''}
                onChange={(url) => updateArrayItem(lang, 'products', index, 'image', url)}
                folder="products"
              />
            </div>
            <div>
              <Label>Name</Label>
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
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
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

  const renderPageContent = (lang: 'en' | 'id', content: Record<string, any>, setContent: React.Dispatch<React.SetStateAction<Record<string, any>>>) => {
    const sections = [];
    
    // Always render hero and SEO
    sections.push(renderHeroSection(lang, content));
    sections.push(renderSEOSection(lang, content, setContent));
    
    // Page-specific sections
    switch (pageKey) {
      case 'contact':
        sections.push(renderContactSection(lang, content));
        break;
      case 'about':
        sections.push(renderAboutSection(lang, content));
        break;
      case 'products':
        sections.push(renderProductsSection(lang, content));
        break;
      case 'corporate-solutions':
        sections.push(renderBenefitsSection(lang, content));
        sections.push(renderProcessSection(lang, content));
        break;
      case 'umkm-solutions':
        sections.push(renderBenefitsSection(lang, content));
        sections.push(renderFeaturesSection(lang, content));
        break;
      case 'case-studies':
        sections.push(renderCaseStudiesSection(lang, content));
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
    'products': 'Produk / Products',
    'corporate-solutions': 'Solusi Korporat / Corporate Solutions',
    'umkm-solutions': 'Solusi UMKM / UMKM Solutions',
    'case-studies': 'Studi Kasus / Case Studies'
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
            {renderPageContent('en', contentEn, setContentEn)}
          </TabsContent>

          <TabsContent value="id" className="space-y-6">
            {renderPageContent('id', contentId, setContentId)}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
