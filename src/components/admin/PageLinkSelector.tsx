import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const pages = [
  { value: '/', label: { en: 'Home', id: 'Beranda' } },
  { value: '/produk', label: { en: 'Products', id: 'Produk' } },
  { value: '/produk/katalog', label: { en: 'Product Catalog', id: 'Katalog Produk' } },
  { value: '/solusi-korporat', label: { en: 'Corporate Solutions', id: 'Solusi Korporat' } },
  { value: '/solusi-umkm', label: { en: 'UMKM Solutions', id: 'Solusi UMKM' } },
  { value: '/tentang-kami', label: { en: 'About Us', id: 'Tentang Kami' } },
  { value: '/blog', label: { en: 'Blog', id: 'Blog' } },
  { value: '/kontak', label: { en: 'Contact', id: 'Kontak' } },
  { value: '/studi-kasus', label: { en: 'Case Studies', id: 'Studi Kasus' } },
];

interface PageLinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function PageLinkSelector({ value, onChange, label }: PageLinkSelectorProps) {
  const { language } = useLanguage();
  const [isCustomUrl, setIsCustomUrl] = useState(() => {
    // Check if the current value is a custom URL (not in the pages list)
    return value ? !pages.some(p => p.value === value) : false;
  });
  
  const handlePageSelect = (pageValue: string) => {
    onChange(pageValue);
  };
  
  const handleCustomUrlChange = (url: string) => {
    onChange(url);
  };
  
  const handleToggleCustom = (checked: boolean) => {
    setIsCustomUrl(checked);
    if (!checked) {
      // Reset to first page when switching back to page selector
      onChange('/');
    }
  };
  
  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">
          {language === 'en' ? 'Use custom URL' : 'Gunakan URL kustom'}
        </Label>
        <Switch 
          checked={isCustomUrl} 
          onCheckedChange={handleToggleCustom}
        />
      </div>
      
      {isCustomUrl ? (
        <Input
          placeholder={language === 'en' ? 'Enter custom URL (e.g., https://example.com)' : 'Masukkan URL kustom (cth: https://example.com)'}
          value={value}
          onChange={(e) => handleCustomUrlChange(e.target.value)}
        />
      ) : (
        <Select value={value || '/'} onValueChange={handlePageSelect}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder={language === 'en' ? 'Select a page' : 'Pilih halaman'} />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {pages.map((page) => (
              <SelectItem key={page.value} value={page.value}>
                {page.label[language as 'en' | 'id']}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
