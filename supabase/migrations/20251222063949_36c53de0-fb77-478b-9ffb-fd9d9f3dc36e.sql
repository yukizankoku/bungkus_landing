-- Create navigation_menus table for dynamic menu management
CREATE TABLE public.navigation_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_en text NOT NULL,
  label_id text NOT NULL,
  href text,
  parent_id uuid REFERENCES public.navigation_menus(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for faster sorting and hierarchy queries
CREATE INDEX idx_navigation_menus_parent_sort ON public.navigation_menus(parent_id, sort_order);

-- Enable RLS
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible menu items
CREATE POLICY "Anyone can view visible menus" 
ON public.navigation_menus 
FOR SELECT 
USING (is_visible = true);

-- Admins can manage all menu items
CREATE POLICY "Admins can manage menus" 
ON public.navigation_menus 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_navigation_menus_updated_at
BEFORE UPDATE ON public.navigation_menus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default navigation items
INSERT INTO public.navigation_menus (id, label_en, label_id, href, parent_id, sort_order, is_visible) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Home', 'Beranda', '/', NULL, 0, true),
  ('22222222-2222-2222-2222-222222222222', 'Solutions', 'Solusi', NULL, NULL, 1, true),
  ('22222222-2222-2222-2222-222222222223', 'Corporate', 'Korporat', '/solusi-korporat', '22222222-2222-2222-2222-222222222222', 0, true),
  ('22222222-2222-2222-2222-222222222224', 'UMKM', 'UMKM', '/solusi-umkm', '22222222-2222-2222-2222-222222222222', 1, true),
  ('33333333-3333-3333-3333-333333333333', 'Products', 'Produk', NULL, NULL, 2, true),
  ('33333333-3333-3333-3333-333333333334', 'Industry Categories', 'Kategori Industri', '/produk', '33333333-3333-3333-3333-333333333333', 0, true),
  ('33333333-3333-3333-3333-333333333335', 'Product Catalog', 'Katalog Produk', '/produk/katalog', '33333333-3333-3333-3333-333333333333', 1, true),
  ('44444444-4444-4444-4444-444444444444', 'Case Studies', 'Case Studies', '/case-studies', NULL, 3, true),
  ('55555555-5555-5555-5555-555555555555', 'Blog', 'Blog', '/blog', NULL, 4, true),
  ('66666666-6666-6666-6666-666666666666', 'About Us', 'Tentang Kami', '/tentang-kami', NULL, 5, true);