# PAL 0.8 – Cloud-Synchronisierung (Einrichtung erforderlich)

Diese Version baut auf PAL 0.7 auf. HTML/CSS-Design und Funktionen bleiben erhalten. Die Cloud-Anbindung ist **noch nicht produktiv getestet**, weil sie eure echten Vercel- und Supabase-Zugangsdaten erfordert.

## Was funktioniert und was nicht

- Gemeinsamer Datenstand für Projekte, Tagebuch, Zeiterfassung, Timer, Profile, Farben und eingebettete Bilder.
- Änderungen werden nach ca. 350 ms gesendet und das andere Gerät fragt alle 5 Sekunden nach Updates, solange die Seite geöffnet ist.
- **Kein echtes Live-Realtime**, keine Offline-Bearbeitung. Bei Netzfehlern erscheint eine Warnung und es wird erneut versucht. Gleichzeitig widersprüchliche Änderungen werden **nicht automatisch zusammengeführt**; stattdessen erscheint ein Konfliktdialog und eine lokale Sicherheitskopie (Browser `localStorage` unter `pal_cloud_conflict_backup`).
- **Gemeinsamer Zugangscode, keine getrennte Authentifizierung von Patrick und Albert.** Jede Person mit dem Code kann in der App zwischen Profilen wechseln und auch als „privat“ markierte Daten im übertragenen gemeinsamen Zustand technisch auslesen. Die Anzeige filtert nur in der Benutzeroberfläche. **Für tatsächlich vertrauliche private Projekte und serverseitige Rollenrechte ist später eine individuelle Authentifizierung und echte Datentrennung nötig.**
- **Speichergrenze: 3,5 MB für den gesamten gemeinsamen JSON-Datenstand**, inklusive Bilder. Für eine umfangreiche Fotobibliothek brauchen wir Supabase Storage und ein anderes Synchronisierungsmodell.
- Die sechs PAL-Tabellen aus Schritt 1 bleiben erhalten, werden von dieser **Übergangsversion** aber nicht verwendet. Die Cloud-Version verwendet eine **siebte Tabelle** `pal_sync_state`, um den bestehenden 0.7-Code möglichst wenig zu verändern. Später sollte eine vollständige Migration auf die sechs relationalen Tabellen erfolgen.

## Schritt 1 – SQL in Supabase ausführen

Im **gleichen Supabase-Projekt wie PAM** den Inhalt von `PAL_Supabase_Schritt_2.sql` in den SQL Editor kopieren und auf Run klicken. Es wird nur `pal_sync_state` angelegt. PAM-Daten werden nicht verändert.

## Schritt 2 – Dateien in GitHub ersetzen/ergänzen

Die **gesamten Dateien und Ordner** aus diesem Archiv ins Repository `pal-app` hochladen. Die bisherigen CSS-Dateien bleiben, neue Dateien sind `pal-sync.js`, `api/auth.js`, `api/state.js`, `api/logout.js`, `lib/pal-server.js`.

**Achtung:** GitHubs normaler Datei-Upload über die Weboberfläche lädt Ordnerstrukturen nicht zuverlässig hoch. Kontrolliere, dass `api` und `lib` als **Ordner mit Dateien** im Repository existieren, oder nutze Git am PC. `PAL_Supabase_Schritt_2.sql` darf im Repo bleiben, enthält aber keine Zugangsdaten.

## Schritt 3 – Vercel Environment Variables

Vercel → Projekt `pal-app` → Settings → Environment Variables; diese vier Variablen (Environment: Production) ergänzen:

- `SUPABASE_URL`: Project URL **des bestehenden PAM-Supabase-Projekts** (z. B. `https://<projekt>.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY`: **Legacy `service_role` JWT** aus Supabase → Project Settings → API Keys. **Nur in Vercel als Environment Variable verwenden, niemals in JavaScript, GitHub oder im Chat teilen.** Dieser Schlüssel kann PAM-Daten lesen und ändern; die PAL-API beschränkt ihre Datenbankabfragen im Code auf `pal_sync_state`.
- `PAL_ACCESS_CODE`: eigenen **langen, zufälligen, gemeinsamen Zugangscode** mit mindestens 20 Zeichen wählen. Diesen Code verwenden Patrick und Albert im PAL-Anmeldefenster. Nicht mit einem anderen App-Code wiederverwenden.
- `PAL_SESSION_SECRET`: **weiteren unabhängigen langen Zufallswert**, mindestens 32 Zeichen, für Cookie-Signaturen. Diesen Wert nicht als Zugangscode verwenden.

Variablen nur auf dem Server verwenden. Danach auf Vercel **Redeploy** ausführen, damit die Variablen für die Serverless-Funktionen gelten. Keine Werte mit Präfix `NEXT_PUBLIC_` oder `VITE_` verwenden.

## Schritt 4 – Prüfung

1. PAL-Adresse im privaten Browserfenster öffnen → Eingabemaske für den gemeinsamen Zugangscode.
2. Mit dem `PAL_ACCESS_CODE` anmelden. Es sollten **keine Demo-Projekte** erscheinen.
3. Auf Gerät A ein kleines gemeinsames Projekt anlegen. Auf Gerät B anmelden und einige Sekunden später sehen, ob es erscheint.
4. Eine kleine Zeitbuchung anlegen und auf dem zweiten Gerät prüfen; dann Timer starten und auf zweitem Gerät kontrollieren.
5. Test mit parallelen Änderungen (Konflikthinweis beachten). Erst danach produktiv verwenden.

## Sicherheit und Betrieb

Die Anmeldung nutzt ein signiertes `HttpOnly`-Cookie (30 Tage; `Secure`, `SameSite=Lax`). Der Vercel-Server prüft den gemeinsamen Code; die DB-Schlüssel bleiben serverseitig. Für eine öffentlich erreichbare App sind zusätzlich Rate-Limits und eine echte individuelle Benutzeranmeldung empfehlenswert. **Die App ist mit diesem gemeinsamen Code nicht für private Informationen zwischen Patrick und Albert geeignet.** PAM und PAL teilen weiterhin eine Supabase-Instanz, daher sind die Schlüssel besonders sorgfältig aufzubewahren.

Bei Problemen zuerst auf Vercel in den Function Logs nach Fehlern suchen. Ohne die SQL-Tabelle oder Environment Variables **bleibt PAL bewusst gesperrt**, statt auf lokalen Speicher zurückzufallen.
