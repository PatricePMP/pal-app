-- PAL 0.8: Übergangs-Synchronisierung der bestehenden 0.7-App.
-- Zusätzliche Tabelle. Die sechs bestehenden pal_-Tabellen und PAM bleiben unberührt.
-- Ein gemeinsamer JSON-Datenstand, versioniert und geschützt. Keine Browser-DB-Rechte.
BEGIN;
CREATE TABLE IF NOT EXISTS public.pal_sync_state (
  singleton_id smallint PRIMARY KEY DEFAULT 1 CHECK (singleton_id = 1),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pal_sync_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.pal_sync_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pal_sync_state TO service_role;
INSERT INTO public.pal_sync_state(singleton_id,state,revision)
VALUES (1,'{}'::jsonb,0)
ON CONFLICT (singleton_id) DO NOTHING;
COMMIT;
SELECT singleton_id,revision FROM public.pal_sync_state WHERE singleton_id=1;
