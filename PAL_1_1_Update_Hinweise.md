# PAL 1.1 · Update für den Test-Branch

## Was neu ist

PAL 1.1 baut auf dem isolierten **PAL-1.0-Preview-Update** auf (nicht auf der älteren 1.0-ZIP). Alle sechs bisherigen Änderungswünsche und die Trennung von Produktion und Vorschau bleiben erhalten.

**Bildoptimierung vor dem Upload:**
- Bilddateien bis einschließlich **1.000.000 Bytes (~1 MB)** bleiben unverändert, sofern bereits JPEG, PNG oder WebP.
- Größere Dateien werden im Browser auf **höchstens 1920 Pixel an der längsten Seite** verkleinert und mit **WebP-Qualität 0,85** codiert. Wenn das Ergebnis nicht kleiner wird, bleibt die unterstützte Originaldatei erhalten.
- Auch Profilbilder, Tagebuchbilder, Hochformat-Cover, Querformat-Header und App-Hintergründe nutzen diese Optimierung.
- Beim Zuschneiden entsteht ein komprimierter Ausschnitt (bevorzugt WebP in Qualität 0,85); die Vorschau bleibt bedienbar. Der bereits optimierte Zuschneide-Ursprung wird nicht nochmals codiert.
- Die Migration bereits in der Cloud vorhandener Data-URL-Bilder bleibt **bytegetreu**. Gesicherte Altbilder werden nicht stillschweigend verändert.
- Der Storage-Bucket erlaubt weiterhin bis **17.000.000 Bytes pro gespeicherter Datei**. Quellbilder bis 40 MB können vor dem Upload verkleinert werden; Bilder, deren *Ergebnis* die 17-MB-Grenze überschreitet, werden mit verständlicher Meldung abgewiesen.
- JPEG, PNG und WebP werden unterstützt. Andere Bildformate können nur dann übernommen werden, wenn der Browser sie lesen und nach WebP umwandeln kann. Animierte Grafiken werden nicht als Animation zugesichert.

## Nächste Schritte für diesen Stand

1. **Nur Branch `pal-1.0-test`:** Inhalt dieses ZIP-Pakets entpacken und Dateien/Ordner im Testbranch hochladen; mit Commit bestätigen. Die Produktiv-Version auf `main` bleibt unverändert.
2. **Keine neuen SQL-Befehle nötig**, sofern die beiden PAL-1.0-SQL-Skripte bereits erfolgreich ausgeführt wurden. Die Preview-Tabelle `public.pal_preview_sync_state` und der private Bucket `pal-preview-media` bleiben bestehen.
3. In Vercel unter `pal-app` prüfen: Die vier Variablen `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAL_ACCESS_CODE`, `PAL_SESSION_SECRET` müssen auch für die **Preview**-Umgebung gelten. **Geheimnisse nicht im Chat veröffentlichen.** Supabase-URL ohne `/rest/v1` verwenden. Es empfiehlt sich, für Preview getrennte PAL-Zugangsdaten zu setzen; die Supabase-Datenbank kann dieselbe bleiben, weil der Servercode bei `VERCEL_ENV=preview` automatisch die Preview-Tabelle und den Preview-Bucket verwendet.
4. Neu ausrollen lassen (automatisches Preview-Deployment nach Commit, ggf. Redeploy). Das neue Preview-Deployment in Vercel über **Visit** öffnen.
5. Bei erster Anmeldung eventuellen Datenstandsvergleich und die Übertragung vorhandener Fotos abschließen lassen. Im Preview nur Testeinträge anlegen. Bild unter 1 MB und Bild über 1 MB nacheinander testen, dann aus einem zweiten Browser den gleichen Preview-Stand lesen.
6. **Erst nach erfolgreicher Prüfung** über ein mögliches Update von `main` und damit der produktiven PAL-Adresse entscheiden. Vorher Backup behalten. Nicht Browserdaten löschen.

## Bewusste Grenzen

- Die Preview-Version ist technisch getrennt von der Produktiv-Version, hat aber ohne eigene Supabase-Instanz dieselbe Supabase-Projekt-Infrastruktur. Preview schreibt nur in `pal_preview_sync_state` und `pal-preview-media`, nicht in deren Produktions-Gegenstücke.
- Eine erfolgreiche browserseitige Testkonvertierung ist **kein** Ersatz für einen echten End-to-End-Test auf Vercel und Supabase oder für einen PWA-Test auf Android.
- Der gemeinsame Zugangscode ist keine individuelle Benutzerverwaltung. Die Sichtbarkeitsregeln der PAL-Oberfläche sind keine echte persönliche Zugriffstrennung.
- 1 MB ist ein **Optimierungs-Auslöser**, kein hartes Limit. Der Speicherwert von 17 MB pro Datei bleibt technisch bestehen.

## Bisherige sechs Wünsche

1. Supabase Storage für private Bilder und gesicherte Migration
2. Live-Projektvorschau
3. PWA-Installation
4. Getrenntes Hoch- und Querformat, Querformat auf Startseite
5. Aktualisierte Profilinformationen, kein Demo-Reset
6. Playful mit Comic Sans MS (wo installiert), freiem Ersatz und organischen Feldern bei gerader Schrift
