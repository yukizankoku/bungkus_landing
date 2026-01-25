-- Add use_prefix column to custom_pages table
-- false = root level URL (e.g., /katalog) - default, better for SEO
-- true = prefixed URL (e.g., /p/katalog)
ALTER TABLE public.custom_pages 
ADD COLUMN use_prefix boolean DEFAULT false;