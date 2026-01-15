import React, { memo } from 'react';
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

// Memoized LogoCard to prevent unnecessary re-renders
const LogoCard = memo(({ client }: { client: ClientLogo }) => (
  <div
    className="flex-shrink-0 w-48 h-32 mx-4 flex items-center justify-center p-6 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors group"
  >
    {client.image ? (
      <img
        src={client.image}
        alt={client.name}
        loading="lazy"
        decoding="async"
        width={192}
        height={80}
        className="max-h-20 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
      />
    ) : (
      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
        <Building2 className="h-10 w-10" />
        <span className="text-sm font-medium text-center">{client.name}</span>
      </div>
    )}
  </div>
));

LogoCard.displayName = 'LogoCard';

const speedMap = {
  'slow': 45,
  'normal': 30,
  'fast': 15,
  'very-fast': 10
};

export function ClientsSection({ title, subtitle, logos, marqueeSpeed = 'normal' }: ClientsSectionProps) {
  // Don't render if no logos provided (CMS not configured)
  if (!logos || logos.length === 0) {
    return null;
  }

  // Calculate how many times to repeat logos for smooth infinite scroll
  // We want at least 8 logo cards visible to fill the viewport
  const minLogosForSmooth = 8;
  const duplicateCount = Math.ceil(minLogosForSmooth / logos.length);
  const expandedLogos = Array(duplicateCount).fill(logos).flat();
  
  // Base speed, adjusted proportionally for number of expanded logos
  const baseSpeed = speedMap[marqueeSpeed] || 30;
  const animationDuration = (expandedLogos.length / 8) * baseSpeed;

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Pure CSS infinite marquee */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-hidden">
            <div 
              className="flex hover:[animation-play-state:paused]"
              style={{ 
                animation: `marquee ${animationDuration}s linear infinite`,
                width: 'max-content',
                willChange: 'transform'
              }}
            >
              {/* First set of expanded logos */}
              {expandedLogos.map((client, index) => (
                <LogoCard key={`first-${index}`} client={client} />
              ))}
              {/* Duplicate set for seamless infinite loop */}
              {expandedLogos.map((client, index) => (
                <LogoCard key={`second-${index}`} client={client} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
