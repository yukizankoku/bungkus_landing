import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlog, useCreateBlog, useUpdateBlog } from '@/hooks/useBlogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import LivePreview from '@/components/admin/LivePreview';

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNew = id === 'new';
  const { data: blog, isLoading } = useBlog(isNew ? '' : id || '');
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();

  const [formData, setFormData] = useState({
    title_en: '',
    title_id: '',
    slug: '',
    excerpt_en: '',
    excerpt_id: '',
    content_en: '',
    content_id: '',
    featured_image: '',
    category: '',
    is_published: false,
    meta_title_en: '',
    meta_title_id: '',
    meta_description_en: '',
    meta_description_id: ''
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        title_en: blog.title_en || '',
        title_id: blog.title_id || '',
        slug: blog.slug || '',
        excerpt_en: blog.excerpt_en || '',
        excerpt_id: blog.excerpt_id || '',
        content_en: blog.content_en || '',
        content_id: blog.content_id || '',
        featured_image: blog.featured_image || '',
        category: blog.category || '',
        is_published: blog.is_published || false,
        meta_title_en: blog.meta_title_en || '',
        meta_title_id: blog.meta_title_id || '',
        meta_description_en: blog.meta_description_en || '',
        meta_description_id: blog.meta_description_id || ''
      });
    }
  }, [blog]);

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSave = () => {
    if (isNew) {
      createBlog.mutate(formData as any, {
        onSuccess: () => navigate('/admin/blogs')
      });
    } else {
      updateBlog.mutate({ id: id!, ...formData });
    }
  };

  const isPending = createBlog.isPending || updateBlog.isPending;

  if (!isNew && isLoading) {
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
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blogs')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isNew ? (language === 'en' ? 'New Blog Post' : 'Post Blog Baru') : (language === 'en' ? 'Edit Blog Post' : 'Edit Post Blog')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
              <Label>{language === 'en' ? 'Published' : 'Terbit'}</Label>
            </div>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {language === 'en' ? 'Save' : 'Simpan'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="id">Indonesia</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label>Title (H1)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          title_en: e.target.value,
                          slug: isNew ? generateSlug(e.target.value) : prev.slug
                        }));
                      }}
                      placeholder="Enter blog title..."
                    />
                  </div>
                  <div>
                    <Label>Excerpt</Label>
                    <Input
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                      placeholder="Brief summary..."
                    />
                  </div>
                  <div>
                    <Label>Content (Use H1, H2, H3 for SEO)</Label>
                    <RichTextEditor
                      value={formData.content_en}
                      onChange={(value) => setFormData(prev => ({ ...prev, content_en: value }))}
                      placeholder="Write your blog content..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="id" className="space-y-4">
                  <div>
                    <Label>Judul (H1)</Label>
                    <Input
                      value={formData.title_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_id: e.target.value }))}
                      placeholder="Masukkan judul blog..."
                    />
                  </div>
                  <div>
                    <Label>Ringkasan</Label>
                    <Input
                      value={formData.excerpt_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt_id: e.target.value }))}
                      placeholder="Ringkasan singkat..."
                    />
                  </div>
                  <div>
                    <Label>Konten (Gunakan H1, H2, H3 untuk SEO)</Label>
                    <RichTextEditor
                      value={formData.content_id}
                      onChange={(value) => setFormData(prev => ({ ...prev, content_id: value }))}
                      placeholder="Tulis konten blog Anda..."
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={formData.featured_image}
                    onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                    folder="blogs"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Tips & Tricks"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Meta Title (EN)</Label>
                    <Input
                      value={formData.meta_title_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title_en: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Meta Title (ID)</Label>
                    <Input
                      value={formData.meta_title_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_title_id: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Meta Description (EN)</Label>
                    <Input
                      value={formData.meta_description_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description_en: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Meta Description (ID)</Label>
                    <Input
                      value={formData.meta_description_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, meta_description_id: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="hidden xl:block sticky top-6">
            {isNew ? (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Blog Preview</p>
                  <p className="text-sm">Save the blog post to see preview</p>
                </CardContent>
              </Card>
            ) : formData.slug ? (
              <LivePreview 
                path={`/blog/${formData.slug}`} 
                title="Blog Preview" 
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Blog Preview</p>
                  <p className="text-sm">Add a slug to see preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
