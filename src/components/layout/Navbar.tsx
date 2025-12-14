import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import logoWhite from '@/assets/logo-white.png';
import logoDarkBlue from '@/assets/logo-dark-blue.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('Beranda', 'Home') },
    {
      label: t('Solusi', 'Solutions'),
      children: [
        { href: '/solusi-korporat', label: t('Korporat', 'Corporate') },
        { href: '/solusi-umkm', label: 'UMKM' },
      ],
    },
    { href: '/produk', label: t('Produk', 'Products') },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/blog', label: 'Blog' },
    { href: '/tentang-kami', label: t('Tentang Kami', 'About Us') },
  ];

  const navBg = isHome && !isScrolled 
    ? 'bg-transparent' 
    : 'bg-background/95 backdrop-blur-md shadow-sm';
  
  const textColor = isHome && !isScrolled ? 'text-white' : 'text-foreground';
  const logo = isHome && !isScrolled ? logoWhite : logoDarkBlue;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Bungkus Indonesia" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              link.children ? (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium ${textColor} hover:text-secondary transition-colors`}>
                      {link.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link to={child.href} className="cursor-pointer">
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 text-sm font-medium ${textColor} hover:text-secondary transition-colors ${
                    location.pathname === link.href ? 'text-secondary' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={textColor}>
                  <Globe className="h-4 w-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('id')}>
                  🇮🇩 Bahasa Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              isAdmin ? (
                <Button asChild>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/profile">{t('Profil', 'Profile')}</Link>
                </Button>
              )
            ) : (
              <Button asChild>
                <Link to="/hubungi-kami">{t('Hubungi Kami', 'Contact Us')}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 ${textColor}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-background border-t animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                link.children ? (
                  <div key={index} className="py-2">
                    <span className="text-sm font-medium text-muted-foreground px-3">
                      {link.label}
                    </span>
                    <div className="mt-1 pl-4">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-3 py-2 text-sm hover:text-secondary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-3 py-2 text-sm font-medium hover:text-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              
              <div className="flex items-center gap-2 pt-4 border-t mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language === 'id' ? 'English' : 'Bahasa'}
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/hubungi-kami" onClick={() => setIsOpen(false)}>
                    {t('Hubungi Kami', 'Contact Us')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
