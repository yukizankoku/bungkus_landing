import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

interface WhatsAppSettings {
  phone?: string;
  message_en?: string;
  message_id?: string;
  button_text_en?: string;
  button_text_id?: string;
  position?: 'bottom-right' | 'bottom-left';
  enabled?: boolean;
}

export function WhatsAppButton() {
  const { language } = useLanguage();
  const { data: settings } = useSiteSettings();
  
  // Get WhatsApp specific settings
  const whatsappSetting = settings?.find(s => s.key === 'whatsapp')?.value as WhatsAppSettings | undefined;
  
  // Fallback to contact settings for phone number if whatsapp settings not found
  const contactSetting = settings?.find(s => s.key === 'contact')?.value as { whatsapp?: string } | undefined;
  
  // Determine values with fallbacks
  const enabled = whatsappSetting?.enabled !== false; // Default to true
  const phoneNumber = whatsappSetting?.phone || contactSetting?.whatsapp || '6281234567890';
  const buttonText = language === 'id' 
    ? (whatsappSetting?.button_text_id || 'Chat dengan Kami')
    : (whatsappSetting?.button_text_en || 'Chat with Us');
  const messageTemplate = language === 'id'
    ? (whatsappSetting?.message_id || 'Halo, saya tertarik dengan layanan kemasan Bungkus Indonesia.')
    : (whatsappSetting?.message_en || 'Hello, I am interested in Bungkus Indonesia packaging services.');
  const position = whatsappSetting?.position || 'bottom-right';
  
  const message = encodeURIComponent(messageTemplate);

  if (!enabled) return null;

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group",
        position === 'bottom-right' ? 'right-6' : 'left-6'
      )}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-medium text-sm group-hover:inline">
        {buttonText}
      </span>
    </a>
  );
}
