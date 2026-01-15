-- Update validate_contact_submission function to make message optional and add enhanced security
CREATE OR REPLACE FUNCTION public.validate_contact_submission()
RETURNS TRIGGER AS $$
DECLARE
  trimmed_message TEXT;
BEGIN
  -- Validate name (required, 2-100 chars)
  IF NEW.name IS NULL OR length(trim(NEW.name)) < 2 OR length(trim(NEW.name)) > 100 THEN
    RAISE EXCEPTION 'Invalid name length' USING ERRCODE = 'P0002';
  END IF;

  -- Validate email (required, valid format)
  IF NEW.email IS NULL OR NEW.email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format' USING ERRCODE = 'P0003';
  END IF;

  -- Normalize message
  trimmed_message := COALESCE(trim(NEW.message), '');

  -- Message validation is now CONDITIONAL - only validate if message is provided and not empty
  IF length(trimmed_message) > 0 THEN
    -- Max length check (50 characters)
    IF length(trimmed_message) > 50 THEN
      RAISE EXCEPTION 'Message too long (max 50 characters)' USING ERRCODE = 'P0004';
    END IF;

    -- Minimum length if provided
    IF length(trimmed_message) < 3 THEN
      RAISE EXCEPTION 'Message too short (min 3 characters)' USING ERRCODE = 'P0004';
    END IF;

    -- Block SQL injection patterns
    IF trimmed_message ~* '(SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET|DELETE\s+FROM|DROP\s+TABLE|UNION\s+SELECT|--\s*$|;\s*DROP)' THEN
      RAISE EXCEPTION 'Invalid content detected' USING ERRCODE = 'P0004';
    END IF;

    -- Block XSS/script patterns
    IF trimmed_message ~* '(<script|</script>|javascript:|on\w+\s*=|<iframe|<embed|<object)' THEN
      RAISE EXCEPTION 'Invalid content detected' USING ERRCODE = 'P0004';
    END IF;

    -- Block excessive repetition (e.g., "aaaaaaa" - same char 5+ times)
    IF trimmed_message ~ '(.)\1{4,}' THEN
      RAISE EXCEPTION 'Invalid content pattern' USING ERRCODE = 'P0004';
    END IF;

    -- Block URLs in message (for short messages, URLs are suspicious)
    IF trimmed_message ~* '(https?://|www\.|\.com|\.net|\.org|\.io)' THEN
      RAISE EXCEPTION 'URLs not allowed in message' USING ERRCODE = 'P0004';
    END IF;

    -- Block Base64-like patterns (long alphanumeric strings without spaces)
    IF trimmed_message ~ '^[A-Za-z0-9+/=]{20,}$' THEN
      RAISE EXCEPTION 'Invalid content encoding' USING ERRCODE = 'P0004';
    END IF;
  END IF;

  -- Validate phone if provided (optional field)
  IF NEW.phone IS NOT NULL AND length(trim(NEW.phone)) > 0 THEN
    IF length(NEW.phone) > 20 THEN
      RAISE EXCEPTION 'Phone number too long' USING ERRCODE = 'P0005';
    END IF;
  END IF;

  -- Validate company if provided (optional field)
  IF NEW.company IS NOT NULL AND length(trim(NEW.company)) > 0 THEN
    IF length(NEW.company) > 200 THEN
      RAISE EXCEPTION 'Company name too long' USING ERRCODE = 'P0005';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;