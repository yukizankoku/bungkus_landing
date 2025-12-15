import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminSettings() {
  const { language } = useLanguage();
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [logo, setLogo] = useState({ light: '', dark: '' });
  const [contact, setContact] = useState({ email: '', phone: '', whatsapp: '', address: '' });
  const [social, setSocial] = useState({ instagram: '', facebook: '', linkedin: '', youtube: '', twitter: '' });

  useEffect(() => {
    if (settings) {
      const logoSetting = settings.find(s => s.key === 'logo');
      const contactSetting = settings.find(s => s.key === 'contact');
      const socialSetting = settings.find(s => s.key === 'social');
      
      if (logoSetting?.value) setLogo(logoSetting.value as any);
      if (contactSetting?.value) setContact(contactSetting.value as any);
      if (socialSetting?.value) setSocial(socialSetting.value as any);
    }
  }, [settings]);

  const handleSaveLogo = () => updateSetting.mutate({ key: 'logo', value: logo });
  const handleSaveContact = () => updateSetting.mutate({ key: 'contact', value: contact });
  const handleSaveSocial = () => updateSetting.mutate({ key: 'social', value: social });

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
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Site Settings' : 'Pengaturan Situs'}
        </h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Logo</CardTitle>
            <Button size="sm" onClick={handleSaveLogo} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Light Logo (for dark backgrounds)</Label>
              <ImageUploader
                value={logo.light}
                onChange={(url) => setLogo(prev => ({ ...prev, light: url }))}
                folder="logos"
              />
            </div>
            <div>
              <Label>Dark Logo (for light backgrounds)</Label>
              <ImageUploader
                value={logo.dark}
                onChange={(url) => setLogo(prev => ({ ...prev, dark: url }))}
                folder="logos"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{language === 'en' ? 'Contact Information' : 'Informasi Kontak'}</CardTitle>
            <Button size="sm" onClick={handleSaveContact} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={contact.email} onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={contact.phone} onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={contact.whatsapp} onChange={(e) => setContact(prev => ({ ...prev, whatsapp: e.target.value }))} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={contact.address} onChange={(e) => setContact(prev => ({ ...prev, address: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social Media</CardTitle>
            <Button size="sm" onClick={handleSaveSocial} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Instagram</Label>
              <Input value={social.instagram} onChange={(e) => setSocial(prev => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label>Facebook</Label>
              <Input value={social.facebook} onChange={(e) => setSocial(prev => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input value={social.linkedin} onChange={(e) => setSocial(prev => ({ ...prev, linkedin: e.target.value }))} placeholder="https://linkedin.com/..." />
            </div>
            <div>
              <Label>YouTube</Label>
              <Input value={social.youtube} onChange={(e) => setSocial(prev => ({ ...prev, youtube: e.target.value }))} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label>X (Twitter)</Label>
              <Input value={social.twitter} onChange={(e) => setSocial(prev => ({ ...prev, twitter: e.target.value }))} placeholder="https://x.com/..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
