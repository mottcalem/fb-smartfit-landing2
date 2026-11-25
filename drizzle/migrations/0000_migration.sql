CREATE TABLE public.dealer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text NOT NULL,
  store_type text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.dealer_applications TO service_role;
ALTER TABLE public.dealer_applications ENABLE ROW LEVEL SECURITY;