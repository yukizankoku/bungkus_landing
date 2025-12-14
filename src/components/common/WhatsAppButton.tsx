import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function WhatsAppButton() {
  const { t } = useLanguage();
  const phoneNumber = '6281234567890'; // Replace with actual number
  const message = encodeURIComponent(
    t(
      'Halo, saya tertarik dengan layanan kemasan Bungkus Indonesia.',
      'Hello, I am interested in Bungkus Indonesia packaging services.'
    )
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-medium text-sm group-hover:inline">
        {t('Chat dengan Kami', 'Chat with Us')}
      </span>
    </a>
  );
}
