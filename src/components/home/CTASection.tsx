import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
              {t(
                'Siap Memulai Kemitraan dengan Kami?',
                'Ready to Start a Partnership with Us?'
              )}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {t(
                'Hubungi kami sekarang untuk konsultasi gratis dan penawaran terbaik.',
                'Contact us now for free consultation and the best offers.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                <Link to="/hubungi-kami">
                  {t('Hubungi Kami', 'Contact Us')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Link to="/produk">
                  {t('Lihat Produk', 'View Products')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
