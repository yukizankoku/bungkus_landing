import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, MessageCircle, Search, Globe, Copy, Check, Megaphone, ShieldCheck } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import PageLinkSelector from '@/components/admin/PageLinkSelector';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { language } = useLanguage();
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const [logo, setLogo] = useState({ light: '', dark: '' });
  const [contact, setContact] = useState({ email: '', phone: '', whatsapp: '', address: '' });
  const [social, setSocial] = useState({ instagram: '', facebook: '', linkedin: '', youtube: '', twitter: '' });
  const [favicon, setFavicon] = useState({ url: '' });
  const [whatsapp, setWhatsapp] = useState({
    phone: '',
    message_en: '',
    message_id: '',
    button_text_en: '',
    button_text_id: '',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left',
    enabled: true
  });
  const [seo, setSeo] = useState({
    meta_robots: 'index, follow',
    google_analytics_id: '',
    google_tag_manager_id: '',
    google_search_console: '',
    sitemap_enabled: true,
    robots_txt: '',
    page_indexing: {} as Record<string, boolean>,
    // Advertising Tags
    meta_pixel_id: '',
    google_ads_id: '',
    google_ads_conversion_label: '',
    tiktok_pixel_id: '',
    // Domain Verification
    meta_domain_verification: '',
    tiktok_domain_verification: ''
  });
  const [ctaDefaults, setCtaDefaults] = useState({
    primary_button_link: '/hubungi-kami',
    secondary_button_link: '/produk',
    primary_button_text_en: 'Contact Us',
    primary_button_text_id: 'Hubungi Kami',
    secondary_button_text_en: 'View Products',
    secondary_button_text_id: 'Lihat Produk'
  });

  const handleCopyRobotsTxt = async () => {
    if (!seo.robots_txt) return;
    try {
      await navigator.clipboard.writeText(seo.robots_txt);
      setCopied(true);
      toast({
        title: language === 'en' ? 'Copied!' : 'Disalin!',
        description: language === 'en' ? 'robots.txt content copied to clipboard' : 'Konten robots.txt disalin ke clipboard'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error',
        description: language === 'en' ? 'Failed to copy' : 'Gagal menyalin',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (settings) {
      const logoSetting = settings.find(s => s.key === 'logo');
      const contactSetting = settings.find(s => s.key === 'contact');
      const socialSetting = settings.find(s => s.key === 'social');
      const faviconSetting = settings.find(s => s.key === 'favicon');
      const whatsappSetting = settings.find(s => s.key === 'whatsapp');
      const seoSetting = settings.find(s => s.key === 'seo');
      const ctaDefaultsSetting = settings.find(s => s.key === 'cta_defaults');
      
      if (logoSetting?.value) setLogo(logoSetting.value as any);
      if (contactSetting?.value) setContact(contactSetting.value as any);
      if (socialSetting?.value) setSocial(socialSetting.value as any);
      if (faviconSetting?.value) setFavicon(faviconSetting.value as any);
      if (whatsappSetting?.value) setWhatsapp({ ...whatsapp, ...(whatsappSetting.value as any) });
      if (seoSetting?.value) setSeo({ ...seo, ...(seoSetting.value as any) });
      if (ctaDefaultsSetting?.value) setCtaDefaults({ ...ctaDefaults, ...(ctaDefaultsSetting.value as any) });
    }
  }, [settings]);

  const handleSaveLogo = () => updateSetting.mutate({ key: 'logo', value: logo });
  const handleSaveContact = () => updateSetting.mutate({ key: 'contact', value: contact });
  const handleSaveSocial = () => updateSetting.mutate({ key: 'social', value: social });
  const handleSaveFavicon = () => updateSetting.mutate({ key: 'favicon', value: favicon });
  const handleSaveWhatsapp = () => updateSetting.mutate({ key: 'whatsapp', value: whatsapp });
  const handleSaveSeo = () => updateSetting.mutate({ key: 'seo', value: seo });
  const handleSaveCtaDefaults = () => updateSetting.mutate({ key: 'cta_defaults', value: ctaDefaults });

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

        {/* WhatsApp Button Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              <div>
                <CardTitle>{language === 'en' ? 'WhatsApp Button' : 'Tombol WhatsApp'}</CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Configure the floating WhatsApp chat button' : 'Konfigurasi tombol chat WhatsApp mengambang'}
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleSaveWhatsapp} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>{language === 'en' ? 'Enable WhatsApp Button' : 'Aktifkan Tombol WhatsApp'}</Label>
              <Switch 
                checked={whatsapp.enabled} 
                onCheckedChange={(checked) => setWhatsapp(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Phone Number (with country code)' : 'Nomor Telepon (dengan kode negara)'}</Label>
                <Input 
                  value={whatsapp.phone} 
                  onChange={(e) => setWhatsapp(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="6281234567890"
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Position' : 'Posisi'}</Label>
                <Select 
                  value={whatsapp.position} 
                  onValueChange={(value: 'bottom-right' | 'bottom-left') => setWhatsapp(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="bottom-right">{language === 'en' ? 'Bottom Right' : 'Kanan Bawah'}</SelectItem>
                    <SelectItem value="bottom-left">{language === 'en' ? 'Bottom Left' : 'Kiri Bawah'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Button Text (English)</Label>
                <Input 
                  value={whatsapp.button_text_en} 
                  onChange={(e) => setWhatsapp(prev => ({ ...prev, button_text_en: e.target.value }))}
                  placeholder="Chat with Us"
                />
              </div>
              <div>
                <Label>Button Text (Indonesian)</Label>
                <Input 
                  value={whatsapp.button_text_id} 
                  onChange={(e) => setWhatsapp(prev => ({ ...prev, button_text_id: e.target.value }))}
                  placeholder="Chat dengan Kami"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Message Template (English)</Label>
                <Textarea 
                  value={whatsapp.message_en} 
                  onChange={(e) => setWhatsapp(prev => ({ ...prev, message_en: e.target.value }))}
                  placeholder="Hello, I am interested in your packaging services."
                  rows={3}
                />
              </div>
              <div>
                <Label>Message Template (Indonesian)</Label>
                <Textarea 
                  value={whatsapp.message_id} 
                  onChange={(e) => setWhatsapp(prev => ({ ...prev, message_id: e.target.value }))}
                  placeholder="Halo, saya tertarik dengan layanan kemasan Anda."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global CTA Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'en' ? 'Global CTA Settings' : 'Pengaturan CTA Global'}</CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Default CTA button settings for all pages (can be overridden per page)' : 'Pengaturan tombol CTA default untuk semua halaman (bisa ditimpa per halaman)'}
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleSaveCtaDefaults} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PageLinkSelector
                label={language === 'en' ? 'Primary Button Link' : 'Link Tombol Utama'}
                value={ctaDefaults.primary_button_link}
                onChange={(value) => setCtaDefaults(prev => ({ ...prev, primary_button_link: value }))}
              />
              <PageLinkSelector
                label={language === 'en' ? 'Secondary Button Link' : 'Link Tombol Sekunder'}
                value={ctaDefaults.secondary_button_link}
                onChange={(value) => setCtaDefaults(prev => ({ ...prev, secondary_button_link: value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Primary Button Text (English)' : 'Teks Tombol Utama (Inggris)'}</Label>
                <Input 
                  value={ctaDefaults.primary_button_text_en} 
                  onChange={(e) => setCtaDefaults(prev => ({ ...prev, primary_button_text_en: e.target.value }))}
                  placeholder="Contact Us"
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Primary Button Text (Indonesian)' : 'Teks Tombol Utama (Indonesia)'}</Label>
                <Input 
                  value={ctaDefaults.primary_button_text_id} 
                  onChange={(e) => setCtaDefaults(prev => ({ ...prev, primary_button_text_id: e.target.value }))}
                  placeholder="Hubungi Kami"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Secondary Button Text (English)' : 'Teks Tombol Sekunder (Inggris)'}</Label>
                <Input 
                  value={ctaDefaults.secondary_button_text_en} 
                  onChange={(e) => setCtaDefaults(prev => ({ ...prev, secondary_button_text_en: e.target.value }))}
                  placeholder="View Products"
                />
              </div>
              <div>
                <Label>{language === 'en' ? 'Secondary Button Text (Indonesian)' : 'Teks Tombol Sekunder (Indonesia)'}</Label>
                <Input 
                  value={ctaDefaults.secondary_button_text_id} 
                  onChange={(e) => setCtaDefaults(prev => ({ ...prev, secondary_button_text_id: e.target.value }))}
                  placeholder="Lihat Produk"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'en' ? 'SEO & Indexing' : 'SEO & Pengindeksan'}</CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Configure search engine optimization settings' : 'Konfigurasi pengaturan optimasi mesin pencari'}
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleSaveSeo} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{language === 'en' ? 'Meta Robots Default' : 'Default Meta Robots'}</Label>
                <Select 
                  value={seo.meta_robots} 
                  onValueChange={(value) => setSeo(prev => ({ ...prev, meta_robots: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="index, follow">index, follow (Recommended)</SelectItem>
                    <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                    <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                    <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Google Analytics 4 ID</Label>
                <Input 
                  value={seo.google_analytics_id} 
                  onChange={(e) => setSeo(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Your GA4 measurement ID' : 'ID pengukuran GA4 Anda'}
                </p>
              </div>
            </div>

            <div>
              <Label>Google Tag Manager ID</Label>
              <Input 
                value={seo.google_tag_manager_id} 
                onChange={(e) => setSeo(prev => ({ ...prev, google_tag_manager_id: e.target.value }))}
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' ? 'Your GTM container ID' : 'ID container GTM Anda'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>{language === 'en' ? 'Enable Sitemap' : 'Aktifkan Sitemap'}</Label>
              <Switch 
                checked={seo.sitemap_enabled} 
                onCheckedChange={(checked) => setSeo(prev => ({ ...prev, sitemap_enabled: checked }))}
              />
            </div>

            {/* Page Indexing Controls */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">{language === 'en' ? 'Page Indexing' : 'Pengindeksan Halaman'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Enable or disable search engine indexing for each page' 
                    : 'Aktifkan atau nonaktifkan pengindeksan mesin pencari untuk setiap halaman'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'home', label: 'Home / Beranda' },
                  { key: 'about', label: 'About / Tentang' },
                  { key: 'products', label: 'Products / Produk' },
                  { key: 'product-catalog', label: 'Product Catalog / Katalog Produk' },
                  { key: 'corporate-solutions', label: 'Corporate Solutions / Solusi Korporat' },
                  { key: 'umkm-solutions', label: 'UMKM Solutions / Solusi UMKM' },
                  { key: 'case-studies', label: 'Case Studies / Studi Kasus' },
                  { key: 'blog', label: 'Blog' },
                  { key: 'contact', label: 'Contact / Kontak' },
                  { key: 'terms-conditions', label: 'Terms & Conditions / Syarat & Ketentuan' },
                  { key: 'privacy-policy', label: 'Privacy Policy / Kebijakan Privasi' },
                ].map((page) => (
                  <div key={page.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <span className="text-sm font-medium">{page.label}</span>
                    <Switch 
                      checked={seo.page_indexing[page.key] !== false}
                      onCheckedChange={(checked) => setSeo(prev => ({ 
                        ...prev, 
                        page_indexing: { ...prev.page_indexing, [page.key]: checked }
                      }))}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'en' 
                  ? 'Pages with indexing disabled will have "noindex, nofollow" meta tag.' 
                  : 'Halaman dengan pengindeksan dinonaktifkan akan memiliki meta tag "noindex, nofollow".'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>robots.txt {language === 'en' ? 'Content' : 'Konten'}</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyRobotsTxt}
                  disabled={!seo.robots_txt}
                  className="gap-1"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? (language === 'en' ? 'Copied' : 'Disalin') : (language === 'en' ? 'Copy' : 'Salin')}
                </Button>
              </div>
              <Textarea 
                value={seo.robots_txt} 
                onChange={(e) => setSeo(prev => ({ ...prev, robots_txt: e.target.value }))}
                placeholder="User-agent: *&#10;Allow: /&#10;&#10;Sitemap: https://yourdomain.com/sitemap.xml"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'en' 
                  ? 'Note: This is for reference. To update the actual robots.txt file, copy this content and update the public/robots.txt file in your repository, then redeploy.' 
                  : 'Catatan: Ini hanya untuk referensi. Untuk memperbarui file robots.txt yang sebenarnya, salin konten ini dan perbarui file public/robots.txt di repositori Anda, lalu deploy ulang.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advertising Tags */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'en' ? 'Advertising Tags' : 'Tag Iklan'}</CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Configure advertising pixel and conversion tracking' : 'Konfigurasi pixel iklan dan pelacakan konversi'}
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleSaveSeo} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Meta (Facebook) Pixel ID</Label>
                <Input 
                  value={seo.meta_pixel_id} 
                  onChange={(e) => setSeo(prev => ({ ...prev, meta_pixel_id: e.target.value }))}
                  placeholder="123456789012345"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Your Meta Pixel ID from Events Manager' : 'ID Meta Pixel dari Events Manager'}
                </p>
              </div>
              <div>
                <Label>TikTok Pixel ID</Label>
                <Input 
                  value={seo.tiktok_pixel_id} 
                  onChange={(e) => setSeo(prev => ({ ...prev, tiktok_pixel_id: e.target.value }))}
                  placeholder="XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Your TikTok Pixel ID from TikTok Ads Manager' : 'ID TikTok Pixel dari TikTok Ads Manager'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Google Ads Conversion ID</Label>
                <Input 
                  value={seo.google_ads_id} 
                  onChange={(e) => setSeo(prev => ({ ...prev, google_ads_id: e.target.value }))}
                  placeholder="AW-XXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Your Google Ads conversion tracking ID' : 'ID pelacakan konversi Google Ads'}
                </p>
              </div>
              <div>
                <Label>Google Ads Conversion Label ({language === 'en' ? 'Optional' : 'Opsional'})</Label>
                <Input 
                  value={seo.google_ads_conversion_label} 
                  onChange={(e) => setSeo(prev => ({ ...prev, google_ads_conversion_label: e.target.value }))}
                  placeholder="AbCdEfGhIjK"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'Conversion label for specific conversion actions' : 'Label konversi untuk tindakan konversi tertentu'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Verification */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{language === 'en' ? 'Domain Verification' : 'Verifikasi Domain'}</CardTitle>
                <CardDescription>
                  {language === 'en' ? 'Verify domain ownership for advertising platforms' : 'Verifikasi kepemilikan domain untuk platform iklan'}
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleSaveSeo} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Google Search Console</Label>
              <Input 
                value={seo.google_search_console} 
                onChange={(e) => setSeo(prev => ({ ...prev, google_search_console: e.target.value }))}
                placeholder="verification-code-here"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' ? 'Content of google-site-verification meta tag' : 'Konten meta tag google-site-verification'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Meta (Facebook) Domain Verification</Label>
                <Input 
                  value={seo.meta_domain_verification} 
                  onChange={(e) => setSeo(prev => ({ ...prev, meta_domain_verification: e.target.value }))}
                  placeholder="abcdef1234567890"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'From Meta Business Suite → Brand Safety → Domains' : 'Dari Meta Business Suite → Keamanan Brand → Domain'}
                </p>
              </div>
              <div>
                <Label>TikTok Domain Verification</Label>
                <Input 
                  value={seo.tiktok_domain_verification} 
                  onChange={(e) => setSeo(prev => ({ ...prev, tiktok_domain_verification: e.target.value }))}
                  placeholder="verification-code-here"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'en' ? 'From TikTok Ads Manager → Assets → Events' : 'Dari TikTok Ads Manager → Aset → Events'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Favicon</CardTitle>
            <Button size="sm" onClick={handleSaveFavicon} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div>
              <Label>{language === 'en' ? 'Favicon Image (recommended: 32x32 or 64x64 PNG)' : 'Gambar Favicon (disarankan: 32x32 atau 64x64 PNG)'}</Label>
              <ImageUploader
                value={favicon.url}
                onChange={(url) => setFavicon({ url })}
                folder="favicon"
              />
            </div>
          </CardContent>
        </Card>

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
