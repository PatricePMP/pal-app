# PAL 1.1 ♡ · Patrick & Albert

**Erster installierbarer Web-App-Release auf Basis des originalen GitHub-Standes PAL 0.8.** Die vorhandenen API-Routen, eure Anmeldung und die gemeinsame Cloud-Datentabelle `public.pal_sync_state` bleiben erhalten.

## ⚠️ Unbedingt zuerst lesen

- **Dieses Paket wurde nicht auf eure produktive Vercel-/Supabase-Umgebung ausgerollt oder dort getestet.** Es enthält Code, SQL und lokale automatisierte Funktionstests. Die abschließende Kontrolle auf euren Geräten steht aus.
- **Vor dem Upload unbedingt `PAL_1_0_Vorbereitung.sql` im RICHTIGEN Supabase-Projekt `PatricePMP's Project` ausführen.** Es legt eine einmalige Sicherung des Cloud-Stands an und richtet ausschließlich den privaten PAL-Medien-Bucket ein. Es löscht keine PAL-/PAM-Daten.
- Wenn auf einem eurer Geräte bislang **„Nicht synchronisiert“** stand, zuerst die Informationen bzw. ein Backup dieses Geräts sichern. Die neue Version erkennt beim ersten Laden Abweichungen zum Cloud-Stand und lässt euch wählen, ob ihr fehlende lokale Daten ergänzen wollt.
- **Niemals `SUPABASE_SERVICE_ROLE_KEY`, `PAL_SESSION_SECRET` oder `PAL_ACCESS_CODE` in GitHub-Dateien schreiben.** Die vier Vercel-Umgebungsvariablen bleiben bestehen.
- Für die tatsächliche Online-Freigabe und eine Wiederherstellung müssen die bisherigen Backups nach erfolgreicher Migration erhalten bleiben. Ohne verifiziertes Backup vorab kein produktiver Wechsel.

## Installation in drei Phasen

### Phase A: Datenbank vorbereiten
1. Supabase > Projekt **PatricePMP's Project** > **SQL Editor** öffnen.
2. Die komplette Datei **`PAL_1_0_Vorbereitung.sql`** einfügen und **Run** drücken.
3. Das Ergebnis muss eine Zeile in `public.pal_v10_backup` und den privaten Bucket `pal-private-media` zeigen.
4. Die bisherigen PAL-Tabellen und das bisherige SQL-Skript **nicht** neu anlegen oder zurücksetzen.

### Phase B: Code testen und veröffentlichen
1. Ein vollständiges ZIP-Backup des bisherigen GitHub-Repositories **PAL 0.8** behalten.
2. Die **Inhalte** dieses PAL-1.1-Pakets an die entsprechenden Stellen im vorhandenen GitHub-Repository `PatricePMP/pal-app` hochladen (nicht die ZIP als einzelne Datei). `api/media.js`, `pal-media.js`, `pal-v10.css`, `manifest.webmanifest` und der Ordner `icons/` sind neu. Andere gleichnamige Dateien werden aktualisiert.
3. Wenn möglich erst mit einer **Preview-Deployment-Adresse** testen. Nicht gleichzeitig Änderungen auf mehreren Geräten vornehmen.
4. Vercel muss das neue Deployment erfolgreich mit Status **Ready** veröffentlichen. Die bestehenden Production-Umgebungsvariablen sind:
   - `SUPABASE_URL` (nur Root-Adresse `https://<projekt>.supabase.co`, **ohne** `/rest/v1`)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PAL_ACCESS_CODE`
   - `PAL_SESSION_SECRET`
5. Erst nach Tests auf dem produktiven `https://pal-app-mu.vercel.app` veröffentlichen. Für Preview-URLs kann eine extra Preview-Umgebung mit eigenen Variablen nötig sein; Preview gegen Produktionsdaten ist **kein isolierter Test**.

### Phase C: Erste Anmeldung und Datenmigration
1. **Zunächst nur auf einem Gerät** PAL 1.1 öffnen. Kein anderes Gerät soll parallel schreiben.
2. Vor dem Öffnen noch bestehende lokale Bildstände/Gerätedaten sichern, soweit möglich. Auf allen Geräten die alten Browser-Daten **nicht löschen**.
3. PAL legt vor der Umstellung eine IndexedDB-Sicherung des initialen Cloud- und Geräte-Stands an. Stimmen Gerät und Cloud nicht überein, erscheint ein Auswahlfenster. `Cloud-Stand verwenden` lässt den lokalen Stand in der Sicherung; `Fehlende lokale Daten ergänzen` führt neue Einträge zusammen und verwendet bei Projekten den neueren Änderungszeitstempel. Unklare Konflikte werden **nicht still überschrieben** und werden gesichert bzw. für Erinnerungen als lokale Fassung bewahrt.
4. Bestehende Data-URL-Bilder werden vor dem Cloud-Commit in den privaten Supabase-Storage-Bucket übertragen. Der Upload ist anhand des Bildhashes bei Abbruch wiederaufnehmbar. Bei einem Fehler bleibt die bisherige Datenbank-Revision bestehen; Vorgang nach Beseitigung der Ursache erneut probieren.
5. App starten, **Projekte, Tagebuch, Profilfotos, Hoch-/Querformatbilder, Zeitguthaben** kontrollieren. Zur Prüfung über **Profil > Sicherung herunterladen** aktuelle und ursprüngliche JSON-Stände exportieren.
6. Auf einem zweiten Gerät anmelden und kontrollieren, dass Inhalte und neue Fotos sichtbar sind. Danach die Installation über **Chrome > ⋮ > App installieren** prüfen. Gegebenenfalls einmal neu laden; der Browser kann eine kurze Interaktion verlangen.

## Enthaltene sechs Änderungswünsche und Optimierung

1. **Bilder getrennt in Supabase Storage:** private Bilddateien, nur `pal-media://…`-Referenzen im JSON; bestehende eingebettete Bilder werden mit Backups migriert. Text-/Metadaten-JSON bleibt aus Sicherheitsgründen auf 3,5 MB begrenzt, aber Bilddateien werden nicht darin gespeichert.
2. **Live-Projektvorschau:** Formulare für neue und vorhandene Projekte zeigen sofort Designstil, Schriftmodus, Farbe, Hochformat-Cover, Querformat-Hintergrund, Abdunklung und Unschärfe. Vorschau speichert erst beim Absenden.
3. **PWA:** Manifest, App-Icons mit 192/512 px sowie Maskable-Icon, Standalone-Start. **Kein Service Worker:** Ohne Netz bleibt die gemeinsame Cloud gesperrt. Eine Offline-Fähigkeit wird nicht behauptet.
4. **Hoch- und Querformat unabhängig:** Bibliothek nutzt weiter `coverImage`, Startseitenkarte und Detail-Header verwenden `backgroundImage`, bei fehlendem Querformat ein neutral gestaltetes Ersatzbild.
5. **Veraltete Demohinweise entfernt:** echter Cloud-Status, korrekter gemeinsamer Zugangscode, Backup-Export, kein gefährlicher Testdaten-Reset.
6. **Playful:** echte **Comic Sans MS**, **wenn lokal auf dem Gerät installiert**, sonst die freie **Comic Neue** (Google Fonts), organische ruhige Ecken und gerade, nicht verzerrte Schrift. Es werden keine proprietären Schriftdateien verteilt.

## Sicherheit und technische Grenzen

- Der **gemeinsame Zugangscode** schützt PAL vor gewöhnlichem unberechtigtem Zugriff, bietet aber **keine getrennten privaten Accounts** für Patrick und Albert. Das interne `owner`-/`visibility`-Modell ist weiterhin eine UI-Trennung, **keine echte Zugriffssicherung** pro Person.
- Supabase-Service-Role-Zugriff findet ausschließlich in Serverrouten statt. Bilder liegen in einem **privaten** Bucket; der Upload nutzt kurzlebige signierte URLs, der Abruf geschieht über eine auf Login-Cookie überprüfte `/api/media`-Route. Keine Supabase-Schlüssel im Browser.
- Die SQL-Datei erstellt das einmalige Backup `public.pal_v10_backup` (vor Migration), ohne Datensätze aus anderen Tabellen zu verändern. Backups in IndexedDB liegen jeweils nur auf dem betreffenden Gerät. Beim Löschen der Browserdaten gehen diese Geräte-Backups verloren; deshalb exportieren.
- Vorhandene, zeitgleich geänderte Daten sind nicht vollständig automatisch zusammenführbar. PAL 1.1 sichert solche Fälle und fragt bei Abweichungen nach. Individuelle Benutzeranmeldung, Berechtigungsprüfung pro Profil, automatische Bucket-Bereinigung und ein vollständiger Transaktionsabgleich wären eigenständige weitere Entwicklungsschritte.
- Der Bucket erlaubt JPEG/PNG/WebP bis 17 MB pro Datei. **Neu ab PAL 1.1:** Dateien bis 1 MB bleiben unverändert; größere Dateien werden vor dem Upload im Browser auf maximal 1920 Pixel und möglichst kleineres WebP (Qualität 85 %) optimiert. Bestehende Bilder werden bei der Migration unverändert übernommen. Die Zuschneidefunktion bleibt erhalten.
- Eine tatsächliche Verifikation des Android-Installationsdialogs, des Foto-Croppings und der Supabase-Storage-Integration ist erst nach Deployment möglich. **Bis dahin ist dies ein fertig vorbereitetes Test-/Release-Paket, keine bestätigte produktive Freigabe.**

## Enthaltene Dateien

| Datei | Aufgabe |
|---|---|
| `PAL_1_0_Vorbereitung.sql` | Einmaliges Cloud-Backup und privater Storage-Bucket |
| `api/media.js` | Geschützte Ausgabe und signierte Upload-URLs für Bilddateien |
| `pal-media.js` | Browser-Uploads, Medienmigration, Geräte-Backups |
| `pal-sync.js` | Cloud-Synchronisierung, Vergleich lokaler Stände, Migration und Konflikte |
| `app.js` | Projektgestaltung, Bildverweise, verlässlicher Status, neue Medien-Uploads |
| `pal-v10.css` | Playful-Schrift/Konturen und Live-Projektvorschau |
| `manifest.webmanifest`, `icons/` | Installierbare Web-App |
| Übrige Dateien | PAL-0.8-Funktionen und bestehende Layouts |

## Lokale automatisierte Tests (kein Ersatz für Produktivtest)

Die Entwicklungsversion wurde mit Node.js-Syntaxprüfung und zwei isolierten Smoke-Tests geprüft: getrennte Bilder/Rendern von Home, Detail und Timeline; Profilstatus; Live-Vorschau; idempotente Medienübertragung; Login-Pflicht, Origin-/Pfadprüfung und private Medienausgabe im API-Mock. **Ein echter End-to-End-Test gegen Supabase/Vercel und ein Test im Android-Chrome waren in der Entwicklungsumgebung nicht möglich.**

## PAL 1.1: sicherer Preview-Branch

Das ZIP enthält die zuvor erstellte **sichere Preview-Trennung**. Bei `VERCEL_ENV=preview` werden `pal_preview_sync_state` und `pal-preview-media` verwendet. Siehe `PAL_1_1_Update_Hinweise.md` für die sichere Testreihenfolge und die nötigen Vercel-Variablen. Die beiden mitgelieferten PAL-1.0-SQL-Dateien müssen **nicht erneut** ausgeführt werden, wenn ihr Ergebnis bereits bestätigt wurde.
