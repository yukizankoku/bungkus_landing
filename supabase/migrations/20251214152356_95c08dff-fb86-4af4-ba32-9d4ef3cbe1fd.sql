-- Create storage bucket for media (hero images, logos, blog images)
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- RLS policies for media bucket - public read, admin write
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Add SEO fields to blogs table
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_title_id TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_id TEXT;

-- Insert initial page content for all pages with hero images
INSERT INTO public.page_content (page_key, content_en, content_id) VALUES
('home', '{
  "hero": {
    "image": "",
    "title": "Premium Packaging Solutions for Your Business",
    "subtitle": "From small businesses to large corporations, we deliver quality packaging that elevates your brand"
  },
  "meta_title": "Bungkus Indonesia - Premium Packaging Solutions",
  "meta_description": "Leading packaging manufacturer in Indonesia. Custom solutions for corporate and UMKM businesses."
}', '{
  "hero": {
    "image": "",
    "title": "Solusi Kemasan Premium untuk Bisnis Anda",
    "subtitle": "Dari usaha kecil hingga perusahaan besar, kami menghadirkan kemasan berkualitas yang mengangkat brand Anda"
  },
  "meta_title": "Bungkus Indonesia - Solusi Kemasan Premium",
  "meta_description": "Produsen kemasan terkemuka di Indonesia. Solusi custom untuk korporat dan UMKM."
}'),
('corporate', '{
  "hero": {
    "image": "",
    "title": "Enterprise Packaging Solutions",
    "subtitle": "Scalable, reliable, and sustainable packaging for large-scale operations"
  },
  "meta_title": "Corporate Solutions - Bungkus Indonesia",
  "meta_description": "Enterprise-grade packaging solutions for corporations. High volume, consistent quality."
}', '{
  "hero": {
    "image": "",
    "title": "Solusi Kemasan Korporat",
    "subtitle": "Kemasan yang skalabel, andal, dan berkelanjutan untuk operasi skala besar"
  },
  "meta_title": "Solusi Korporat - Bungkus Indonesia",
  "meta_description": "Solusi kemasan kelas enterprise untuk perusahaan. Volume tinggi, kualitas konsisten."
}'),
('umkm', '{
  "hero": {
    "image": "",
    "title": "Packaging Solutions for Growing Businesses",
    "subtitle": "Affordable, quality packaging with low minimum orders"
  },
  "meta_title": "UMKM Solutions - Bungkus Indonesia",
  "meta_description": "Affordable packaging for small and medium businesses. Low MOQ, high quality."
}', '{
  "hero": {
    "image": "",
    "title": "Solusi Kemasan untuk Bisnis Berkembang",
    "subtitle": "Kemasan berkualitas dengan harga terjangkau dan minimum order rendah"
  },
  "meta_title": "Solusi UMKM - Bungkus Indonesia",
  "meta_description": "Kemasan terjangkau untuk usaha kecil dan menengah. MOQ rendah, kualitas tinggi."
}'),
('products', '{
  "hero": {
    "image": "",
    "title": "Our Product Catalog",
    "subtitle": "Explore our wide range of packaging solutions"
  },
  "meta_title": "Products - Bungkus Indonesia",
  "meta_description": "Browse our complete packaging product catalog. Paper bags, boxes, food containers and more."
}', '{
  "hero": {
    "image": "",
    "title": "Katalog Produk Kami",
    "subtitle": "Jelajahi berbagai solusi kemasan kami"
  },
  "meta_title": "Produk - Bungkus Indonesia",
  "meta_description": "Lihat katalog produk kemasan lengkap kami. Paper bag, kotak, wadah makanan dan lainnya."
}'),
('case-studies', '{
  "hero": {
    "image": "",
    "title": "Success Stories",
    "subtitle": "See how we have helped businesses transform their packaging"
  },
  "meta_title": "Case Studies - Bungkus Indonesia",
  "meta_description": "Read success stories from our clients. See real results from our packaging solutions."
}', '{
  "hero": {
    "image": "",
    "title": "Kisah Sukses",
    "subtitle": "Lihat bagaimana kami membantu bisnis mentransformasi kemasan mereka"
  },
  "meta_title": "Studi Kasus - Bungkus Indonesia",
  "meta_description": "Baca kisah sukses dari klien kami. Lihat hasil nyata dari solusi kemasan kami."
}'),
('about', '{
  "hero": {
    "image": "",
    "title": "About Bungkus Indonesia",
    "subtitle": "Your trusted packaging partner since 2010"
  },
  "meta_title": "About Us - Bungkus Indonesia",
  "meta_description": "Learn about Bungkus Indonesia, a leading packaging manufacturer with over 10 years of experience."
}', '{
  "hero": {
    "image": "",
    "title": "Tentang Bungkus Indonesia",
    "subtitle": "Mitra kemasan terpercaya Anda sejak 2010"
  },
  "meta_title": "Tentang Kami - Bungkus Indonesia",
  "meta_description": "Pelajari tentang Bungkus Indonesia, produsen kemasan terkemuka dengan pengalaman lebih dari 10 tahun."
}'),
('contact', '{
  "hero": {
    "image": "",
    "title": "Get in Touch",
    "subtitle": "We would love to hear from you"
  },
  "meta_title": "Contact Us - Bungkus Indonesia",
  "meta_description": "Contact Bungkus Indonesia for packaging inquiries. Get a free quote today."
}', '{
  "hero": {
    "image": "",
    "title": "Hubungi Kami",
    "subtitle": "Kami senang mendengar dari Anda"
  },
  "meta_title": "Hubungi Kami - Bungkus Indonesia",
  "meta_description": "Hubungi Bungkus Indonesia untuk pertanyaan kemasan. Dapatkan penawaran gratis hari ini."
}'),
('blog', '{
  "hero": {
    "image": "",
    "title": "Blog & Insights",
    "subtitle": "Latest news, tips, and industry trends"
  },
  "meta_title": "Blog - Bungkus Indonesia",
  "meta_description": "Read our latest articles about packaging trends, tips, and industry news."
}', '{
  "hero": {
    "image": "",
    "title": "Blog & Wawasan",
    "subtitle": "Berita terbaru, tips, dan tren industri"
  },
  "meta_title": "Blog - Bungkus Indonesia",
  "meta_description": "Baca artikel terbaru kami tentang tren kemasan, tips, dan berita industri."
}')
ON CONFLICT (page_key) DO UPDATE SET
  content_en = EXCLUDED.content_en,
  content_id = EXCLUDED.content_id,
  updated_at = now();

-- Insert site settings for logo
INSERT INTO public.site_settings (key, value) VALUES
('logo', '{"light": "", "dark": ""}'),
('contact', '{"email": "info@bungkusindonesia.com", "phone": "+62 21 1234 5678", "whatsapp": "+6281234567890", "address": "Jakarta, Indonesia"}'),
('social', '{"instagram": "", "facebook": "", "linkedin": "", "youtube": ""}')
ON CONFLICT (key) DO NOTHING;

-- Insert 3 sample blog posts
INSERT INTO public.blogs (
  title_en, title_id, slug, excerpt_en, excerpt_id, content_en, content_id,
  category, is_published, meta_title_en, meta_title_id, meta_description_en, meta_description_id
) VALUES
(
  'Complete Guide to Choosing Packaging for UMKM',
  'Panduan Lengkap Memilih Kemasan untuk UMKM',
  'panduan-memilih-kemasan-umkm',
  'Learn how to choose the right packaging for your small business that balances quality, cost, and brand identity.',
  'Pelajari cara memilih kemasan yang tepat untuk usaha kecil Anda yang menyeimbangkan kualitas, biaya, dan identitas brand.',
  '<h1>Complete Guide to Choosing Packaging for UMKM</h1>
<p>Choosing the right packaging is crucial for small and medium businesses. It not only protects your product but also represents your brand.</p>

<h2>Why Packaging Matters</h2>
<p>First impressions count. Your packaging is often the first physical touchpoint customers have with your brand.</p>

<h3>Brand Recognition</h3>
<p>Consistent, quality packaging helps build brand recognition and customer loyalty.</p>

<h3>Product Protection</h3>
<p>Good packaging ensures your products arrive in perfect condition.</p>

<h2>Types of Packaging for UMKM</h2>
<p>There are several packaging options suitable for small businesses:</p>

<h3>Paper Bags</h3>
<p>Eco-friendly and customizable, perfect for retail and food businesses.</p>

<h3>Cardboard Boxes</h3>
<p>Sturdy and professional, ideal for shipping and premium products.</p>

<h3>Food Containers</h3>
<p>Safe and practical for F&B businesses.</p>

<h2>Tips for Choosing Packaging</h2>
<p>Consider these factors when selecting your packaging:</p>
<ul>
<li>Budget constraints</li>
<li>Product requirements</li>
<li>Brand identity</li>
<li>Environmental impact</li>
</ul>

<h2>Conclusion</h2>
<p>Investing in quality packaging is investing in your brand success.</p>',
  '<h1>Panduan Lengkap Memilih Kemasan untuk UMKM</h1>
<p>Memilih kemasan yang tepat sangat penting untuk usaha kecil dan menengah. Kemasan tidak hanya melindungi produk tetapi juga mewakili brand Anda.</p>

<h2>Mengapa Kemasan Penting</h2>
<p>Kesan pertama sangat berarti. Kemasan Anda sering menjadi titik kontak fisik pertama pelanggan dengan brand Anda.</p>

<h3>Pengenalan Brand</h3>
<p>Kemasan yang konsisten dan berkualitas membantu membangun pengenalan brand dan loyalitas pelanggan.</p>

<h3>Perlindungan Produk</h3>
<p>Kemasan yang baik memastikan produk Anda tiba dalam kondisi sempurna.</p>

<h2>Jenis Kemasan untuk UMKM</h2>
<p>Ada beberapa pilihan kemasan yang cocok untuk usaha kecil:</p>

<h3>Paper Bag</h3>
<p>Ramah lingkungan dan dapat dikustomisasi, sempurna untuk bisnis retail dan makanan.</p>

<h3>Kotak Kardus</h3>
<p>Kokoh dan profesional, ideal untuk pengiriman dan produk premium.</p>

<h3>Wadah Makanan</h3>
<p>Aman dan praktis untuk bisnis F&B.</p>

<h2>Tips Memilih Kemasan</h2>
<p>Pertimbangkan faktor-faktor ini saat memilih kemasan:</p>
<ul>
<li>Batasan anggaran</li>
<li>Kebutuhan produk</li>
<li>Identitas brand</li>
<li>Dampak lingkungan</li>
</ul>

<h2>Kesimpulan</h2>
<p>Berinvestasi dalam kemasan berkualitas adalah berinvestasi dalam kesuksesan brand Anda.</p>',
  'Tips & Tricks',
  true,
  'Guide to Choosing Packaging for UMKM | Bungkus Indonesia',
  'Panduan Memilih Kemasan untuk UMKM | Bungkus Indonesia',
  'Complete guide to choosing the right packaging for your small business. Learn about types, costs, and best practices.',
  'Panduan lengkap memilih kemasan yang tepat untuk usaha kecil Anda. Pelajari jenis, biaya, dan praktik terbaik.'
),
(
  'Eco-Friendly Packaging Trends 2024',
  'Tren Kemasan Ramah Lingkungan 2024',
  'tren-kemasan-ramah-lingkungan-2024',
  'Discover the latest sustainable packaging trends that are shaping the industry in 2024.',
  'Temukan tren kemasan berkelanjutan terbaru yang membentuk industri di tahun 2024.',
  '<h1>Eco-Friendly Packaging Trends 2024</h1>
<p>Sustainability is no longer optional in the packaging industry. Here are the trends defining 2024.</p>

<h2>The Rise of Biodegradable Materials</h2>
<p>More businesses are switching to biodegradable packaging materials.</p>

<h3>Plant-Based Plastics</h3>
<p>PLA and other plant-based alternatives are becoming mainstream.</p>

<h3>Mushroom Packaging</h3>
<p>Innovative mycelium-based packaging offers excellent protection with zero waste.</p>

<h2>Minimalist Design Approach</h2>
<p>Less is more when it comes to sustainable packaging design.</p>

<h3>Reduced Ink Usage</h3>
<p>Single-color printing and natural kraft aesthetics are trending.</p>

<h3>Right-Sizing</h3>
<p>Packaging sized to fit products reduces material waste and shipping costs.</p>

<h2>Circular Economy Integration</h2>
<p>Packaging designed for reuse and recycling.</p>

<h3>Refillable Systems</h3>
<p>Brands are introducing refillable packaging options.</p>

<h3>Take-Back Programs</h3>
<p>Companies collecting used packaging for recycling or reuse.</p>

<h2>Consumer Expectations</h2>
<p>Modern consumers demand sustainable options and are willing to pay more for them.</p>

<h2>Conclusion</h2>
<p>Embracing eco-friendly packaging is both good for business and the planet.</p>',
  '<h1>Tren Kemasan Ramah Lingkungan 2024</h1>
<p>Keberlanjutan bukan lagi pilihan dalam industri kemasan. Berikut tren yang mendefinisikan 2024.</p>

<h2>Kebangkitan Material Biodegradable</h2>
<p>Semakin banyak bisnis beralih ke material kemasan biodegradable.</p>

<h3>Plastik Berbasis Tanaman</h3>
<p>PLA dan alternatif berbasis tanaman lainnya menjadi mainstream.</p>

<h3>Kemasan Jamur</h3>
<p>Kemasan inovatif berbasis miselium menawarkan perlindungan excellent dengan zero waste.</p>

<h2>Pendekatan Desain Minimalis</h2>
<p>Less is more dalam desain kemasan berkelanjutan.</p>

<h3>Pengurangan Penggunaan Tinta</h3>
<p>Cetak satu warna dan estetika kraft natural sedang tren.</p>

<h3>Ukuran Tepat</h3>
<p>Kemasan berukuran pas dengan produk mengurangi limbah material dan biaya pengiriman.</p>

<h2>Integrasi Ekonomi Sirkular</h2>
<p>Kemasan didesain untuk digunakan ulang dan didaur ulang.</p>

<h3>Sistem Isi Ulang</h3>
<p>Brand memperkenalkan opsi kemasan isi ulang.</p>

<h3>Program Pengembalian</h3>
<p>Perusahaan mengumpulkan kemasan bekas untuk didaur ulang atau digunakan ulang.</p>

<h2>Ekspektasi Konsumen</h2>
<p>Konsumen modern menuntut opsi berkelanjutan dan bersedia membayar lebih.</p>

<h2>Kesimpulan</h2>
<p>Mengadopsi kemasan ramah lingkungan baik untuk bisnis dan planet.</p>',
  'Industry Trends',
  true,
  'Eco-Friendly Packaging Trends 2024 | Bungkus Indonesia',
  'Tren Kemasan Ramah Lingkungan 2024 | Bungkus Indonesia',
  'Discover the latest sustainable packaging trends for 2024. Biodegradable materials, minimalist design, and more.',
  'Temukan tren kemasan berkelanjutan terbaru untuk 2024. Material biodegradable, desain minimalis, dan lainnya.'
),
(
  'How to Enhance Your Brand with Custom Packaging',
  'Cara Meningkatkan Brand dengan Kemasan Custom',
  'meningkatkan-brand-dengan-kemasan-custom',
  'Learn how custom packaging can transform your brand perception and increase customer loyalty.',
  'Pelajari bagaimana kemasan custom dapat mentransformasi persepsi brand dan meningkatkan loyalitas pelanggan.',
  '<h1>How to Enhance Your Brand with Custom Packaging</h1>
<p>Custom packaging is one of the most powerful branding tools available to businesses of all sizes.</p>

<h2>The Psychology of Unboxing</h2>
<p>The unboxing experience creates emotional connections with your customers.</p>

<h3>First Impressions</h3>
<p>Quality packaging signals quality products before customers even see what is inside.</p>

<h3>Shareability</h3>
<p>Beautiful packaging encourages social media sharing, providing free marketing.</p>

<h2>Elements of Effective Brand Packaging</h2>
<p>Key components that make packaging memorable.</p>

<h3>Color Psychology</h3>
<p>Colors evoke emotions and should align with your brand personality.</p>

<h3>Typography</h3>
<p>Font choices communicate brand character from elegant to playful.</p>

<h3>Material Quality</h3>
<p>The feel of packaging contributes to perceived product value.</p>

<h2>Custom Packaging Options</h2>
<p>Various ways to customize your packaging.</p>

<h3>Printed Designs</h3>
<p>Full-color printing allows for complex designs and photography.</p>

<h3>Embossing and Debossing</h3>
<p>Tactile elements add luxury and sophistication.</p>

<h3>Special Finishes</h3>
<p>Matte, glossy, or spot UV finishes create visual interest.</p>

<h2>ROI of Custom Packaging</h2>
<p>Investing in custom packaging pays dividends through increased brand recognition and customer loyalty.</p>

<h2>Conclusion</h2>
<p>Custom packaging is not an expense, it is an investment in your brand future.</p>',
  '<h1>Cara Meningkatkan Brand dengan Kemasan Custom</h1>
<p>Kemasan custom adalah salah satu alat branding paling powerful yang tersedia untuk bisnis dari semua ukuran.</p>

<h2>Psikologi Unboxing</h2>
<p>Pengalaman unboxing menciptakan koneksi emosional dengan pelanggan Anda.</p>

<h3>Kesan Pertama</h3>
<p>Kemasan berkualitas mengisyaratkan produk berkualitas sebelum pelanggan melihat isinya.</p>

<h3>Dapat Dibagikan</h3>
<p>Kemasan cantik mendorong sharing di media sosial, memberikan marketing gratis.</p>

<h2>Elemen Kemasan Brand yang Efektif</h2>
<p>Komponen kunci yang membuat kemasan memorable.</p>

<h3>Psikologi Warna</h3>
<p>Warna membangkitkan emosi dan harus selaras dengan kepribadian brand Anda.</p>

<h3>Tipografi</h3>
<p>Pilihan font mengkomunikasikan karakter brand dari elegan hingga playful.</p>

<h3>Kualitas Material</h3>
<p>Rasa kemasan berkontribusi pada persepsi nilai produk.</p>

<h2>Opsi Kemasan Custom</h2>
<p>Berbagai cara untuk mengkustomisasi kemasan Anda.</p>

<h3>Desain Cetak</h3>
<p>Cetak full-color memungkinkan desain kompleks dan fotografi.</p>

<h3>Emboss dan Deboss</h3>
<p>Elemen taktil menambah kemewahan dan sofistikasi.</p>

<h3>Finishing Khusus</h3>
<p>Finishing matte, glossy, atau spot UV menciptakan visual interest.</p>

<h2>ROI Kemasan Custom</h2>
<p>Investasi dalam kemasan custom memberikan dividen melalui peningkatan pengenalan brand dan loyalitas pelanggan.</p>

<h2>Kesimpulan</h2>
<p>Kemasan custom bukan pengeluaran, ini adalah investasi untuk masa depan brand Anda.</p>',
  'Branding',
  true,
  'Enhance Your Brand with Custom Packaging | Bungkus Indonesia',
  'Tingkatkan Brand dengan Kemasan Custom | Bungkus Indonesia',
  'Learn how custom packaging can transform your brand and increase customer loyalty. Tips and strategies inside.',
  'Pelajari bagaimana kemasan custom dapat mentransformasi brand Anda dan meningkatkan loyalitas pelanggan.'
);