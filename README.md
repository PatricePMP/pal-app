# PAL · Patrick & Albert · Testversion 0.7

Eine mobile, lokale Vorschau eurer Erlebnisbibliothek mit Zeitguthaben, Projekten, Tagebuch und Zeitreise.

## App starten

- **`PAL_Testversion_v07.html`**: einzelne, eigenständig nutzbare HTML-Datei, die du im Browser öffnen kannst.
- **`index.html` + CSS + `app.js`**: dieselbe App als Projektordner für GitHub und Vercel.
- Das HTML-Projekt benötigt keinen Build-Schritt. Auf Vercel kann es als statische Website bereitgestellt werden.

## Änderungen in 0.7

1. Eine auf der Home-Seite geöffnete Projektkarte lässt sich durch Tippen außerhalb der Karte, erneutes Tippen auf das Cover oder Öffnen einer anderen Karte schließen (auch Escape auf Desktop).
2. Playful: dezente, leicht variierende Kartenrundungen bei Seitenwechseln; die bisherigen Cinematic-artigen Serifentitel sind nun bei Playful. Die Bildflächen sind gemeinsam mit ihren Karten beschnitten.
3. Cinematic: Bodoni Moda für Überschriften und Projekttitel, Buttons und Fließtext bleiben serifenlos. Die Schrift wird online von Google Fonts geladen, offline greift eine Serifenschrift als Ersatz.
4. Neon respektiert nun die gewählte App-Farbe, auch helle Farben. Akzente bleiben separat einstellbar.
5. Profilfotos haben einen quadratischen Container mit exakt runder Maske und füllen ihn ohne Lücken aus.
6. Bildausschnitt-Editor für Profilbild, Projektcover, Projekthintergrund und App-Hintergrund mit Ziehen, Zoom-Regler, Zwei-Finger-Zoom und späterer Neubearbeitung.
7. Bestehende Funktionen aus Version 0.6 bleiben erhalten, einschließlich Timer und Zeitguthaben.

## Bildeditor – Details

Beim Speichern wird zusätzlich zum gewählten Ausschnitt ein **komprimiertes, unbeschnittenes Ausgangsbild** samt Bildposition und Zoom im lokalen Speicher behalten. So kann man den Ausschnitt nachträglich ändern. Die ursprüngliche Bilddatei in voller Auflösung wird **nicht** aufbewahrt. Für viele Fotos ist der Speicher dieser Testversion begrenzt.

## Wichtige Einschränkungen der Testversion

- **Keine Cloud-Synchronisierung**: Änderungen werden mit `localStorage` nur in diesem Browser bzw. unter dieser Datei-/Website-Adresse gespeichert. Bei einer anderen Datei-URL oder auf einem zweiten Gerät sind sie nicht automatisch verfügbar.
- **Kein echter Zugriffsschutz**: Die Profilauswahl ist eine Vorschau und keine sichere Trennung privater Daten.
- Ein laufender Timer wird über gespeicherte Zeitstempel wiederhergestellt; lokale Browser-Daten dürfen nicht gelöscht werden.
- Diese Version ist noch keine gemeinsame produktive App. Vor der parallelen Nutzung auf euren Handys brauchen wir eine Datenbank, geräteübergreifende Synchronisierung und passende serverseitige Zugriffsregeln.
- Nicht die komplette App zurücksetzen, wenn du eigene Testdaten behalten möchtest.

## Technische Grundlage

Statische HTML-, CSS- und JavaScript-App, kein npm / kein Framework nötig. Zum Veröffentlichen reichen alle Quelldateien aus dem ZIP-Archiv im Wurzelverzeichnis eines GitHub-Repositories. Vercel erkennt die `index.html` als Startdatei.
