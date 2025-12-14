import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logoWhite from '@/assets/logo-white.png';

export function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { href: '/', label: t('Beranda', 'Home') },
    { href: '/solusi-korporat', label: t('Solusi Korporat', 'Corporate Solutions') },
    { href: '/solusi-umkm', label: t('Solusi UMKM', 'SME Solutions') },
    { href: '/produk', label: t('Produk', 'Products') },
    { href: '/blog', label: 'Blog' },
    { href: '/tentang-kami', label: t('Tentang Kami', 'About Us') },
  ];

  const contactInfo = [
    { icon: Mail, text: 'info@bungkusindonesia.com', href: 'mailto:info@bungkusindonesia.com' },
    { icon: Phone, text: '+62 21 1234 5678', href: 'tel:+622112345678' },
    { icon: MapPin, text: 'Jakarta, Indonesia', href: '#' },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img src={logoWhite} alt="Bungkus Indonesia" className="h-16 w-auto" />
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              {t(
                'Solusi kemasan berkualitas untuk bisnis Indonesia. Melayani korporasi dan UMKM dengan dedikasi.',
                'Quality packaging solutions for Indonesian businesses. Serving corporations and SMEs with dedication.'
              )}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">
              {t('Tautan Cepat', 'Quick Links')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">
              {t('Kontak', 'Contact')}
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-start gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">
              {t('Tetap Terhubung', 'Stay Connected')}
            </h4>
            <p className="text-primary-foreground/80 text-sm mb-4">
              {t(
                'Dapatkan info terbaru tentang produk dan penawaran kami.',
                'Get the latest updates on our products and offers.'
              )}
            </p>
            <Link
              to="/hubungi-kami"
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/90 transition-colors"
            >
              {t('Hubungi Kami', 'Contact Us')}
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} Bungkus Indonesia. {t('Hak cipta dilindungi.', 'All rights reserved.')}
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                {t('Kebijakan Privasi', 'Privacy Policy')}
              </Link>
              <Link to="/terms" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                {t('Syarat & Ketentuan', 'Terms & Conditions')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
