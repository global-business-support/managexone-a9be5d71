CREATE TABLE public.admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approval_token UUID NOT NULL DEFAULT gen_random_uuid(),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT admin_requests_user_unique UNIQUE (user_id),
  CONSTRAINT admin_requests_token_unique UNIQUE (approval_token)
);

GRANT SELECT, INSERT, UPDATE ON public.admin_requests TO authenticated;
GRANT ALL ON public.admin_requests TO service_role;

ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters view own admin requests"
ON public.admin_requests
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Requesters create own admin requests"
ON public.admin_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update admin requests"
ON public.admin_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_admin_requests_status_created_at
  ON public.admin_requests (status, created_at DESC);

CREATE TRIGGER trg_admin_requests_updated_at
BEFORE UPDATE ON public.admin_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, company_name, approved)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    false
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'trial'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_admin_request(_token UUID, _reviewer UUID)
RETURNS public.admin_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.admin_requests;
BEGIN
  UPDATE public.admin_requests
  SET status = 'approved',
      reviewed_by = _reviewer,
      reviewed_at = now(),
      updated_at = now()
  WHERE approval_token = _token
    AND status = 'pending'
  RETURNING * INTO req;

  IF req.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or processed approval token';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (req.user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles
  SET approved = true,
      updated_at = now()
  WHERE user_id = req.user_id;

  DELETE FROM public.user_roles
  WHERE user_id = req.user_id
    AND role = 'trial'::app_role;

  SELECT * INTO req FROM public.admin_requests WHERE id = req.id;
  RETURN req;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_admin_request(_token UUID, _reviewer UUID)
RETURNS public.admin_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.admin_requests;
BEGIN
  UPDATE public.admin_requests
  SET status = 'rejected',
      reviewed_by = _reviewer,
      reviewed_at = now(),
      updated_at = now()
  WHERE approval_token = _token
    AND status = 'pending'
  RETURNING * INTO req;

  IF req.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or processed approval token';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = req.user_id
    AND role = 'admin'::app_role;

  SELECT * INTO req FROM public.admin_requests WHERE id = req.id;
  RETURN req;
END;
$$;