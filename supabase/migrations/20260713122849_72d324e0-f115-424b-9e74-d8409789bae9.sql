
-- Seller (From) company details on profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS seller_name text,
  ADD COLUMN IF NOT EXISTS seller_gstin text,
  ADD COLUMN IF NOT EXISTS seller_pan text,
  ADD COLUMN IF NOT EXISTS seller_address text,
  ADD COLUMN IF NOT EXISTS seller_state text,
  ADD COLUMN IF NOT EXISTS seller_state_code text,
  ADD COLUMN IF NOT EXISTS seller_phone text,
  ADD COLUMN IF NOT EXISTS seller_email text,
  ADD COLUMN IF NOT EXISTS seller_logo_url text,
  ADD COLUMN IF NOT EXISTS referred_by text;

-- Invoice share tracking
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS share_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS share_whatsapp_sent_at timestamptz;

-- Referral codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  employee_name text NOT NULL,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_codes TO authenticated;
GRANT SELECT ON public.referral_codes TO anon;
GRANT ALL ON public.referral_codes TO service_role;

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Admins full control
CREATE POLICY "admins manage referral_codes"
  ON public.referral_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Anyone can look up an active code (for signup validation)
CREATE POLICY "public read active referral_codes"
  ON public.referral_codes FOR SELECT
  USING (active = true);

CREATE TRIGGER trg_referral_codes_updated_at BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to capture referred_by from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, company_name, approved, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    false,
    NEW.raw_user_meta_data->>'referred_by'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name),
      referred_by = COALESCE(EXCLUDED.referred_by, public.profiles.referred_by);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'trial'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;
