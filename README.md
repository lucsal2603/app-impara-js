# App per imparare JavaScript · prototipo della scena platform

Web app senza framework, Vite per lo sviluppo. Concept completo in `docs/CONCEPT.md`.

```bash
npm run dev        # http://localhost:8080  (anteprima alle misure dell'iPhone: /dev-iphone.html, oppure /dev-iphone.html?p=home.html per la home)
```

Cosa c'è nel prototipo:
- `src/motore/`: loop a 60 tick al secondo (`loop.js`), azioni (`azioni.js`), canvas con densità di pixel (`renderer.js`).
- `src/scene/platform/`: la scena vista di lato. `livello.js` legge la mappa a caratteri e la legenda; `index.js` muove il personaggio a tasselli (passo, salto che sale un gradino o supera una buca, gravità, urto), gestisce piastre a scatto, porte legate alle piastre o a una chiave, chiavi, uscita, spuntoni e morte, e disegna tutto con i PNG di `public/assets/scene/platform`.
- `src/interprete/index.js`: interprete provvisorio, solo chiamate a comandi una per riga, con errori in italiano e suggerimenti sui nomi. Sarà sostituito dal parser acorn con valutatore a generatori (M1) mantenendo la stessa interfaccia `compila(codice, api)`.
- `src/sfida/sessione.js`: stati pronto, esecuzione, passo, pausa, finito; collega editor, interprete e scena.
- Il livello ha il pulsante `?` che mostra gli aiuti uno alla volta.
- `src/ui/editor.js`: editor provvisorio (textarea con numeri di riga, riga in esecuzione evidenziata, palette dei comandi). CodeMirror arriva con M3.
- `content/it/c1/l1.json`: il livello di esempio nel formato del concept.
- `lezione.html`: la prima lezione, cioè il tutorial (`content/it/c1/l1.json`): schede di spiegazione, scelta multipla e completa il codice, poi il livello da giocare e la schermata finale con le stelle. `?scheda=N` salta alla scheda N. Il player è `src/ui/lezione.js`, le schede in `src/ui/schede/` (`codice.js` monta la scena in qualsiasi contenitore ed espone `onVittoria` con le stelle).
- `home.html`: anteprima statica della schermata iniziale con il video in loop della mascotte (`public/assets/home/`), titolo, percorso, livello consigliato e barra delle schede. Il pulsante porta al livello.

Per provare dal browser: `window.__app` espone scena, sessione, editor e loop.

Le risorse grafiche vengono da `/Users/lucas/mascotte-blender` (script rigenerabili): i pezzi in `tiles/`, gli sprite del personaggio in `sprites/` con `sprites.json`.
