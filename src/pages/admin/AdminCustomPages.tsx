import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  Plus, 
  FileText, 
  Pencil, 
  Trash2, 
  Eye,
  EyeOff,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  useCustomPagesHierarchy,
  useDeleteCustomPage,
  CustomPage
} from '@/hooks/useCustomPages';
import { cn } from '@/lib/utils';

interface PageRowProps {
  page: CustomPage;
  level: number;
  language: 'en' | 'id';
  onDelete: (id: string) => void;
}

function PageRow({ page, level, language, onDelete }: PageRowProps) {
  const statusColors: Record<string, string> = {
    published: 'bg-green-500/10 text-green-600 border-green-500/20',
    draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    archived: 'bg-muted text-muted-foreground border-muted',
  };

  const templateLabels: Record<string, string> = {
    default: language === 'en' ? 'Default' : 'Default',
    landing: language === 'en' ? 'Landing Page' : 'Landing Page',
    blank: language === 'en' ? 'Blank' : 'Kosong',
  };

  return (
    <>
      <div 
        className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        style={{ marginLeft: level * 24 }}
      >
        {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        
        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {language === 'en' ? page.title_en : page.title_id}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            /{page.slug}
          </div>
        </div>

        <Badge variant="outline" className={statusColors[page.status]}>
          {page.status}
        </Badge>

        <Badge variant="outline" className="text-xs">
          {templateLabels[page.template] || page.template}
        </Badge>

        <div className="flex items-center gap-1">
          {page.status === 'published' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <Link to={`/admin/custom-pages/${page.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(page.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {page.children && page.children.length > 0 && (
        <div className="space-y-2 mt-2">
          {page.children.map(child => (
            <PageRow 
              key={child.id} 
              page={child} 
              level={level + 1} 
              language={language}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminCustomPages() {
  const { language } = useLanguage();
  const { data: pages, isLoading } = useCustomPagesHierarchy();
  const deletePage = useDeleteCustomPage();
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deletePageId) {
      await deletePage.mutateAsync(deletePageId);
      setDeletePageId(null);
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
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {language === 'en' ? 'Custom Pages' : 'Halaman Kustom'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'en' 
                ? 'Create and manage dynamic pages with custom URLs' 
                : 'Buat dan kelola halaman dinamis dengan URL kustom'}
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/custom-pages/new">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Create Page' : 'Buat Halaman'}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'en' ? 'All Pages' : 'Semua Halaman'}</CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Manage your custom pages. Pages can have parent-child relationships for hierarchy.' 
                : 'Kelola halaman kustom Anda. Halaman dapat memiliki hubungan induk-anak untuk hierarki.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pages && pages.length > 0 ? (
              pages.map(page => (
                <PageRow 
                  key={page.id} 
                  page={page} 
                  level={0} 
                  language={language as 'en' | 'id'}
                  onDelete={setDeletePageId}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {language === 'en' ? 'No custom pages yet' : 'Belum ada halaman kustom'}
                </p>
                <p className="text-sm mb-4">
                  {language === 'en' 
                    ? 'Create your first custom page to get started.' 
                    : 'Buat halaman kustom pertama Anda untuk memulai.'}
                </p>
                <Button asChild>
                  <Link to="/admin/custom-pages/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Create Page' : 'Buat Halaman'}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Delete Page?' : 'Hapus Halaman?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'This will permanently delete this page. Child pages will become top-level pages. This action cannot be undone.'
                : 'Ini akan menghapus halaman ini secara permanen. Halaman anak akan menjadi halaman level atas. Tindakan ini tidak dapat dibatalkan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'en' ? 'Cancel' : 'Batal'}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePage.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Delete' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
