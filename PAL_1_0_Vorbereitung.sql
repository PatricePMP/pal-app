-- PAL 1.0 · VOR DEM DEPLOYMENT ausführen.
-- Sicherung des aktuellen PAL-Cloud-Datenstands; PAM und Moxi bleiben unberührt.
BEGIN;
CREATE TABLE IF NOT EXISTS public.pal_v10_backup (
 id smallint PRIMARY KEY DEFAULT 1 CHECK (id=1),
 state jsonb NOT NULL,
 revision bigint NOT NULL,
 saved_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pal_v10_backup ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pal_v10_backup FROM anon, authenticated;
GRANT SELECT, INSERT ON public.pal_v10_backup TO service_role;
INSERT INTO public.pal_v10_backup(id,state,revision)
 SELECT 1,state,revision FROM public.pal_sync_state WHERE singleton_id=1
 ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 VALUES ('pal-private-media','pal-private-media',false,17000000,ARRAY['image/jpeg','image/png','image/webp'])
 ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=17000000,allowed_mime_types=EXCLUDED.allowed_mime_types;
COMMIT;
SELECT id,revision,saved_at FROM public.pal_v10_backup;
SELECT id,public,file_size_limit FROM storage.buckets WHERE id='pal-private-media';
