-- Insert Privacy Policy page content
INSERT INTO public.page_content (page_key, content_en, content_id)
VALUES (
  'privacy-policy',
  '{
    "hero": {
      "title": "Privacy Policy",
      "subtitle": "How we collect, use, and protect your information"
    },
    "content": "<h2>Information We Collect</h2><p>We collect information you provide directly to us, such as when you fill out a contact form, subscribe to our newsletter, or communicate with us.</p><h2>How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.</p><h2>Information Sharing</h2><p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.</p><h2>Data Security</h2><p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p><h2>Contact Us</h2><p>If you have any questions about this Privacy Policy, please contact us.</p>",
    "seo": {
      "title": "Privacy Policy - Bungkus Indonesia",
      "description": "Learn how Bungkus Indonesia collects, uses, and protects your personal information."
    }
  }'::jsonb,
  '{
    "hero": {
      "title": "Kebijakan Privasi",
      "subtitle": "Bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda"
    },
    "content": "<h2>Informasi yang Kami Kumpulkan</h2><p>Kami mengumpulkan informasi yang Anda berikan langsung kepada kami, seperti saat Anda mengisi formulir kontak, berlangganan newsletter kami, atau berkomunikasi dengan kami.</p><h2>Bagaimana Kami Menggunakan Informasi Anda</h2><p>Kami menggunakan informasi yang kami kumpulkan untuk menyediakan, memelihara, dan meningkatkan layanan kami, untuk berkomunikasi dengan Anda, dan untuk mematuhi kewajiban hukum.</p><h2>Berbagi Informasi</h2><p>Kami tidak menjual, memperdagangkan, atau mentransfer informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali sebagaimana diwajibkan oleh hukum.</p><h2>Keamanan Data</h2><p>Kami menerapkan langkah-langkah keamanan yang tepat untuk melindungi informasi pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah.</p><h2>Hubungi Kami</h2><p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami.</p>",
    "seo": {
      "title": "Kebijakan Privasi - Bungkus Indonesia",
      "description": "Pelajari bagaimana Bungkus Indonesia mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda."
    }
  }'::jsonb
)
ON CONFLICT (page_key) DO NOTHING;

-- Insert Terms & Conditions page content
INSERT INTO public.page_content (page_key, content_en, content_id)
VALUES (
  'terms-conditions',
  '{
    "hero": {
      "title": "Terms & Conditions",
      "subtitle": "Please read these terms carefully before using our services"
    },
    "content": "<h2>Acceptance of Terms</h2><p>By accessing and using our website and services, you accept and agree to be bound by these Terms & Conditions.</p><h2>Use of Services</h2><p>You agree to use our services only for lawful purposes and in accordance with these terms. You are responsible for ensuring that your use does not violate any applicable laws.</p><h2>Intellectual Property</h2><p>All content on this website, including text, graphics, logos, and images, is the property of Bungkus Indonesia and is protected by intellectual property laws.</p><h2>Limitation of Liability</h2><p>We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p><h2>Changes to Terms</h2><p>We reserve the right to modify these terms at any time. Your continued use of our services after changes constitutes acceptance of the new terms.</p><h2>Contact</h2><p>For questions regarding these Terms & Conditions, please contact us.</p>",
    "seo": {
      "title": "Terms & Conditions - Bungkus Indonesia",
      "description": "Read the terms and conditions for using Bungkus Indonesia website and services."
    }
  }'::jsonb,
  '{
    "hero": {
      "title": "Syarat & Ketentuan",
      "subtitle": "Harap baca syarat ini dengan seksama sebelum menggunakan layanan kami"
    },
    "content": "<h2>Penerimaan Syarat</h2><p>Dengan mengakses dan menggunakan situs web dan layanan kami, Anda menerima dan setuju untuk terikat oleh Syarat & Ketentuan ini.</p><h2>Penggunaan Layanan</h2><p>Anda setuju untuk menggunakan layanan kami hanya untuk tujuan yang sah dan sesuai dengan syarat-syarat ini. Anda bertanggung jawab untuk memastikan bahwa penggunaan Anda tidak melanggar hukum yang berlaku.</p><h2>Kekayaan Intelektual</h2><p>Semua konten di situs web ini, termasuk teks, grafik, logo, dan gambar, adalah milik Bungkus Indonesia dan dilindungi oleh hukum kekayaan intelektual.</p><h2>Batasan Tanggung Jawab</h2><p>Kami tidak bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan layanan kami oleh Anda.</p><h2>Perubahan Syarat</h2><p>Kami berhak untuk mengubah syarat-syarat ini kapan saja. Penggunaan layanan kami secara berkelanjutan setelah perubahan merupakan penerimaan syarat baru.</p><h2>Kontak</h2><p>Untuk pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami.</p>",
    "seo": {
      "title": "Syarat & Ketentuan - Bungkus Indonesia",
      "description": "Baca syarat dan ketentuan untuk menggunakan situs web dan layanan Bungkus Indonesia."
    }
  }'::jsonb
)
ON CONFLICT (page_key) DO NOTHING;