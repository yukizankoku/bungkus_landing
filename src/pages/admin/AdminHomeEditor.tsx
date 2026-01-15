import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import LivePreview from '@/components/admin/LivePreview';
import IconSelector from '@/components/admin/IconSelector';
import PageLinkSelector from '@/components/admin/PageLinkSelector';
import SEOAudit from '@/components/admin/SEOAudit';
import { usePageContent, useUpdatePageContent } from '@/hooks/usePageContent';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminHomeEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: pageContent, isLoading } = usePageContent('home');
  const updatePageContent = useUpdatePageContent();

  const [contentEn, setContentEn] = useState<Record<string, any>>({});
  const [contentId, setContentId] = useState<Record<string, any>>({});

  useEffect(() => {
    if (pageContent) {
      setContentEn(pageContent.content_en || {});
      setContentId(pageContent.content_id || {});
    }
  }, [pageContent]);

  const handleSave = async () => {
    await updatePageContent.mutateAsync({
      pageKey: 'home',
      contentEn,
      contentId
    });
  };

  const updateSection = (lang: 'en' | 'id', section: string, key: string, value: any) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateArrayItem = (lang: 'en' | 'id', section: string, arrayKey: string, index: number, field: string, value: any) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter(prev => {
      const items = [...(prev[section]?.[arrayKey] || [])];
      items[index] = { ...items[index], [field]: value };
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [arrayKey]: items
        }
      };
    });
  };

  const addArrayItem = (lang: 'en' | 'id', section: string, arrayKey: string, defaultItem: any) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [arrayKey]: [...(prev[section]?.[arrayKey] || []), defaultItem]
      }
    }));
  };

  const removeArrayItem = (lang: 'en' | 'id', section: string, arrayKey: string, index: number) => {
    const setter = lang === 'en' ? setContentEn : setContentId;
    setter(prev => {
      const items = [...(prev[section]?.[arrayKey] || [])];
      items.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [arrayKey]: items
        }
      };
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Edit Home Page</h1>
            <p className="text-muted-foreground">Manage all sections of your home page</p>
          </div>
          <Button onClick={handleSave} disabled={updatePageContent.isPending} className="min-w-[140px]">
            <span className="w-4 h-4 mr-2 inline-flex items-center justify-center">
              <Save className="h-4 w-4" />
            </span>
            {updatePageContent.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <Tabs defaultValue="hero" className="space-y-6">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                <TabsTrigger value="cta">CTA</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(contentEn.hero?.images || []).map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <ImageUploader
                        value={image}
                        onChange={(url) => {
                          const images = [...(contentEn.hero?.images || [])];
                          images[index] = url;
                          updateSection('en', 'hero', 'images', images);
                          updateSection('id', 'hero', 'images', images);
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const images = [...(contentEn.hero?.images || [])];
                          images.splice(index, 1);
                          updateSection('en', 'hero', 'images', images);
                          updateSection('id', 'hero', 'images', images);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const images = [...(contentEn.hero?.images || []), ''];
                      updateSection('en', 'hero', 'images', images);
                      updateSection('id', 'hero', 'images', images);
                    }}
                    className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Badge Text</Label>
                    <Input
                      value={contentEn.hero?.badge || ''}
                      onChange={(e) => updateSection('en', 'hero', 'badge', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Textarea
                      value={contentEn.hero?.title || ''}
                      onChange={(e) => updateSection('en', 'hero', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Textarea
                      value={contentEn.hero?.subtitle || ''}
                      onChange={(e) => updateSection('en', 'hero', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary CTA Text</Label>
                      <Input
                        value={contentEn.hero?.cta_primary || ''}
                        onChange={(e) => updateSection('en', 'hero', 'cta_primary', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Text</Label>
                      <Input
                        value={contentEn.hero?.cta_secondary || ''}
                        onChange={(e) => updateSection('en', 'hero', 'cta_secondary', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PageLinkSelector
                      label="Primary CTA Link"
                      value={contentEn.hero?.cta_primary_link || '/solusi-korporat'}
                      onChange={(value) => {
                        updateSection('en', 'hero', 'cta_primary_link', value);
                        updateSection('id', 'hero', 'cta_primary_link', value);
                      }}
                    />
                    <PageLinkSelector
                      label="Secondary CTA Link"
                      value={contentEn.hero?.cta_secondary_link || '/solusi-umkm'}
                      onChange={(value) => {
                        updateSection('en', 'hero', 'cta_secondary_link', value);
                        updateSection('id', 'hero', 'cta_secondary_link', value);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Badge Text</Label>
                    <Input
                      value={contentId.hero?.badge || ''}
                      onChange={(e) => updateSection('id', 'hero', 'badge', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Textarea
                      value={contentId.hero?.title || ''}
                      onChange={(e) => updateSection('id', 'hero', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Textarea
                      value={contentId.hero?.subtitle || ''}
                      onChange={(e) => updateSection('id', 'hero', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary CTA Text</Label>
                      <Input
                        value={contentId.hero?.cta_primary || ''}
                        onChange={(e) => updateSection('id', 'hero', 'cta_primary', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Text</Label>
                      <Input
                        value={contentId.hero?.cta_secondary || ''}
                        onChange={(e) => updateSection('id', 'hero', 'cta_secondary', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentEn.features?.title || ''}
                      onChange={(e) => updateSection('en', 'features', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentEn.features?.subtitle || ''}
                      onChange={(e) => updateSection('en', 'features', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Features</Label>
                    {(contentEn.features?.items || []).map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Feature {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('en', 'features', 'items', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Icon</Label>
                          <IconSelector
                            value={item.icon || 'Package'}
                            onChange={(value) => {
                              updateArrayItem('en', 'features', 'items', index, 'icon', value);
                              updateArrayItem('id', 'features', 'items', index, 'icon', value);
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Title"
                          value={item.title || ''}
                          onChange={(e) => updateArrayItem('en', 'features', 'items', index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => updateArrayItem('en', 'features', 'items', index, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addArrayItem('en', 'features', 'items', { icon: 'Package', title: '', description: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentId.features?.title || ''}
                      onChange={(e) => updateSection('id', 'features', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentId.features?.subtitle || ''}
                      onChange={(e) => updateSection('id', 'features', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Features</Label>
                    {(contentId.features?.items || []).map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Feature {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('id', 'features', 'items', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Icon</Label>
                          <IconSelector
                            value={item.icon || 'Package'}
                            onChange={(value) => {
                              updateArrayItem('en', 'features', 'items', index, 'icon', value);
                              updateArrayItem('id', 'features', 'items', index, 'icon', value);
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Title"
                          value={item.title || ''}
                          onChange={(e) => updateArrayItem('id', 'features', 'items', index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => updateArrayItem('id', 'features', 'items', index, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addArrayItem('id', 'features', 'items', { icon: 'Package', title: '', description: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Section */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(contentEn.stats?.items || []).map((item: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Stat {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('en', 'stats', 'items', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          placeholder="Value"
                          value={item.value || ''}
                          onChange={(e) => updateArrayItem('en', 'stats', 'items', index, 'value', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          placeholder="Suffix (+, M+, etc)"
                          value={item.suffix || ''}
                          onChange={(e) => updateArrayItem('en', 'stats', 'items', index, 'suffix', e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Label"
                        value={item.label || ''}
                        onChange={(e) => updateArrayItem('en', 'stats', 'items', index, 'label', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem('en', 'stats', 'items', { value: 0, suffix: '+', label: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(contentId.stats?.items || []).map((item: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Stat {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('id', 'stats', 'items', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          placeholder="Value"
                          value={item.value || ''}
                          onChange={(e) => updateArrayItem('id', 'stats', 'items', index, 'value', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          placeholder="Suffix"
                          value={item.suffix || ''}
                          onChange={(e) => updateArrayItem('id', 'stats', 'items', index, 'suffix', e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Label"
                        value={item.label || ''}
                        onChange={(e) => updateArrayItem('id', 'stats', 'items', index, 'label', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem('id', 'stats', 'items', { value: 0, suffix: '+', label: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Section */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentEn.products?.title || ''}
                      onChange={(e) => updateSection('en', 'products', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentEn.products?.subtitle || ''}
                      onChange={(e) => updateSection('en', 'products', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Products</Label>
                      <span className="text-xs text-muted-foreground">Images sync across languages</span>
                    </div>
                    {(contentEn.products?.items || []).map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Product {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeArrayItem('en', 'products', 'items', index);
                              removeArrayItem('id', 'products', 'items', index);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <ImageUploader
                          value={item.image || ''}
                          onChange={(url) => {
                            updateArrayItem('en', 'products', 'items', index, 'image', url);
                            updateArrayItem('id', 'products', 'items', index, 'image', url);
                          }}
                        />
                        <Input
                          placeholder="Name"
                          value={item.name || ''}
                          onChange={(e) => updateArrayItem('en', 'products', 'items', index, 'name', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => updateArrayItem('en', 'products', 'items', index, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        addArrayItem('en', 'products', 'items', { image: '', name: '', description: '' });
                        addArrayItem('id', 'products', 'items', { image: '', name: '', description: '' });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentId.products?.title || ''}
                      onChange={(e) => updateSection('id', 'products', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentId.products?.subtitle || ''}
                      onChange={(e) => updateSection('id', 'products', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Products</Label>
                      <span className="text-xs text-muted-foreground">Images managed in English tab</span>
                    </div>
                    {(contentId.products?.items || []).map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Product {index + 1}</span>
                        </div>
                        {item.image && (
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Input
                          placeholder="Name"
                          value={item.name || ''}
                          onChange={(e) => updateArrayItem('id', 'products', 'items', index, 'name', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => updateArrayItem('id', 'products', 'items', index, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Section */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentEn.clients?.title || ''}
                      onChange={(e) => updateSection('en', 'clients', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentEn.clients?.subtitle || ''}
                      onChange={(e) => updateSection('en', 'clients', 'subtitle', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentId.clients?.title || ''}
                      onChange={(e) => updateSection('id', 'clients', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentId.clients?.subtitle || ''}
                      onChange={(e) => updateSection('id', 'clients', 'subtitle', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Marquee Speed Control */}
            <Card>
              <CardHeader>
                <CardTitle>Marquee Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Speed control only applies when you have 5+ logos (marquee mode)
                </p>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Animation Speed</Label>
                  <select
                    className="w-full mt-2 p-2 border rounded-md bg-background"
                    value={contentEn.clients?.marquee_speed || 'normal'}
                    onChange={(e) => {
                      updateSection('en', 'clients', 'marquee_speed', e.target.value);
                      updateSection('id', 'clients', 'marquee_speed', e.target.value);
                    }}
                  >
                    <option value="slow">Slow (45s)</option>
                    <option value="normal">Normal (30s)</option>
                    <option value="fast">Fast (15s)</option>
                    <option value="very-fast">Very Fast (10s)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Logos (Drag to Reorder)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {(contentEn.clients?.logos || []).length <= 4 
                    ? 'Logos will display in a static grid (1-4 logos)'
                    : 'Logos will scroll in an infinite marquee (5+ logos)'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(contentEn.clients?.logos || []).map((logo: any, index: number) => (
                    <div 
                      key={index} 
                      className="relative p-4 border rounded-lg bg-card cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                        e.currentTarget.classList.add('opacity-50');
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove('opacity-50');
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('ring-2', 'ring-primary');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('ring-2', 'ring-primary');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('ring-2', 'ring-primary');
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const toIndex = index;
                        if (fromIndex !== toIndex) {
                          // Reorder logos in both EN and ID
                          const logosEn = [...(contentEn.clients?.logos || [])];
                          const logosId = [...(contentId.clients?.logos || [])];
                          const [movedEn] = logosEn.splice(fromIndex, 1);
                          const [movedId] = logosId.splice(fromIndex, 1);
                          logosEn.splice(toIndex, 0, movedEn);
                          logosId.splice(toIndex, 0, movedId);
                          updateSection('en', 'clients', 'logos', logosEn);
                          updateSection('id', 'clients', 'logos', logosId);
                        }
                      }}
                    >
                      <div className="absolute top-2 left-2 cursor-grab">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          removeArrayItem('en', 'clients', 'logos', index);
                          removeArrayItem('id', 'clients', 'logos', index);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="pt-4">
                        <ImageUploader
                          value={logo.image || ''}
                          onChange={(url) => {
                            updateArrayItem('en', 'clients', 'logos', index, 'image', url);
                            updateArrayItem('id', 'clients', 'logos', index, 'image', url);
                          }}
                        />
                        <Input
                          placeholder="Company Name"
                          className="mt-2"
                          value={logo.name || ''}
                          onChange={(e) => {
                            updateArrayItem('en', 'clients', 'logos', index, 'name', e.target.value);
                            updateArrayItem('id', 'clients', 'logos', index, 'name', e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      addArrayItem('en', 'clients', 'logos', { name: '', image: '' });
                      addArrayItem('id', 'clients', 'logos', { name: '', image: '' });
                    }}
                    className="p-4 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors min-h-[180px]"
                  >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Section */}
          <TabsContent value="testimonials" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentEn.testimonials?.title || ''}
                      onChange={(e) => updateSection('en', 'testimonials', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentEn.testimonials?.subtitle || ''}
                      onChange={(e) => updateSection('en', 'testimonials', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Testimonials</Label>
                    {(contentEn.testimonials?.items || []).map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Testimonial {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('en', 'testimonials', 'items', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Quote"
                          value={item.quote || ''}
                          onChange={(e) => updateArrayItem('en', 'testimonials', 'items', index, 'quote', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Name"
                            value={item.name || ''}
                            onChange={(e) => updateArrayItem('en', 'testimonials', 'items', index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Role"
                            value={item.role || ''}
                            onChange={(e) => updateArrayItem('en', 'testimonials', 'items', index, 'role', e.target.value)}
                          />
                        </div>
                        <Input
                          placeholder="Company"
                          value={item.company || ''}
                          onChange={(e) => updateArrayItem('en', 'testimonials', 'items', index, 'company', e.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addArrayItem('en', 'testimonials', 'items', { quote: '', name: '', role: '', company: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={contentId.testimonials?.title || ''}
                      onChange={(e) => updateSection('id', 'testimonials', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={contentId.testimonials?.subtitle || ''}
                      onChange={(e) => updateSection('id', 'testimonials', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Testimonials</Label>
                    {(contentId.testimonials?.items || []).map((item: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Testimonial {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('id', 'testimonials', 'items', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Quote"
                          value={item.quote || ''}
                          onChange={(e) => updateArrayItem('id', 'testimonials', 'items', index, 'quote', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Name"
                            value={item.name || ''}
                            onChange={(e) => updateArrayItem('id', 'testimonials', 'items', index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Role"
                            value={item.role || ''}
                            onChange={(e) => updateArrayItem('id', 'testimonials', 'items', index, 'role', e.target.value)}
                          />
                        </div>
                        <Input
                          placeholder="Company"
                          value={item.company || ''}
                          onChange={(e) => updateArrayItem('id', 'testimonials', 'items', index, 'company', e.target.value)}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addArrayItem('id', 'testimonials', 'items', { quote: '', name: '', role: '', company: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CTA Section */}
          <TabsContent value="cta" className="space-y-6">
            {/* CTA Button Links - Shared across languages */}
            <Card>
              <CardHeader>
                <CardTitle>CTA Button Links (Both Languages)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PageLinkSelector
                  label="Primary Button Link"
                  value={contentEn.cta?.primary_button_link || '/hubungi-kami'}
                  onChange={(value) => {
                    updateSection('en', 'cta', 'primary_button_link', value);
                    updateSection('id', 'cta', 'primary_button_link', value);
                  }}
                />
                <PageLinkSelector
                  label="Secondary Button Link"
                  value={contentEn.cta?.secondary_button_link || '/produk'}
                  onChange={(value) => {
                    updateSection('en', 'cta', 'secondary_button_link', value);
                    updateSection('id', 'cta', 'secondary_button_link', value);
                  }}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={contentEn.cta?.title || ''}
                      onChange={(e) => updateSection('en', 'cta', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Textarea
                      value={contentEn.cta?.subtitle || ''}
                      onChange={(e) => updateSection('en', 'cta', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Button Text</Label>
                      <Input
                        value={contentEn.cta?.primary_button || ''}
                        onChange={(e) => updateSection('en', 'cta', 'primary_button', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Secondary Button Text</Label>
                      <Input
                        value={contentEn.cta?.secondary_button || ''}
                        onChange={(e) => updateSection('en', 'cta', 'secondary_button', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={contentId.cta?.title || ''}
                      onChange={(e) => updateSection('id', 'cta', 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Textarea
                      value={contentId.cta?.subtitle || ''}
                      onChange={(e) => updateSection('id', 'cta', 'subtitle', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Button Text</Label>
                      <Input
                        value={contentId.cta?.primary_button || ''}
                        onChange={(e) => updateSection('id', 'cta', 'primary_button', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Secondary Button Text</Label>
                      <Input
                        value={contentId.cta?.secondary_button || ''}
                        onChange={(e) => updateSection('id', 'cta', 'secondary_button', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Section */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>English SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={contentEn.meta_title || ''}
                      onChange={(e) => setContentEn(prev => ({ ...prev, meta_title: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(contentEn.meta_title || '').length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={contentEn.meta_description || ''}
                      onChange={(e) => setContentEn(prev => ({ ...prev, meta_description: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(contentEn.meta_description || '').length}/160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indonesian SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={contentId.meta_title || ''}
                      onChange={(e) => setContentId(prev => ({ ...prev, meta_title: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(contentId.meta_title || '').length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={contentId.meta_description || ''}
                      onChange={(e) => setContentId(prev => ({ ...prev, meta_description: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(contentId.meta_description || '').length}/160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEO Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SEOAudit
                title={contentEn.hero?.title || ''}
                metaTitle={contentEn.meta_title || contentEn.hero?.title || ''}
                metaDescription={contentEn.meta_description || contentEn.hero?.subtitle || ''}
                content={JSON.stringify(contentEn)}
                language="en"
              />
              <SEOAudit
                title={contentId.hero?.title || ''}
                metaTitle={contentId.meta_title || contentId.hero?.title || ''}
                metaDescription={contentId.meta_description || contentId.hero?.subtitle || ''}
                content={JSON.stringify(contentId)}
                language="id"
              />
            </div>
          </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden xl:block sticky top-6">
            <LivePreview path="/" title="Home Preview" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}