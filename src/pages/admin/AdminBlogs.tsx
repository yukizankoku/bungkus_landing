import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogs, useDeleteBlog } from '@/hooks/useBlogs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminBlogs() {
  const { language } = useLanguage();
  const { data: blogs, isLoading } = useBlogs();
  const deleteBlog = useDeleteBlog();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Manage Blogs' : 'Kelola Blog'}
          </h1>
          <Link to="/admin/blogs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'New Post' : 'Post Baru'}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : blogs?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === 'en' ? 'No blog posts yet.' : 'Belum ada post blog.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {blogs?.map((blog) => (
              <Card key={blog.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {language === 'en' ? blog.title_en : blog.title_id}
                      </h3>
                      <Badge variant={blog.is_published ? 'default' : 'secondary'}>
                        {blog.is_published ? (language === 'en' ? 'Published' : 'Terbit') : (language === 'en' ? 'Draft' : 'Draf')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {blog.category} • {new Date(blog.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/blogs/${blog.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        if (confirm(language === 'en' ? 'Delete this post?' : 'Hapus post ini?')) {
                          deleteBlog.mutate(blog.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
