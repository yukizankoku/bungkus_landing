import React from 'react';
import { Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
}

const defaultTestimonials = [
  {
    quoteId: 'Bungkus Indonesia telah menjadi mitra kemasan kami selama 5 tahun. Kualitas produk dan layanan mereka sangat konsisten.',
    quoteEn: 'Bungkus Indonesia has been our packaging partner for 5 years. The quality of their products and services is very consistent.',
    name: 'Budi Santoso',
    role: 'Procurement Manager',
    company: 'PT Makanan Nusantara',
  },
  {
    quoteId: 'Sebagai UMKM, kami sangat terbantu dengan MOQ yang fleksibel dan harga yang kompetitif dari Bungkus Indonesia.',
    quoteEn: 'As an SME, we are greatly helped by the flexible MOQ and competitive prices from Bungkus Indonesia.',
    name: 'Siti Rahayu',
    role: 'Owner',
    company: 'Dapur Mama Siti',
  },
  {
    quoteId: 'Proses custom branding sangat mudah dan hasilnya memuaskan. Tim mereka sangat responsif dan profesional.',
    quoteEn: 'The custom branding process is very easy and the results are satisfying. Their team is very responsive and professional.',
    name: 'Ahmad Wijaya',
    role: 'Marketing Director',
    company: 'CV Berkah Snacks',
  },
];

export function TestimonialsSection({ title, subtitle, items }: TestimonialsSectionProps) {
  const { t, language } = useLanguage();

  const displayTitle = title || t('Apa Kata Klien Kami?', 'What Our Clients Say?');
  const displaySubtitle = subtitle || t(
    'Kepuasan klien adalah prioritas utama kami.',
    'Client satisfaction is our top priority.'
  );

  const displayItems = items?.length ? items : defaultTestimonials.map(t => ({
    quote: language === 'id' ? t.quoteId : t.quoteEn,
    name: t.name,
    role: t.role,
    company: t.company,
  }));

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {displaySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItems.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <Quote className="h-10 w-10 text-secondary/30 mb-6" />
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-secondary font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}