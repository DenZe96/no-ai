# No AI – Google-Suche ohne KI

Blendet in der Google-Suche automatisch die **KI-Übersicht** („AI Overview“ / „Übersicht mit KI“) und den **KI-Modus** aus. Funktioniert in **Safari** (macOS, iPhone und iPad), Chrome, Edge und Firefox.

Es gibt zwei Varianten:

| Variante | Ordner | Vorteil | Nachteil |
|---|---|---|---|
| **Safari-Erweiterung** | [`extension/`](extension) | Eigenes Symbol in der Leiste, Einstellung per Klick | Braucht einmalig einen Mac mit Xcode |
| **Userscript** | [`userscript/`](userscript) | Kein Xcode nötig, auch direkt auf dem iPhone | Einstellung nur im Code |

## Modi (Erweiterung)

Ein Klick auf das Symbol öffnet die Einstellungen:

- **KI ausblenden** (Standard): versteckt die KI-Übersicht und den Tab „KI-Modus“. Alles andere (Bilder, Karten, Infoboxen) bleibt.
- **Nur Web-Ergebnisse**: leitet jede normale Suche auf Googles Tab „Web“ um (`udm=14`). Dort zeigt Google garantiert keine KI an – aber auch keine Bilder-/Kartenboxen. Andere Tabs (Bilder, News, …) bleiben unberührt.
- **Aus**: Google wie gewohnt.

---

## Variante 1: Safari-Erweiterung installieren

Apple erlaubt Safari-Erweiterungen nur als (kleine) App. Die Umwandlung macht Xcode automatisch:

1. **Xcode** aus dem Mac App Store installieren (kostenlos) und einmal öffnen.
2. Dieses Repository herunterladen und im Terminal in den Ordner wechseln.
3. Projekt erzeugen:
   ```sh
   xcrun safari-web-extension-converter extension \
     --app-name "No AI" \
     --bundle-identifier de.denze96.noai \
     --swift --copy-resources
   ```
   Für nur macOS kann zusätzlich `--macos-only` angegeben werden, für nur iOS `--ios-only`.
4. Xcode öffnet sich. Oben das Ziel **„No AI (macOS)“** wählen und auf **▶ Run** klicken.
5. In Safari:
   - **Safari → Einstellungen → Erweitert →** „Funktionen für Webentwickler anzeigen“ aktivieren.
   - **Entwickler → Nicht signierte Erweiterungen erlauben** anklicken (muss nach jedem Safari-Neustart wiederholt werden, solange die App nicht mit einem Apple-Developer-Account signiert ist).
   - **Safari → Einstellungen → Erweiterungen →** „No AI“ aktivieren.
   - Beim ersten Google-Besuch auf das Symbol klicken und **„Auf dieser Website immer erlauben“** wählen.

**Dauerhaft ohne „Nicht signierte Erweiterungen erlauben“:** In Xcode unter *Signing & Capabilities* deine Apple-ID als Team eintragen und erneut bauen.

**iPhone/iPad:** In Xcode das Ziel **„No AI (iOS)“** wählen, das iPhone per Kabel verbinden und auf ▶ klicken (kostenlose Apple-ID reicht, die App läuft dann 7 Tage und muss danach neu installiert werden). Danach: **Einstellungen → Apps → Safari → Erweiterungen → No AI** aktivieren und Zugriff auf google.com/google.de erlauben.

### Chrome / Edge / Firefox

- **Chrome/Edge:** `chrome://extensions` öffnen → „Entwicklermodus“ an → „Entpackte Erweiterung laden“ → Ordner `extension` wählen.
- **Firefox:** `about:debugging#/runtime/this-firefox` → „Temporäres Add-on laden“ → `extension/manifest.json` wählen.

---

## Variante 2: Userscript (ohne Xcode, auch iPhone)

1. Die kostenlose App **[Userscripts](https://apps.apple.com/app/userscripts/id1463298887)** aus dem App Store installieren (Mac oder iPhone/iPad).
2. In der App einen Ordner für Skripte festlegen und die Datei [`userscript/no-ai.user.js`](userscript/no-ai.user.js) dort hineinlegen (oder in Safari öffnen und über das Userscripts-Symbol installieren).
3. Erweiterung aktivieren:
   - **Mac:** Safari → Einstellungen → Erweiterungen → „Userscripts“ an.
   - **iPhone:** Einstellungen → Apps → Safari → Erweiterungen → „Userscripts“ an, Zugriff auf Google erlauben.

Wer lieber immer den KI-freien „Web“-Tab möchte, setzt im Skript `const WEB_ONLY = true;`.

---

## Wie es funktioniert

- Die KI-Übersicht wird an ihrer Überschrift erkannt (Deutsch, Englisch und weitere Sprachen) und der dazugehörige Block ausgeblendet – ohne normale Suchergebnisse zu treffen. Ein `MutationObserver` erwischt auch nachgeladene Boxen.
- Der KI-Modus wird über seine Links (`udm=50`) ausgeblendet.
- Die Erweiterung braucht nur die Berechtigung `storage` und läuft ausschließlich auf Google-Suchseiten. Es werden keine Daten gesammelt oder versendet.

Google ändert sein Seitenlayout gelegentlich. Falls die KI-Übersicht wieder auftaucht, hilft der Modus **„Nur Web-Ergebnisse“** immer – und gerne ein Issue aufmachen.

Weitere Google-Länderseiten lassen sich in `extension/manifest.json` (bzw. per `@match` im Userscript) ergänzen.
