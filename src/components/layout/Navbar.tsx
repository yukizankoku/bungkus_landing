import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavigationMenusHierarchy, NavigationMenu } from '@/hooks/useNavigationMenus';
import logoWhite from '@/assets/logo-white.png';
import logoDarkBlue from '@/assets/logo-dark-blue.png';
import { Skeleton } from '@/components/ui/skeleton';
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
  const { data: settings } = useSiteSettings();
  const { data: dynamicMenus, isLoading: menusLoading } = useNavigationMenusHierarchy();

  const logoSetting = settings?.find(s => s.key === 'logo')?.value as { light?: string; dark?: string } | undefined;

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform database menus to nav link format
  const transformMenuToNavLink = (menu: NavigationMenu): { href?: string; label: string; children?: { href: string; label: string }[] } => {
    const label = language === 'id' ? menu.label_id : menu.label_en;
    
    if (menu.children && menu.children.length > 0) {
      return {
        label,
        children: menu.children.map(child => ({
          href: child.href || '#',
          label: language === 'id' ? child.label_id : child.label_en,
        })),
      };
    }
    
    return {
      href: menu.href || '/',
      label,
    };
  };

  // Use dynamic menus only - no fallback that would flash
  const navLinks = dynamicMenus && dynamicMenus.length > 0
    ? dynamicMenus.map(transformMenuToNavLink)
    : [];

  // Check if current path is active (direct match or child match)
  const isActiveLink = (link: { href?: string; children?: { href: string; label: string }[] }): boolean => {
    // Direct link match
    if (link.href && location.pathname === link.href) return true;
    
    // Check if current path matches any child
    if (link.children) {
      return link.children.some(child => location.pathname === child.href);
    }
    
    return false;
  };

  const navBg = isHome && !isScrolled 
    ? 'bg-transparent' 
    : 'bg-background/95 backdrop-blur-md shadow-sm';
  
  const textColor = isHome && !isScrolled ? 'text-white' : 'text-foreground';
  
  // Use CMS logo if available, fallback to static assets
  const logo = isHome && !isScrolled 
    ? (logoSetting?.dark || logoWhite) 
    : (logoSetting?.light || logoDarkBlue);

  // Dynamic button styling for "Hubungi Kami"
  const contactButtonClass = isHome && !isScrolled
    ? 'bg-white text-primary hover:bg-white/90'
    : 'bg-primary text-white hover:bg-primary/90';

  // Skeleton for nav items while loading
  const NavSkeleton = () => (
    <div className="hidden lg:flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton 
          key={i} 
          className={`h-8 w-20 ${isHome && !isScrolled ? 'bg-white/20' : ''}`} 
        />
      ))}
    </div>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="Bungkus Indonesia" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          {menusLoading ? (
            <NavSkeleton />
          ) : navLinks.length > 0 ? (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                'children' in link && link.children ? (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                      <button className={`nav-item-3d flex items-center gap-1 px-4 py-2 text-sm font-medium ${textColor} hover:text-secondary transition-all ${
                        isActiveLink(link) ? 'active' : ''
                      }`}>
                        {link.label}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {link.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link 
                            to={child.href} 
                            className={`cursor-pointer ${location.pathname === child.href ? 'bg-secondary/10 text-secondary font-medium' : ''}`}
                          >
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href!}
                    className={`nav-item-3d px-4 py-2 text-sm font-medium ${textColor} hover:text-secondary transition-all ${
                      location.pathname === link.href ? 'active' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1" />
          )}

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`nav-item-3d ${textColor}`}>
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
                <Button asChild className={contactButtonClass}>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/profile">{t('Profil', 'Profile')}</Link>
                </Button>
              )
            ) : (
              <Button asChild className={contactButtonClass}>
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
              {menusLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                navLinks.map((link, index) => (
                  'children' in link && link.children ? (
                    <div key={index} className="py-2">
                      <span className="text-sm font-medium text-muted-foreground px-3">
                        {link.label}
                      </span>
                      <div className="mt-1 pl-4">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`block px-3 py-2 text-sm transition-colors ${
                              location.pathname === child.href 
                                ? 'text-secondary bg-secondary/10 rounded-md font-medium' 
                                : 'hover:text-secondary'
                            }`}
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
                      to={link.href!}
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                        location.pathname === link.href 
                          ? 'text-secondary bg-secondary/10' 
                          : 'hover:text-secondary'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                ))
              )}
              
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
