
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS screenshot_url text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS upi_ref text;
