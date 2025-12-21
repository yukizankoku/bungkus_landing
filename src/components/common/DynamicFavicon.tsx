import { useEffect } from 'react';
import { useSiteSetting } from '@/hooks/useSiteSettings';

export function DynamicFavicon() {
  const { data: faviconSetting } = useSiteSetting('favicon');

  useEffect(() => {
    const faviconUrl = faviconSetting?.value?.url;
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [faviconSetting]);

  return null;
}
