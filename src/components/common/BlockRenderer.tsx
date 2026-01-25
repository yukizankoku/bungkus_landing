import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { icons, Check, Linkedin, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface BlockRendererProps {
  blocks: ContentBlock[];
}

function HeroBlock({ data }: { data: Record<string, any> }) {
  return (
    <section 
      className="relative min-h-[70vh] flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: data.background_image ? `url(${data.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay for better text readability */}
      {data.background_image && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        {data.title && (
          <h1 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-up",
            data.background_image ? "text-white drop-shadow-lg" : "text-foreground"
          )}>
            {data.title}
          </h1>
        )}
        {data.subtitle && (
          <p className={cn(
            "text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up",
            data.background_image ? "text-white/90" : "text-muted-foreground"
          )} style={{ animationDelay: '0.1s' }}>
            {data.subtitle}
          </p>
        )}
        {(data.primary_button_text || data.secondary_button_text) && (
          <div className="flex flex-wrap gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {data.primary_button_text && (
              <Button size="lg" asChild className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow">
                <Link to={data.primary_button_link || '#'}>{data.primary_button_text}</Link>
              </Button>
            )}
            {data.secondary_button_text && (
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className={cn(
                  "text-lg px-8 py-6 h-auto",
                  data.background_image && "bg-white/10 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm"
                )}
              >
                <Link to={data.secondary_button_link || '#'}>{data.secondary_button_text}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, any> }) {
  if (!data.content) return null;
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div 
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-6 prose-h1:mt-0
            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:text-primary prose-h2:mb-4 prose-h2:mt-10
            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mb-3 prose-h3:mt-8
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-ul:my-6 prose-li:text-muted-foreground prose-li:leading-relaxed
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content) }} 
        />
      </div>
    </section>
  );
}

function TableBlock({ data }: { data: Record<string, any> }) {
  const rows: string[][] = data.rows || [];
  const headerType: 'row' | 'column' | 'both' | 'none' = data.headerType || 'both';
  
  if (rows.length === 0) return null;

  const isHeaderCell = (rowIdx: number, colIdx: number) => {
    if (headerType === 'both') return rowIdx === 0 || colIdx === 0;
    if (headerType === 'row') return rowIdx === 0;
    if (headerType === 'column') return colIdx === 0;
    return false;
  };

  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="overflow-hidden rounded-xl border border-border shadow-sm bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    className={cn(
                      rowIdx !== rows.length - 1 && "border-b border-border",
                      rowIdx % 2 === 1 && !isHeaderCell(rowIdx, 0) && "bg-muted/20"
                    )}
                  >
                    {row.map((cell, colIdx) => {
                      const isHeader = isHeaderCell(rowIdx, colIdx);
                      const Tag = isHeader ? 'th' : 'td';
                      return (
                        <Tag
                          key={colIdx}
                          className={cn(
                            "p-4 text-left align-top",
                            colIdx !== row.length - 1 && "border-r border-border",
                            isHeader && "bg-primary/5 font-semibold text-foreground",
                            !isHeader && "text-muted-foreground",
                            "first:pl-6 last:pr-6"
                          )}
                        >
                          <span 
                            className="prose prose-sm dark:prose-invert prose-p:m-0 prose-p:leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cell) }} 
                          />
                        </Tag>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageGalleryBlock({ data }: { data: Record<string, any> }) {
  const images = data.images || [];
  if (images.length === 0) return null;

  const layoutClasses = {
    grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    carousel: 'flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4',
    masonry: 'columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4',
  };

  return (
    <section className="py-12 px-6">
      <div className={cn("max-w-6xl mx-auto", layoutClasses[data.layout as keyof typeof layoutClasses] || layoutClasses.grid)}>
        {images.map((img: string, idx: number) => (
          <div key={idx} className={cn(
            "overflow-hidden rounded-lg",
            data.layout === 'carousel' && "flex-shrink-0 w-72 snap-start",
            data.layout === 'masonry' && "break-inside-avoid"
          )}>
            <img 
              src={img} 
              alt={`Gallery image ${idx + 1}`} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function CTABlock({ data }: { data: Record<string, any> }) {
  const { t } = useLanguage();
  const { data: ctaDefaults } = useSiteSetting('cta_defaults');
  const defaults = ctaDefaults?.value || {};
  
  const useDefaults = data.use_defaults !== false;
  
  // Merge block data with defaults - block data takes priority
  const title = data.title || (useDefaults ? t(
    'Siap Memulai Kemitraan dengan Kami?',
    'Ready to Start a Partnership with Us?'
  ) : '');
  
  const subtitle = data.subtitle || data.description || (useDefaults ? t(
    'Hubungi kami sekarang untuk konsultasi gratis tentang solusi kemasan terbaik untuk bisnis Anda.',
    'Contact us now for free consultation about the best packaging solutions for your business.'
  ) : '');

  const primaryButtonText = data.primary_button_text || data.button_text || (useDefaults 
    ? t(defaults.primary_button_text_id, defaults.primary_button_text_en) 
    : '');
  
  const primaryButtonLink = data.primary_button_link || data.button_link || 
    (useDefaults ? defaults.primary_button_link : '#');

  const secondaryButtonText = data.secondary_button_text || (useDefaults 
    ? t(defaults.secondary_button_text_id, defaults.secondary_button_text_en) 
    : '');
  
  const secondaryButtonLink = data.secondary_button_link || 
    (useDefaults ? defaults.secondary_button_link : '#');

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl mb-10 opacity-90 leading-relaxed">{subtitle}</p>
          )}
          
          {(primaryButtonText || secondaryButtonText) && (
            <div className="flex flex-wrap gap-4 justify-center">
              {primaryButtonText && (
                <Button 
                  size="lg" 
                  variant="secondary" 
                  asChild 
                  className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                >
                  <Link to={primaryButtonLink}>
                    {primaryButtonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              {secondaryButtonText && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="text-lg px-8 py-6 h-auto bg-white/10 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Link to={secondaryButtonLink}>{secondaryButtonText}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: Record<string, any> }) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{data.title}</h2>
            )}
            {data.subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{data.subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item: any, idx: number) => {
            const IconComponent = item.icon && (icons as any)[item.icon];
            return (
              <Card key={idx} className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardContent className="pt-8 pb-6">
                  {IconComponent && (
                    <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  {item.title && (
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialBlock({ data }: { data: Record<string, any> }) {
  if (!data.quote) return null;
  
  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto text-center">
        <blockquote className="text-2xl italic text-foreground mb-6">
          "{data.quote}"
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          {data.author_image && (
            <img 
              src={data.author_image} 
              alt={data.author_name} 
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="text-left">
            {data.author_name && (
              <div className="font-semibold">{data.author_name}</div>
            )}
            {data.author_title && (
              <div className="text-sm text-muted-foreground">{data.author_title}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoBlock({ data }: { data: Record<string, any> }) {
  if (!data.youtube_url) return null;
  
  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };
  
  const videoId = getYouTubeId(data.youtube_url);
  if (!videoId) return null;

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}

function FAQBlock({ data }: { data: Record<string, any> }) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {items.map((item: any, idx: number) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// Legacy HTML block support
function HTMLBlock({ data }: { data: Record<string, any> }) {
  if (!data.content) return null;
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content) }} />
      </div>
    </section>
  );
}

function PricingTableBlock({ data }: { data: Record<string, any> }) {
  const plans = data.plans || [];
  if (plans.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          "grid gap-8",
          plans.length === 1 && "grid-cols-1 max-w-md mx-auto",
          plans.length === 2 && "grid-cols-1 md:grid-cols-2",
          plans.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {plans.map((plan: any, idx: number) => (
            <Card key={idx} className={cn(
              "relative flex flex-col",
              plan.is_popular && "border-primary shadow-lg scale-105"
            )}>
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {(plan.features || []).map((feature: string, fidx: number) => (
                    <li key={fidx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.button_text && (
                  <Button asChild className="w-full" variant={plan.is_popular ? "default" : "outline"}>
                    <Link to={plan.button_link || '#'}>{plan.button_text}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamMembersBlock({ data }: { data: Record<string, any> }) {
  const members = data.members || [];
  if (members.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {members.map((member: any, idx: number) => (
            <Card key={idx} className="text-center overflow-hidden">
              {member.image && (
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardContent className="pt-4">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                {member.bio && (
                  <p className="text-sm text-muted-foreground mb-3">{member.bio}</p>
                )}
                {member.linkedin && (
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsCounterBlock({ data }: { data: Record<string, any> }) {
  const stats = data.stats || [];
  if (stats.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className={cn(
          "grid gap-8 text-center",
          stats.length === 1 && "grid-cols-1",
          stats.length === 2 && "grid-cols-2",
          stats.length === 3 && "grid-cols-3",
          stats.length >= 4 && "grid-cols-2 md:grid-cols-4"
        )}>
          {stats.map((stat: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">
                {stat.prefix}{stat.value}{stat.suffix}
              </div>
              <div className="text-lg opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactFormBlock({ data }: { data: Record<string, any> }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fields = data.fields || ['name', 'email', 'message'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || null,
          company: formData.company || null,
          message: formData.message || formData.subject || '',
        });

      if (error) throw error;

      toast.success('Message sent successfully!');
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    subject: 'Subject',
    message: 'Message',
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-xl mx-auto">
        {(data.title || data.description) && (
          <div className="text-center mb-8">
            {data.title && <h2 className="text-3xl font-bold mb-2">{data.title}</h2>}
            {data.description && <p className="text-muted-foreground">{data.description}</p>}
          </div>
        )}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field: string) => (
                <div key={field}>
                  <Label htmlFor={field}>{fieldLabels[field] || field}</Label>
                  {field === 'message' ? (
                    <Textarea
                      id={field}
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      required={field === 'message' || field === 'email'}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field}
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      required={field === 'name' || field === 'email'}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : (data.button_text || 'Send Message')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Helper to determine section background based on block type and index
const getSectionBg = (index: number, type: string) => {
  // These blocks have their own background styling
  const selfStyledBlocks = ['hero', 'cta', 'stats_counter', 'testimonial'];
  if (selfStyledBlocks.includes(type)) return '';
  // Alternate between transparent and subtle muted background
  return index % 2 === 1 ? 'bg-muted/30' : '';
};

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock data={block.data} />;
      case 'text':
        return <TextBlock data={block.data} />;
      case 'table':
        return <TableBlock data={block.data} />;
      case 'image_gallery':
        return <ImageGalleryBlock data={block.data} />;
      case 'cta':
        return <CTABlock data={block.data} />;
      case 'features':
        return <FeaturesBlock data={block.data} />;
      case 'testimonial':
        return <TestimonialBlock data={block.data} />;
      case 'video':
        return <VideoBlock data={block.data} />;
      case 'faq':
        return <FAQBlock data={block.data} />;
      case 'html':
        return <HTMLBlock data={block.data} />;
      case 'pricing_table':
        return <PricingTableBlock data={block.data} />;
      case 'team_members':
        return <TeamMembersBlock data={block.data} />;
      case 'stats_counter':
        return <StatsCounterBlock data={block.data} />;
      case 'contact_form':
        return <ContactFormBlock data={block.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="block-renderer">
      {blocks.map((block, index) => (
        <div key={block.id} className={getSectionBg(index, block.type)}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}