-- Account type is separate from profiles.role, which stores a job/trade role.
CREATE TABLE IF NOT EXISTS public.accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_role TEXT NOT NULL DEFAULT 'user'
      CHECK (account_role IN ('user', 'institution', 'industry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own account"
    ON public.accounts FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (user_id, account_role)
  VALUES (
    NEW.id,
    CASE NEW.raw_user_meta_data->>'account_role'
      WHEN 'institution' THEN 'institution'
      WHEN 'industry' THEN 'industry'
      ELSE 'user'
    END
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill accounts for users created before this migration.
INSERT INTO public.accounts (user_id, account_role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
