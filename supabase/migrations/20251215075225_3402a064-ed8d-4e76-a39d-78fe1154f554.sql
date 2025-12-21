-- Create a rate limiting function for contact submissions
-- This function checks if an email has submitted within the last 5 minutes
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if same email submitted in last 5 minutes
  IF EXISTS (
    SELECT 1 FROM public.contact_submissions
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '5 minutes'
  ) THEN
    RAISE EXCEPTION 'rate limit exceeded' USING ERRCODE = 'P0001';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce rate limiting before insert
DROP TRIGGER IF EXISTS contact_rate_limit_trigger ON public.contact_submissions;

CREATE TRIGGER contact_rate_limit_trigger
  BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_contact_rate_limit();