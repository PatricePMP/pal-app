-- PAL 1.0: getrennte Vercel-Preview-Daten und privater Test-Fotospeicher.
-- Verändert keine vorhandenen PAL-Produktivdaten. Die Sicherung pal_v10_backup bleibt erhalten.
-- Erst ausführen, bevor der Preview-Branch mit echten Datenbank-Zugangsdaten verbunden wird.
BEGIN;
CREATE TABLE IF NOT EXISTS public.pal_preview_sync_state (
  singleton_id smallint PRIMARY KEY DEFAULT 1 CHECK (singleton_id=1),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pal_preview_sync_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.pal_preview_sync_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pal_preview_sync_state TO service_role;
-- Testprojekte auf Basis des bereits bestätigten Produktiv-Backups (Revision 137).
-- Für wiederholtes Ausführen wird eine bestehende Vorschau nie überschrieben.
INSERT INTO public.pal_preview_sync_state(singleton_id,state,revision)
SELECT 1, state, 0 FROM public.pal_v10_backup WHERE id=1
ON CONFLICT (singleton_id) DO NOTHING;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('pal-preview-media','pal-preview-media',false,17000000,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=17000000,allowed_mime_types=EXCLUDED.allowed_mime_types;
COMMIT;
SELECT singleton_id,revision FROM public.pal_preview_sync_state;
SELECT id,public,file_size_limit FROM storage.buckets WHERE id='pal-preview-media';
