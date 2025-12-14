import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogs } from '@/hooks/useBlogs';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, MessageSquare, Eye } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { data: blogs } = useBlogs();
  const { data: leads } = useLeads();

  const stats = [
    {
      title: language === 'en' ? 'Total Blogs' : 'Total Blog',
      value: blogs?.length || 0,
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      title: language === 'en' ? 'Published' : 'Terbit',
      value: blogs?.filter(b => b.is_published).length || 0,
      icon: Eye,
      color: 'text-green-500'
    },
    {
      title: language === 'en' ? 'Total Leads' : 'Total Kontak',
      value: leads?.length || 0,
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      title: language === 'en' ? 'Unread Leads' : 'Belum Dibaca',
      value: leads?.filter(l => !l.is_read).length || 0,
      icon: FileText,
      color: 'text-orange-500'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Dashboard' : 'Dasbor'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
