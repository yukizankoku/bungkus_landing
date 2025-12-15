import React, { useState } from 'react';
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
import { contactSchema, mapDatabaseError } from '@/lib/contactValidation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  Phone,
  MapPin,
};

export default function Contact() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const { data: pageContent } = usePageContent('contact');

  const content = language === 'id' ? pageContent?.content_id : pageContent?.content_en;

  // Fallback content
  const hero = content?.hero || { title: t('Hubungi Kami', 'Contact Us'), subtitle: t('Kami siap membantu kebutuhan kemasan Anda.', 'We are ready to help your packaging needs.') };
  const contactInfo = content?.contactInfo || [
    { icon: 'Mail', text: 'info@bungkusindonesia.com' },
    { icon: 'Phone', text: '+62 21 1234 5678' },
    { icon: 'MapPin', text: 'Jakarta, Indonesia' },
  ];
  const formLabels = content?.formLabels || {
    name: t('Nama', 'Name'),
    email: 'Email',
    phone: t('Telepon', 'Phone'),
    company: t('Perusahaan', 'Company'),
    message: t('Pesan', 'Message'),
    submit: t('Kirim Pesan', 'Send Message'),
    submitting: t('Mengirim...', 'Sending...'),
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data with zod
    const result = contactSchema.safeParse(form);
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
      message: result.data.message,
    }]);
    setLoading(false);
    
    if (error) {
      toast({ 
        title: 'Error', 
        description: mapDatabaseError(error), 
        variant: 'destructive' 
      });
    } else {
      toast({ 
        title: t('Terkirim!', 'Sent!'), 
        description: t('Terima kasih, kami akan segera menghubungi Anda.', 'Thank you, we will contact you soon.') 
      });
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
    }
  };

  return (
    <Layout>
      <SEO 
        title={content?.seo?.title || t('Hubungi Kami', 'Contact Us')} 
        description={content?.seo?.description || t('Hubungi tim Bungkus Indonesia untuk konsultasi kemasan.', 'Contact the Bungkus Indonesia team for packaging consultation.')} 
      />
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">{hero.title}</h1>
          <p className="text-lg text-white/80">{hero.subtitle}</p>
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
              <div>
                <Input 
                  placeholder={formLabels.phone} 
                  value={form.phone} 
                  onChange={e => setForm({ ...form, phone: e.target.value })} 
                  maxLength={50}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Input 
                  placeholder={formLabels.company} 
                  value={form.company} 
                  onChange={e => setForm({ ...form, company: e.target.value })} 
                  maxLength={200}
                  className={errors.company ? 'border-destructive' : ''}
                />
                {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
              </div>
              <div>
                <Textarea 
                  placeholder={formLabels.message} 
                  rows={4} 
                  value={form.message} 
                  onChange={e => setForm({ ...form, message: e.target.value })} 
                  maxLength={2000}
                  className={errors.message ? 'border-destructive' : ''}
                />
                {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
              </div>
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
