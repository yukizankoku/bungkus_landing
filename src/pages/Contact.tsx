import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/common/SEO';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePageContent } from '@/hooks/usePageContent';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { contactSchema, contactSchemaWithMessage, mapDatabaseError } from '@/lib/contactValidation';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  Phone,
  MapPin,
};

// Rate limit: 5 minutes between submissions (matches server-side)
const RATE_LIMIT_MS = 5 * 60 * 1000;
const RATE_LIMIT_STORAGE_KEY = 'contact_last_submit';

// Minimum time (in ms) user must wait before submitting (anti-bot)
const MIN_FORM_TIME_MS = 3000;

export default function Contact() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const { data: pageContent, isLoading: pageLoading } = usePageContent('contact');
  const { data: contactSettings, isLoading: contactLoading } = useSiteSetting('contact');
  
  // Honeypot field - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState('');
  
  // Track when form was rendered to prevent instant bot submissions
  const formLoadTime = useRef<number>(Date.now());
  const [formReady, setFormReady] = useState(false);
  
  // Set form ready after minimum time
  useEffect(() => {
    const timer = setTimeout(() => setFormReady(true), MIN_FORM_TIME_MS);
    return () => clearTimeout(timer);
  }, []);

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;
  
  // Hero image should be shared across languages - use English as fallback
  const heroImage = content?.hero?.image || pageContent?.content_en?.hero?.image;

  // Use global site_settings for contact info (single source of truth)
  const globalContact = contactSettings?.value as { email?: string; phone?: string; address?: string; whatsapp?: string } | undefined;

  const hero = { 
    title: content?.hero?.title || '',
    subtitle: content?.hero?.subtitle || '',
    image: heroImage 
  };
  
  // Build contact info from global site_settings
  const contactInfo = globalContact ? [
    { icon: 'Mail', text: globalContact.email || '' },
    { icon: 'Phone', text: globalContact.phone || '' },
    { icon: 'MapPin', text: globalContact.address || '' },
  ].filter(item => item.text) : [];

  const formLabels = content?.formLabels || {
    name: t('Nama', 'Name'),
    email: 'Email',
    phone: t('Telepon', 'Phone'),
    company: t('Perusahaan', 'Company'),
    message: t('Pesan', 'Message'),
    submit: t('Kirim Pesan', 'Send Message'),
    submitting: t('Mengirim...', 'Sending...'),
  };

  // Form field visibility config - use English content as source of truth (not language-specific)
  const formConfig = pageContent?.content_en?.formConfig || {
    showPhone: true,
    showCompany: true,
    showMessage: true,
  };
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      // Pretend success to not alert the bot
      toast({ 
        title: t('Terkirim!', 'Sent!'), 
        description: t('Terima kasih, kami akan segera menghubungi Anda.', 'Thank you, we will contact you soon.') 
      });
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
      return;
    }
    
    // Time-based check - form must be visible for minimum time
    const timeElapsed = Date.now() - formLoadTime.current;
    if (timeElapsed < MIN_FORM_TIME_MS || !formReady) {
      toast({ 
        title: t('Mohon tunggu', 'Please wait'), 
        description: t('Silakan tunggu beberapa detik sebelum mengirim.', 'Please wait a few seconds before submitting.'), 
        variant: 'destructive' 
      });
      return;
    }
    
    // Client-side rate limiting check (UX improvement, server enforces actual limit)
    const lastSubmit = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < RATE_LIMIT_MS) {
      const remainingMins = Math.ceil((RATE_LIMIT_MS - (Date.now() - parseInt(lastSubmit, 10))) / 60000);
      toast({ 
        title: t('Mohon tunggu', 'Please wait'), 
        description: t(`Silakan tunggu ${remainingMins} menit sebelum mengirim lagi.`, `Please wait ${remainingMins} minute(s) before submitting again.`), 
        variant: 'destructive' 
      });
      return;
    }
    
    // Use appropriate validation schema based on whether message is required
    const validationSchema = formConfig.showMessage !== false ? contactSchemaWithMessage : contactSchema;
    const result = validationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({ 
        title: t('Error', 'Error'), 
        description: t('Silakan periksa formulir Anda.', 'Please check your form.'), 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('contact_submissions').insert([{
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      company: result.data.company || null,
      message: result.data.message || '',
    }]);
    setLoading(false);
    
    if (error) {
      toast({ 
        title: 'Error', 
        description: mapDatabaseError(error), 
        variant: 'destructive' 
      });
    } else {
      // Store successful submission time for client-side rate limiting
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, Date.now().toString());
      toast({ 
        title: t('Terkirim!', 'Sent!'), 
        description: t('Terima kasih, kami akan segera menghubungi Anda.', 'Thank you, we will contact you soon.') 
      });
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
    }
  };

  const isLoading = pageLoading || contactLoading;

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
        </section>
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-6 w-72" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={content?.seo?.title || t('Hubungi Kami', 'Contact Us')} 
        description={content?.seo?.description || t('Hubungi tim Bungkus Indonesia untuk konsultasi kemasan.', 'Contact the Bungkus Indonesia team for packaging consultation.')} 
        pageKey="contact"
      />
      <section 
        className="pt-32 pb-20 gradient-hero relative bg-cover bg-center"
        style={hero.image ? { 
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.7)), url(${hero.image})` 
        } : undefined}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">{hero.title || t('Hubungi Kami', 'Contact Us')}</h1>
          <p className="text-lg text-white/80">{hero.subtitle || t('Kami siap membantu kebutuhan kemasan Anda.', 'We are ready to help your packaging needs.')}</p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">{content?.contactInfoTitle || t('Informasi Kontak', 'Contact Information')}</h2>
              <div className="space-y-4">
                {contactInfo.map((item: any, i: number) => {
                  const IconComponent = iconMap[item.icon] || Mail;
                  return (
                    <div key={i} className="flex items-center gap-4 text-muted-foreground">
                      <IconComponent className="h-5 w-5 text-secondary" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot field - hidden from users, bots will fill it */}
              <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                <Input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  placeholder="Leave this empty"
                />
              </div>
              <div>
                <Input 
                  placeholder={formLabels.name} 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  maxLength={100}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input 
                  type="email" 
                  placeholder={formLabels.email} 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  maxLength={255}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              {formConfig.showPhone !== false && (
                <div>
                  <Input 
                    placeholder={formLabels.phone || t('Telepon', 'Phone')} 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })} 
                    maxLength={50}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </div>
              )}
              {formConfig.showCompany !== false && (
                <div>
                  <Input 
                    placeholder={formLabels.company || t('Perusahaan', 'Company')} 
                    value={form.company} 
                    onChange={e => setForm({ ...form, company: e.target.value })} 
                    maxLength={200}
                    className={errors.company ? 'border-destructive' : ''}
                  />
                  {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
                </div>
              )}
              {formConfig.showMessage !== false && (
                <div>
                  <Textarea 
                    placeholder={formLabels.message || t('Pesan', 'Message')} 
                    rows={4} 
                    value={form.message} 
                    onChange={e => setForm({ ...form, message: e.target.value })} 
                    maxLength={2000}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                </div>
              )}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? formLabels.submitting : formLabels.submit}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
