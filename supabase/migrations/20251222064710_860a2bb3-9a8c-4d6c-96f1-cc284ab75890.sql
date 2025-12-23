-- Create custom_pages table for WordPress-like dynamic page management
CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_id text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES public.custom_pages(id) ON DELETE SET NULL,
  template text NOT NULL DEFAULT 'default',
  status text NOT NULL DEFAULT 'draft',
  content_en jsonb DEFAULT '[]'::jsonb,
  content_id jsonb DEFAULT '[]'::jsonb,
  meta_title_en text,
  meta_title_id text,
  meta_description_en text,
  meta_description_id text,
  og_image text,
  sort_order integer DEFAULT 0,
  is_in_menu boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add icon column to navigation_menus if it doesn't exist (for better menu management)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'navigation_menus' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.navigation_menus ADD COLUMN icon text;
  END IF;
END $$;

-- Enable RLS on custom_pages
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_pages
CREATE POLICY "Anyone can view published custom pages"
ON public.custom_pages
FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can manage all custom pages"
ON public.custom_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can manage all custom pages"
ON public.custom_pages
FOR ALL
USING (has_role(auth.uid(), 'editor'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_custom_pages_updated_at
BEFORE UPDATE ON public.custom_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster slug lookups
CREATE INDEX idx_custom_pages_slug ON public.custom_pages(slug);
CREATE INDEX idx_custom_pages_status ON public.custom_pages(status);
CREATE INDEX idx_custom_pages_parent ON public.custom_pages(parent_id);