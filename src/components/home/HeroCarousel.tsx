import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface HeroContent {
  images?: string[];
  title?: string;
  subtitle?: string;
  badge?: string;
  cta_primary?: string;
  cta_secondary?: string;
  cta_primary_link?: string;
  cta_secondary_link?: string;
}

interface HeroCarouselProps {
  content?: HeroContent;
}

export function HeroCarousel({ content }: HeroCarouselProps) {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultImages = [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920'
  ];

  const images = content?.images?.length ? content.images : defaultImages;
  const title = content?.title || t('Solusi Kemasan untuk Bisnis Indonesia', 'Packaging Solutions for Indonesian Businesses');
  const subtitle = content?.subtitle || t('Dari korporasi hingga UMKM, kami menyediakan kemasan berkualitas.', 'From corporations to SMEs, we provide quality packaging.');
  const badge = content?.badge || t('Mitra Kemasan Terpercaya', 'Your Trusted Packaging Partner');
  const ctaPrimary = content?.cta_primary || t('Solusi Korporat', 'Corporate Solutions');
  const ctaSecondary = content?.cta_secondary || t('Solusi UMKM', 'SME Solutions');
  const ctaPrimaryLink = content?.cta_primary_link || '/solusi-korporat';
  const ctaSecondaryLink = content?.cta_secondary_link || '/solusi-umkm';

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Determine if link is external
  const isExternalLink = (url: string) => url.startsWith('http://') || url.startsWith('https://');

  const renderLink = (to: string, children: React.ReactNode, className: string) => {
    if (isExternalLink(to)) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      );
    }
    return <Link to={to} className={className}>{children}</Link>;
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        </div>
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              {badge}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6 animate-fade-up stagger-1">
            {title}
          </h1>

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-up stagger-2">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
              {renderLink(ctaPrimaryLink, <>{ctaPrimary}<ArrowRight className="h-4 w-4" /></>, '')}
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
              {renderLink(ctaSecondaryLink, ctaSecondary, '')}
            </Button>
          </div>
        </div>

        {/* Carousel Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentSlide 
                      ? "bg-white w-8" 
                      : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
