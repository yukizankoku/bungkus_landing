import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import logoWhite from '@/assets/logo-white.png';

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettings();

  const socialSetting = settings?.find(s => s.key === 'social')?.value as { instagram?: string; facebook?: string; linkedin?: string; youtube?: string; twitter?: string } | undefined;
  const contactSetting = settings?.find(s => s.key === 'contact')?.value as { email?: string; phone?: string; address?: string } | undefined;

  const quickLinks = [
    { href: '/', label: t('Beranda', 'Home') },
    { href: '/solusi-korporat', label: t('Solusi Korporat', 'Corporate Solutions') },
    { href: '/solusi-umkm', label: t('Solusi UMKM', 'SME Solutions') },
    { href: '/produk', label: t('Produk', 'Products') },
    { href: '/blog', label: 'Blog' },
    { href: '/tentang-kami', label: t('Tentang Kami', 'About Us') },
  ];

  const contactInfo = [
    { icon: Mail, text: contactSetting?.email || 'info@bungkusindonesia.com', href: `mailto:${contactSetting?.email || 'info@bungkusindonesia.com'}` },
    { icon: Phone, text: contactSetting?.phone || '+62 21 1234 5678', href: `tel:${contactSetting?.phone || '+622112345678'}` },
    { icon: MapPin, text: contactSetting?.address || 'Jakarta, Indonesia', href: '#' },
  ];

  // Only include social links that have a URL
  const socialLinks = [
    { icon: Instagram, href: socialSetting?.instagram, label: 'Instagram' },
    { icon: Facebook, href: socialSetting?.facebook, label: 'Facebook' },
    { icon: Linkedin, href: socialSetting?.linkedin, label: 'LinkedIn' },
    { icon: Youtube, href: socialSetting?.youtube, label: 'YouTube' },
    { icon: XIcon, href: socialSetting?.twitter, label: 'X' },
  ].filter(link => link.href && link.href.trim() !== '');

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
            {socialLinks.length > 0 && (
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
            )}
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
