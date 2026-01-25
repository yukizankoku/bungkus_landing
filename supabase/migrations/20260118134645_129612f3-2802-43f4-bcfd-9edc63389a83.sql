-- Add slug and use_prefix columns to page_content table
ALTER TABLE page_content 
ADD COLUMN slug text,
ADD COLUMN use_prefix boolean DEFAULT false;

-- Set default slugs for existing pages based on current hardcoded routes
UPDATE page_content SET slug = 'produk' WHERE page_key = 'product-catalog';
UPDATE page_content SET slug = 'produk/industri' WHERE page_key = 'products';
UPDATE page_content SET slug = 'solusi-korporat' WHERE page_key = 'corporate-solutions';
UPDATE page_content SET slug = 'solusi-umkm' WHERE page_key = 'umkm-solutions';
UPDATE page_content SET slug = 'tentang-kami' WHERE page_key = 'about';
UPDATE page_content SET slug = 'hubungi-kami' WHERE page_key = 'contact';
UPDATE page_content SET slug = 'case-studies' WHERE page_key = 'case-studies';
UPDATE page_content SET slug = 'blog' WHERE page_key = 'blog';
UPDATE page_content SET slug = 'privacy' WHERE page_key = 'privacy-policy';
UPDATE page_content SET slug = 'terms' WHERE page_key = 'terms-conditions';
UPDATE page_content SET slug = '' WHERE page_key = 'home';