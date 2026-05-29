
CREATE OR REPLACE FUNCTION public.self_register_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  DELETE FROM public.user_roles
  WHERE user_id = uid AND role = 'trial'::app_role;

  UPDATE public.profiles
  SET approved = true, updated_at = now()
  WHERE user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.self_register_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.self_register_admin() TO authenticated;
