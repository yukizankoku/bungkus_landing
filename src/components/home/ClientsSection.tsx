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
  marqueeSpeed?: 'slow' | 'normal' | 'fast' | 'very-fast';
}

const speedMap = {
  'slow': 45,
  'normal': 30,
  'fast': 15,
  'very-fast': 10
};

export function ClientsSection({ title, subtitle, logos, marqueeSpeed = 'normal' }: ClientsSectionProps) {
  const { t } = useLanguage();

  const displayTitle = title || t('Dipercaya oleh Brand Terkemuka', 'Trusted by Leading Brands');
  const displaySubtitle = subtitle || t('Kami bangga melayani perusahaan-perusahaan luar biasa ini.', 'We are proud to serve these amazing companies.');
  
  const displayLogos = logos?.length ? logos : Array(6).fill(null).map((_, i) => ({
    name: `Company ${i + 1}`,
    image: ''
  }));

  const useMarquee = displayLogos.length > 4;
  const animationDuration = speedMap[marqueeSpeed] || 30;

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground">
            {displaySubtitle}
          </p>
        </div>

        {useMarquee ? (
          /* Infinite scrolling marquee for 5+ logos */
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="overflow-hidden">
              <div 
                className="flex hover:[animation-play-state:paused]"
                style={{ 
                  animation: `marquee ${animationDuration}s linear infinite`,
                  width: 'max-content'
                }}
              >
                {/* First set of logos */}
                {displayLogos.map((client, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex-shrink-0 w-48 h-32 mx-4 flex items-center justify-center p-6 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors group"
                  >
                    {client.image ? (
                      <img
                        src={client.image}
                        alt={client.name}
                        className="max-h-20 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        <Building2 className="h-10 w-10" />
                        <span className="text-sm font-medium text-center">{client.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Duplicate set for seamless infinite loop */}
                {displayLogos.map((client, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex-shrink-0 w-48 h-32 mx-4 flex items-center justify-center p-6 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors group"
                  >
                    {client.image ? (
                      <img
                        src={client.image}
                        alt={client.name}
                        className="max-h-20 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        <Building2 className="h-10 w-10" />
                        <span className="text-sm font-medium text-center">{client.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Static grid for 1-4 logos */
          <div className={`grid gap-8 items-center justify-items-center ${
            displayLogos.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
            displayLogos.length === 2 ? 'grid-cols-2 max-w-lg mx-auto' :
            displayLogos.length === 3 ? 'grid-cols-3 max-w-2xl mx-auto' :
            'grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto'
          }`}>
            {displayLogos.map((client, index) => (
              <div
                key={index}
                className="w-full h-36 flex items-center justify-center p-6 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors group"
              >
                {client.image ? (
                  <img
                    src={client.image}
                    alt={client.name}
                    className="max-h-20 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                    <Building2 className="h-12 w-12" />
                    <span className="text-sm font-medium">{client.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
