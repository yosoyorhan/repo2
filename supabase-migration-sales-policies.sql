-- Sales RLS insert policy for sellers to record sales
ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sales' AND policyname = 'Sellers can insert sales'
  ) THEN
    CREATE POLICY "Sellers can insert sales"
    ON public.sales FOR INSERT
    TO authenticated
    WITH CHECK (seller_id = auth.uid());
  END IF;
END $$;
