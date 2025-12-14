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

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_submissions').insert([form]);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: t('Gagal mengirim pesan.', 'Failed to send message.'), variant: 'destructive' });
    } else {
      toast({ title: t('Terkirim!', 'Sent!'), description: t('Terima kasih, kami akan segera menghubungi Anda.', 'Thank you, we will contact you soon.') });
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
    }
  };

  return (
    <Layout>
      <SEO title={t('Hubungi Kami', 'Contact Us')} description={t('Hubungi tim Bungkus Indonesia untuk konsultasi kemasan.', 'Contact the Bungkus Indonesia team for packaging consultation.')} />
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">{t('Hubungi Kami', 'Contact Us')}</h1>
          <p className="text-lg text-white/80">{t('Kami siap membantu kebutuhan kemasan Anda.', 'We are ready to help your packaging needs.')}</p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">{t('Informasi Kontak', 'Contact Information')}</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, text: 'info@bungkusindonesia.com' },
                  { icon: Phone, text: '+62 21 1234 5678' },
                  { icon: MapPin, text: 'Jakarta, Indonesia' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-muted-foreground">
                    <item.icon className="h-5 w-5 text-secondary" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder={t('Nama', 'Name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <Input placeholder={t('Telepon', 'Phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder={t('Perusahaan', 'Company')} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              <Textarea placeholder={t('Pesan', 'Message')} rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? t('Mengirim...', 'Sending...') : t('Kirim Pesan', 'Send Message')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
