import { useLanguage } from '@/contexts/LanguageContext';

interface HeroContent {
  image?: string;
  title: string;
  subtitle?: string;
}

interface DynamicHeroProps {
  contentEn?: HeroContent;
  contentId?: HeroContent;
  fallbackTitle: string;
  fallbackSubtitle?: string;
  fallbackImage?: string;
}

export default function DynamicHero({ 
  contentEn, 
  contentId, 
  fallbackTitle, 
  fallbackSubtitle,
  fallbackImage 
}: DynamicHeroProps) {
  const { language } = useLanguage();
  
  const content = language === 'en' ? contentEn : contentId;
  const title = content?.title || fallbackTitle;
  const subtitle = content?.subtitle || fallbackSubtitle;
  const image = content?.image || fallbackImage;

  return (
    <section 
      className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent"
      style={image ? { 
        backgroundImage: `linear-gradient(to bottom right, hsl(var(--primary) / 0.85), hsl(var(--accent) / 0.85)), url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
