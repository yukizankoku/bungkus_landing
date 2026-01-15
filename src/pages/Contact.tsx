import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Shield, Clock, CheckCircle2 } from 'lucide-react';
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
import { contactSchema, contactSchemaWithMessage, mapDatabaseError, MESSAGE_MAX_CHARS } from '@/lib/contactValidation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  const [success, setSuccess] = useState(false);
  const { data: pageContent, isLoading: pageLoading } = usePageContent('contact');
  const { data: contactSettings, isLoading: contactLoading } = useSiteSetting('contact');
  
  // Honeypot field - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState('');
  
  // Track when form was rendered to prevent instant bot submissions
  const formLoadTime = useRef<number>(Date.now());
  const [formReady, setFormReady] = useState(false);
  
  // Focus states for floating labels
  const [focused, setFocused] = useState<Record<string, boolean>>({});
  
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
  const contactItems = globalContact ? [
    { 
      icon: Mail, 
      label: 'Email', 
      value: globalContact.email || '', 
      href: globalContact.email ? `mailto:${globalContact.email}` : undefined,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Phone, 
      label: t('Telepon', 'Phone'), 
      value: globalContact.phone || '', 
      href: globalContact.phone ? `tel:${globalContact.phone.replace(/\s/g, '')}` : undefined,
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      icon: MapPin, 
      label: t('Alamat', 'Address'), 
      value: globalContact.address || '', 
      href: undefined,
      color: 'from-amber-500 to-amber-600'
    },
  ].filter(item => item.value) : [];

  // WhatsApp link
  const whatsappNumber = globalContact?.whatsapp || globalContact?.phone;
  const whatsappLink = whatsappNumber 
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t('Halo, saya ingin bertanya tentang produk Anda.', 'Hello, I would like to inquire about your products.'))}` 
    : null;

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
      setSuccess(true);
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
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
    }
  };

  const isLoading = pageLoading || contactLoading;

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-80 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-64 mx-auto bg-white/20" />
          </div>
        </section>
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-3">
                <Skeleton className="h-96 w-full rounded-2xl" />
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
      
      {/* Hero Section with Modern Design */}
      <section 
        className="relative pt-32 pb-24 overflow-hidden"
      >
        {/* Background with gradient and pattern */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary/80"
          style={hero.image ? { 
            backgroundImage: `url(${hero.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {hero.image && <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70" />}
          {/* Decorative shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <MessageCircle className="h-4 w-4 text-white" />
            <span className="text-sm text-white/90">{t('Kami siap membantu', 'We\'re here to help')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight">
            {hero.title || t('Hubungi Kami', 'Contact Us')}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            {hero.subtitle || t('Kami siap membantu kebutuhan kemasan Anda.', 'We are ready to help your packaging needs.')}
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
            
            {/* Contact Info Cards - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  {content?.contactInfoTitle || t('Informasi Kontak', 'Contact Information')}
                </h2>
                <p className="text-muted-foreground">
                  {t('Pilih cara terbaik untuk menghubungi kami', 'Choose the best way to reach us')}
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactItems.map((item, i) => {
                  const IconComponent = item.icon;
                  const Wrapper = item.href ? 'a' : 'div';
                  return (
                    <Wrapper
                      key={i}
                      {...(item.href ? { href: item.href } : {})}
                      className={cn(
                        "group relative flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50",
                        "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5",
                        item.href && "cursor-pointer"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        "transition-transform duration-300 group-hover:scale-110",
                        item.color
                      )}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                        <p className="text-foreground font-medium break-words">{item.value}</p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>

              {/* WhatsApp Quick Contact */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center gap-3 w-full p-4 rounded-2xl",
                    "bg-gradient-to-r from-green-500 to-green-600 text-white font-medium",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5"
                  )}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('Chat via WhatsApp', 'Chat via WhatsApp')}
                </a>
              )}

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>{t('Data aman', 'Secure data')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{t('Respon cepat', 'Fast response')}</span>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-xl shadow-black/5">
                {/* Form Header */}
                <div className="mb-8">
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    {t('Kirim Pesan', 'Send a Message')}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t('Isi formulir di bawah ini dan kami akan segera menghubungi Anda.', 'Fill out the form below and we\'ll get back to you shortly.')}
                  </p>
                </div>

                {success ? (
                  // Success State
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-xl font-display font-bold text-foreground mb-2">
                      {t('Pesan Terkirim!', 'Message Sent!')}
                    </h4>
                    <p className="text-muted-foreground mb-6">
                      {t('Terima kasih, kami akan segera menghubungi Anda.', 'Thank you, we will contact you soon.')}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSuccess(false)}
                    >
                      {t('Kirim Pesan Lain', 'Send Another Message')}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
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

                    {/* Name & Email Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className={cn(
                          "absolute left-4 transition-all duration-200 pointer-events-none",
                          focused.name || form.name
                            ? "top-2 text-xs text-primary font-medium"
                            : "top-1/2 -translate-y-1/2 text-muted-foreground"
                        )}>
                          {formLabels.name} *
                        </label>
                        <Input 
                          value={form.name} 
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          onFocus={() => setFocused(f => ({ ...f, name: true }))}
                          onBlur={() => setFocused(f => ({ ...f, name: false }))}
                          maxLength={100}
                          className={cn(
                            "h-14 pt-5 px-4 rounded-xl border-border/50 bg-muted/30",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "transition-all duration-200",
                            errors.name && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          )}
                        />
                        {errors.name && <p className="text-xs text-destructive mt-1.5 ml-1">{errors.name}</p>}
                      </div>

                      <div className="relative">
                        <label className={cn(
                          "absolute left-4 transition-all duration-200 pointer-events-none",
                          focused.email || form.email
                            ? "top-2 text-xs text-primary font-medium"
                            : "top-1/2 -translate-y-1/2 text-muted-foreground"
                        )}>
                          {formLabels.email} *
                        </label>
                        <Input 
                          type="email"
                          value={form.email} 
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          onFocus={() => setFocused(f => ({ ...f, email: true }))}
                          onBlur={() => setFocused(f => ({ ...f, email: false }))}
                          maxLength={255}
                          className={cn(
                            "h-14 pt-5 px-4 rounded-xl border-border/50 bg-muted/30",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "transition-all duration-200",
                            errors.email && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          )}
                        />
                        {errors.email && <p className="text-xs text-destructive mt-1.5 ml-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone & Company Row */}
                    {(formConfig.showPhone !== false || formConfig.showCompany !== false) && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {formConfig.showPhone !== false && (
                          <div className="relative">
                            <label className={cn(
                              "absolute left-4 transition-all duration-200 pointer-events-none",
                              focused.phone || form.phone
                                ? "top-2 text-xs text-primary font-medium"
                                : "top-1/2 -translate-y-1/2 text-muted-foreground"
                            )}>
                              {formLabels.phone || t('Telepon', 'Phone')}
                            </label>
                            <Input 
                              value={form.phone} 
                              onChange={e => setForm({ ...form, phone: e.target.value })}
                              onFocus={() => setFocused(f => ({ ...f, phone: true }))}
                              onBlur={() => setFocused(f => ({ ...f, phone: false }))}
                              maxLength={20}
                              className={cn(
                                "h-14 pt-5 px-4 rounded-xl border-border/50 bg-muted/30",
                                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                                "transition-all duration-200",
                                errors.phone && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                              )}
                            />
                            {errors.phone && <p className="text-xs text-destructive mt-1.5 ml-1">{errors.phone}</p>}
                          </div>
                        )}

                        {formConfig.showCompany !== false && (
                          <div className="relative">
                            <label className={cn(
                              "absolute left-4 transition-all duration-200 pointer-events-none",
                              focused.company || form.company
                                ? "top-2 text-xs text-primary font-medium"
                                : "top-1/2 -translate-y-1/2 text-muted-foreground"
                            )}>
                              {formLabels.company || t('Perusahaan', 'Company')}
                            </label>
                            <Input 
                              value={form.company} 
                              onChange={e => setForm({ ...form, company: e.target.value })}
                              onFocus={() => setFocused(f => ({ ...f, company: true }))}
                              onBlur={() => setFocused(f => ({ ...f, company: false }))}
                              maxLength={200}
                              className={cn(
                                "h-14 pt-5 px-4 rounded-xl border-border/50 bg-muted/30",
                                "focus:border-primary focus:ring-2 focus:ring-primary/20",
                                "transition-all duration-200",
                                errors.company && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                              )}
                            />
                            {errors.company && <p className="text-xs text-destructive mt-1.5 ml-1">{errors.company}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Field with Character Counter */}
                    {formConfig.showMessage !== false && (
                      <div className="relative">
                        <label className={cn(
                          "absolute left-4 transition-all duration-200 pointer-events-none z-10",
                          focused.message || form.message
                            ? "top-2 text-xs text-primary font-medium"
                            : "top-4 text-muted-foreground"
                        )}>
                          {formLabels.message || t('Pesan', 'Message')} *
                        </label>
                        <Textarea 
                          value={form.message} 
                          onChange={e => setForm({ ...form, message: e.target.value.slice(0, MESSAGE_MAX_CHARS) })}
                          onFocus={() => setFocused(f => ({ ...f, message: true }))}
                          onBlur={() => setFocused(f => ({ ...f, message: false }))}
                          rows={3}
                          maxLength={MESSAGE_MAX_CHARS}
                          className={cn(
                            "pt-7 px-4 rounded-xl border-border/50 bg-muted/30 resize-none",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20",
                            "transition-all duration-200",
                            errors.message && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          )}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                          {errors.message ? (
                            <p className="text-xs text-destructive ml-1">{errors.message}</p>
                          ) : (
                            <span />
                          )}
                          <span className={cn(
                            "text-xs",
                            form.message.length >= MESSAGE_MAX_CHARS ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {form.message.length}/{MESSAGE_MAX_CHARS}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      size="lg"
                      className={cn(
                        "w-full h-14 rounded-xl text-base font-medium gap-2",
                        "bg-gradient-to-r from-primary to-primary/90",
                        "hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
                        "transition-all duration-300",
                        "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      )}
                      disabled={loading || !formReady}
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {formLabels.submitting}
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          {formLabels.submit}
                        </>
                      )}
                    </Button>

                    {/* Form Footer */}
                    <p className="text-xs text-center text-muted-foreground">
                      {t(
                        'Dengan mengirim formulir ini, Anda menyetujui kebijakan privasi kami.',
                        'By submitting this form, you agree to our privacy policy.'
                      )}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
