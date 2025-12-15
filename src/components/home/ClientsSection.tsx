import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2 } from 'lucide-react';

interface ClientLogo {
  name: string;
  image: string;
}

interface ClientsSectionProps {
  title?: string;
  subtitle?: string;
  logos?: ClientLogo[];
}

export function ClientsSection({ title, subtitle, logos }: ClientsSectionProps) {
  const { t } = useLanguage();

  const displayTitle = title || t('Dipercaya oleh Brand Terkemuka', 'Trusted by Leading Brands');
  const displaySubtitle = subtitle || t('Kami bangga melayani perusahaan-perusahaan luar biasa ini.', 'We are proud to serve these amazing companies.');
  
  const displayLogos = logos?.length ? logos : Array(6).fill(null).map((_, i) => ({
    name: `Company ${i + 1}`,
    image: ''
  }));

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground">
            {displaySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {displayLogos.map((client, index) => (
            <div
              key={index}
              className="w-full h-24 flex items-center justify-center p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors group"
            >
              {client.image ? (
                <img
                  src={client.image}
                  alt={client.name}
                  className="max-h-12 max-w-full object-contain opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Building2 className="h-8 w-8" />
                  <span className="text-xs font-medium">{client.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}