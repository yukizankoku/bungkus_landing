import { useLanguage } from '@/contexts/LanguageContext';
import { useLeads, useMarkLeadAsRead } from '@/hooks/useLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, Building } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminLeads() {
  const { language } = useLanguage();
  const { data: leads, isLoading } = useLeads();
  const markAsRead = useMarkLeadAsRead();

  const handleClick = (id: string, isRead: boolean | null) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Contact Submissions' : 'Kontak Masuk'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leads?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === 'en' ? 'No submissions yet.' : 'Belum ada kontak masuk.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads?.map((lead) => (
              <Card 
                key={lead.id} 
                className={`cursor-pointer transition-colors ${!lead.is_read ? 'border-primary/50 bg-primary/5' : ''}`}
                onClick={() => handleClick(lead.id, lead.is_read)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{lead.name}</h3>
                      {!lead.is_read && (
                        <Badge>{language === 'en' ? 'New' : 'Baru'}</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(lead.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </span>
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.company && (
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {lead.company}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{lead.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
