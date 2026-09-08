# App per imparare JavaScript · concept e architettura

Aggiornato l'8 settembre 2026. Nome dell'app ancora da scegliere. Questo documento sostituisce i concept precedenti (gioco detective e TIME LOOP). Il mockup di TIME LOOP resta in `/Users/lucas/timeloop/docs/riferimento-mockup.png` come riferimento visivo per il personaggio e le scene. Il piano su strumenti, Capacitor, TestFlight e pubblicazione in `piano-gioco-detective-js.md` resta valido così com'è.

## In una frase

Un corso di JavaScript a schede brevi, nello stile di Mimo, in cui ogni lezione finisce con una mini-sfida: una piccola scena animata dove il codice scritto dall'utente fa succedere qualcosa sullo schermo.

## Per chi

Due pubblici in una sola app:

- **I curiosi**: non hanno mai scritto una riga di codice. Percorso guidato, passi minuscoli, i primi esercizi si fanno toccando parole invece di scrivere.
- **Chi sa già programmare**: può saltare un capitolo superando un test di ingresso, e ha una sezione **Palestra** con sfide a difficoltà crescente, test nascosti e stelle per le soluzioni più corte o più eleganti.

Le stesse lezioni e le stesse scene servono a entrambi. Cambia solo la quantità di guida.

## La sensazione da proteggere

"Leggo una scheda di trenta secondi, provo subito, vedo il mio codice muovere qualcosa sullo schermo, capisco perché quel concetto esiste."

Tutto il resto (streak, punti, badge) è di contorno e va tenuto leggero.

## Principi di design

- Ogni concetto nasce da un problema nella scena, non da una definizione. Prima il robot deve fare cinque passi e li scrivo uno a uno, poi arriva "Funziona. Ma possiamo farlo meglio." e compare il ciclo.
- Mai più di due schede di teoria di fila senza provare qualcosa.
- Un errore non è mai una punizione: messaggi in italiano semplice, aiuti a tre livelli, nessuna vita da perdere, nessun timer.
- Il codice è JavaScript vero con sintassi standard. Niente dialetti, niente blocchi visuali: i pulsanti inseriscono testo vero nell'editor.
- Sul telefono si scrive poco: soluzioni da una a otto righe, palette di simboli sopra la tastiera, token da toccare nelle prime lezioni.
- Chi sa già non deve annoiarsi: salto capitolo, Palestra, obiettivi di stile.
- I nomi delle funzioni delle scene sono in inglese, come nel JavaScript vero: `forward()`, `turnLeft()`, `water(plant)`. Le spiegazioni sono nella lingua dell'utente. Così il codice resta identico nella versione italiana e in quella inglese, e chi impara legge poi la documentazione vera senza spaesarsi.

## Struttura dei contenuti

Gerarchia: **Capitolo → Lezione → Schede → Mini-sfida finale**.

Una lezione dura da tre a cinque minuti e ha da cinque a nove schede. L'ultima scheda è sempre una mini-sfida nella scena.

Tipi di scheda della prima versione:

| Tipo | Cosa fa | Quando si usa |
|---|---|---|
| Spiegazione | testo breve con un esempio che si può eseguire con un tocco | per introdurre un concetto |
| Scelta multipla | domanda con tre o quattro risposte | per verificare la lettura |
| Completa il codice | codice con buchi, si toccano i token giusti | per i principianti, senza tastiera |
| Scrivi il codice | editor vero e scena animata, con verifica automatica | mini-sfida di fine lezione, Palestra |

Da aggiungere più avanti: riordina le righe, trova l'errore.

Curriculum proposto, solo JavaScript:

| Capitolo | Concetti | Scena principale |
|---|---|---|
| Primi comandi | chiamare funzioni, argomenti, stringhe e numeri, `console.log` | Robot |
| Variabili | `let`, `const`, aritmetica, template string | Robot, Luci |
| Decisioni | `if`, `else`, confronti, booleani, `&&`, `\|\|` | Luci |
| Ripetizioni | `for`, `while`, `break` | Robot |
| Funzioni | dichiarare, parametri, `return`, arrow function | Tela |
| Array | creare, indice, `length`, `push`, `for of`, `includes` | Serra |
| Metodi degli array | `map`, `filter`, `find`, `reduce` | Serra, Negozio |
| Oggetti | proprietà, metodi, oggetti dentro array | Negozio |
| Stringhe e numeri | metodi utili, `Math`, conversioni | Luci, Tela |
| Tempo ed eventi | `setTimeout`, callback, `async` e `await` | Razzo |
| Mini progetti | programmi completi che uniscono tutto | tutte |

I capitoli da Primi comandi a Decisioni sono gratuiti. Chi sa già programmare troverà i primi capitoli banali: il test di ingresso di ogni capitolo è una sfida della Palestra che, se superata, segna il capitolo come completato.

## Le scene, cioè le mini-sfide

Una scena è un piccolo mondo disegnato su canvas con:

- un'**API** esposta al codice dell'utente, poche funzioni e qualche oggetto di sola lettura;
- un **motore** che trasforma ogni chiamata in un'azione animata;
- un **obiettivo** verificabile: stato finale del mondo, oppure test nascosti sui valori restituiti;
- **obiettivi di stile** opzionali per le stelle: massimo di righe, uso obbligatorio di un costrutto, nessuna ripetizione.

Sei famiglie di scene bastano per tutto il corso. Ogni famiglia si riusa in decine di sfide cambiando mappa, oggetti e obiettivo.

| Scena | API di esempio | Cosa insegna |
|---|---|---|
| Robot in griglia | `forward()`, `turnLeft()`, `turnRight()`, `pickUp()`, `robot.sees('wall')` | sequenze, cicli, funzioni, condizioni sui sensori |
| Laboratorio luci | `turnOn('red')`, `turnOff('red')`, `sensor.dark`, `sensor.temperature` | `if`/`else`, booleani, operatori logici, numeri |
| Serra | `plants` array, `water(plant)`, `plant.dry`, `plant.height` | array, `for of`, `filter`, `map`, oggetti |
| Negozio | `cart`, `products`, `addToCart(p)`, `total()` | oggetti, `reduce`, stringhe, `Math` |
| Tela | `line()`, `circle()`, `color()`, `moveTo()` | funzioni con parametri, ricorsione leggera, creatività |
| Razzo | `countdown`, `launch()`, `after(seconds, fn)` | `while`, tempo, callback, `async` |

Il personaggio del robot può essere l'omino col cappuccio del mockup di TIME LOOP.

Come gira una mini-sfida:

```
codice dell'utente
      ↓
parser + validatore (solo i costrutti sbloccati fino a quel capitolo)
      ↓
interprete a passi: ogni chiamata all'API produce un'azione
      ↓
motore della scena: esegue l'azione in N tick, con animazione
      ↓
verifica dell'obiettivo + stelle
```

Durante l'esecuzione la riga corrente è evidenziata nell'editor, e i pulsanti Esegui, Passo e Ricomincia controllano il flusso. `forward()` non teletrasporta il robot: mette in coda un'azione che il motore anima in mezzo secondo.

Verifica:

- **Stato finale** per le scene: il robot è sulla cella obiettivo, tutte le piante secche sono state innaffiate, la luce rossa è accesa e la verde spenta.
- **Test nascosti** per le sfide su funzioni: `somma(2, 3)` deve restituire 5, poi altri casi non mostrati.
- **Stile** letto dall'albero sintattico: "usa un ciclo `for`", "massimo sei righe", "nessuna chiamata ripetuta più di due volte di fila".

Stelle: la prima per aver completato, le altre due per gli obiettivi di stile. Il principiante passa sempre con la prima, e l'app lo invita a tornare per le altre.

## Architettura tecnica

Scelte, con il perché:

- **Web app in HTML/CSS/JS senza framework**, build con Vite, animazioni di interfaccia con GSAP. È il tuo stack, e Vite serve solo per impacchettare CodeMirror e acorn.
- **Capacitor** per l'app iOS, salvataggi con il plugin Preferences. Il piano di pubblicazione è quello già scritto.
- **Interprete proprio** basato su acorn per il parsing e un valutatore a generatori per l'esecuzione. Serve per il passo passo, la riga evidenziata, il limite alle istruzioni, i messaggi comprensibili e la lista bianca dei costrutti per capitolo. Nessun `eval`, nessuna `Function`.
- **Scene su Canvas 2D** con un motore a passo fisso di 60 tick al secondo. Le scene sono piccole, non serve Phaser né PixiJS.
- **Simulazione senza DOM**: interprete e scene girano anche in Node, così le sfide si verificano con test automatici e ogni soluzione ufficiale viene provata prima di pubblicare.
- **Contenuti come dati**: lezioni e sfide sono file JSON, con testi in italiano e inglese. Aggiungere una lezione non richiede toccare il codice.
- **Tutto offline, nessun backend** nella prima versione. Un eventuale sync tra dispositivi o classifica arriva dopo, con Supabase.

Moduli e dipendenze:

```
ui (schermate, player delle schede, editor)
  ↓ usa
lezioni (caricamento contenuti, stato della lezione, verifica delle schede)
  ↓ usa
sfida (collega editor, interprete, scena e verifica)
  ↓ usa
interprete ← acorn          scene (robot, luci, serra, negozio, tela, razzo)
  ↓                           ↓
motore (tick, azioni, animazioni, renderer canvas)

progressi (XP, streak, stelle, salvataggio) è usato da ui e lezioni
i18n è usato da tutti
```

Flusso di una scheda "Scrivi il codice":

1. La scheda dichiara scena, configurazione, API disponibili, costrutti ammessi, obiettivo, stelle e aiuti.
2. La scena viene costruita e disegnata nel canvas in alto. L'editor in basso mostra il codice di partenza.
3. Esegui: il codice viene parsato e validato. Se c'è un errore, compare sotto l'editor con la riga, e la scena non parte.
4. Il motore chiede all'interprete la prossima azione, la anima, evidenzia la riga, e ripete. Un limite di istruzioni tra un'azione e l'altra ferma i cicli che girano a vuoto.
5. A fine programma si verifica l'obiettivo. Successo: animazione, stelle, XP, avanti. Insuccesso: messaggio specifico ("il robot si è fermato una cella prima") e proposta di aiuto.

Modello dei progressi salvati:

```json
{
  "versione": 1,
  "xp": 340,
  "streak": { "giorni": 4, "ultimo": "2026-09-08" },
  "lezioni": { "c1-l3": { "stato": "completa", "stelle": 2, "tentativi": 3 } },
  "palestra": { "k12": { "stelle": 3, "righe": 5 } },
  "acquisti": { "corsoCompleto": false },
  "impostazioni": { "lingua": "it", "audio": true, "testoGrande": false }
}
```

## Interprete sicuro

Pipeline: `parse` con acorn → `validate` sull'albero sintattico → `evaluate` con un generatore.

Il generatore restituisce a ogni passo uno di questi valori:

- `{ tipo: 'riga', riga }` all'inizio di ogni istruzione, per evidenziare e per il passo passo;
- `{ tipo: 'azione', azione, riga }` quando il codice chiama una funzione della scena;
- fine, quando il programma è terminato.

Gli errori arrivano come oggetti con messaggio in lingua e numero di riga.

Sottoinsieme di JavaScript supportato e capitolo in cui si sblocca:

| Costrutto | Capitolo |
|---|---|
| chiamate di funzione, numeri, stringhe, `console.log` | Primi comandi |
| `let`, `const`, `=`, `+ - * /`, template string | Variabili |
| `if`, `else`, `=== !== < > <= >=`, `&& \|\| !` | Decisioni |
| `for`, `while`, `++`, `+=`, `break` | Ripetizioni |
| `function`, parametri, `return`, arrow function | Funzioni |
| array, `[i]`, `.length`, `push`, `for of`, `includes` | Array |
| `map`, `filter`, `find`, `reduce`, `forEach` con callback | Metodi degli array |
| oggetti, `obj.prop`, `obj['prop']`, metodi | Oggetti |
| metodi di stringhe, `Math`, `Number()`, `String()` | Stringhe e numeri |
| `setTimeout`, callback, `async`, `await` simulati sui tick | Tempo ed eventi |

Nella Palestra è disponibile tutto il sottoinsieme. Un costrutto non ancora sbloccato produce il messaggio "Questo lo imparerai nel capitolo Ripetizioni" invece di un errore criptico. Un costrutto fuori dal sottoinsieme, per esempio le classi, produce "Non è disponibile in questa app".

Regole di sicurezza e robustezza:

- Gli identificatori si risolvono solo nella catena di scope dell'interprete. Non esiste accesso a `window`, `document`, `fetch` o al prototipo degli oggetti.
- Limite di istruzioni valutate tra un'azione e l'altra, per esempio diecimila: superato, "Il programma gira a vuoto, forse un ciclo infinito".
- Limite di profondità delle chiamate, per la ricorsione.
- Limite di lunghezza del codice.

Messaggi di errore, esempi:

- `moveRigth()` → "moveRigth non esiste. Forse volevi forward()?" con la distanza tra stringhe sui nomi noti.
- `forward` senza parentesi → "Per usare un comando servono le parentesi: forward()".
- parentesi non chiusa → "Manca una parentesi chiusa alla riga 3".
- `water()` senza argomento → "water vuole una pianta, per esempio water(plants[0])".

## Struttura delle cartelle

```
<nome-app>/
  index.html
  package.json
  vite.config.js
  capacitor.config.json          quando si arriva all'app
  public/
    assets/
      scene/                     tileset, sprite, sfondi per famiglia di scena
      illustrazioni/             immagini delle schede, generate con ChatGPT
      audio/
  src/
    main.js                      avvio, router, caricamento progressi
    config.js                    costanti: tick, durate, limiti interprete
    i18n/
      index.js
      it.json
      en.json
    ui/
      router.js                  schermate come sezioni, transizioni GSAP
      schermate/
        home.js                  percorso a capitoli e lezioni
        lezione.js               player delle schede
        palestra.js
        profilo.js
        impostazioni.js
        onboarding.js
      schede/
        spiegazione.js
        scelta.js
        completa.js
        codice.js                editor + scena + controlli
      editor/
        editor.js                CodeMirror 6, evidenziazione riga, sola lettura
        palette.js               pulsanti comandi e simboli sopra la tastiera
        tastiera.js              gestione tastiera iOS e viewport
      componenti/                bottoni, barra progresso, modali, stelle
    lezioni/
      carica.js                  lettura JSON e validazione dello schema
      stato.js                   avanzamento dentro la lezione
      verifica.js                controllo risposte delle schede senza codice
    sfida/
      sessione.js                collega editor, interprete, scena, verifica
      obiettivi.js               stato finale, test nascosti
      stile.js                   controlli sull'albero sintattico per le stelle
    interprete/
      index.js                   compile(codice, permessi) → programma
      parse.js
      validate.js
      evaluate.js
      builtin/                   array, stringhe, Math, console
      errori.js
    motore/
      loop.js                    passo fisso a 60 tick
      azioni.js
      renderer.js
    scene/
      base.js                    interfaccia comune
      robot/  luci/  serra/  negozio/  tela/  razzo/
    progressi/
      store.js                   lettura e scrittura, localStorage poi Preferences
      xp.js  streak.js  stelle.js
  content/
    it/
      capitoli.json
      c1/  l1.json  l2.json ...
    en/                          stessi id, testi tradotti, codice identico
    palestra/
  tests/
    interprete/
    scene/
    soluzioni/                   ogni sfida con la soluzione ufficiale che deve passare
  docs/
    CONCEPT.md                   questo documento
    CONTENUTI.md                 come scrivere una lezione
```

Interfaccia comune delle scene, per tenere le famiglie intercambiabili:

```js
class Scena {
  constructor(config)          // mappa, oggetti, stato iniziale
  api()                        // funzioni e oggetti esposti al codice dell'utente
  avvia(azione)                // mette in esecuzione un'azione
  tick()                       // avanza di un tick, true quando l'azione è finita
  verifica(obiettivo)          // { ok, messaggio }
  reset()
  disegna(ctx)                 // opzionale in Node, obbligatorio nell'app
}
```

## Formato di una lezione

```json
{
  "id": "c1-l3",
  "capitolo": "c1",
  "titolo": "Ripeti quello che serve",
  "minuti": 4,
  "schede": [
    {
      "tipo": "spiegazione",
      "testo": "Ogni comando fa **una** cosa. Per farne tre, lo scrivi tre volte.",
      "esempio": "forward()\nforward()\nforward()"
    },
    {
      "tipo": "scelta",
      "domanda": "Cosa fa `turnLeft()`?",
      "opzioni": ["Fa un passo avanti", "Ruota il robot a sinistra", "Raccoglie la batteria"],
      "risposta": 1
    },
    {
      "tipo": "completa",
      "codice": "forward()\n___()\nforward()",
      "scelte": ["turnLeft", "jump", "forward"],
      "risposta": ["turnLeft"]
    },
    {
      "tipo": "codice",
      "scena": "robot",
      "config": { "mappa": ["....", ".R.B", "...."], "direzione": "E" },
      "obiettivo": { "tipo": "raccogli", "oggetto": "B" },
      "starter": "forward()\n",
      "api": ["forward", "turnLeft", "turnRight", "pickUp"],
      "sintassi": ["call"],
      "stelle": [{ "tipo": "completa" }, { "tipo": "maxRighe", "valore": 4 }],
      "aiuti": [
        "Il robot guarda verso destra. Quante celle lo separano dalla batteria?",
        "Servono due passi e poi raccogliere.",
        "forward()\nforward()\npickUp()"
      ]
    }
  ]
}
```

Lo stesso formato serve per la Palestra, con in più `difficolta`, `test` nascosti e `tags` per concetto.

## Schermate

- **Onboarding**: due schermate. "Hai mai programmato?" decide se proporre i test di ingresso. Scelta lingua.
- **Home**: percorso a nodi per capitolo, come Duolingo. Ogni nodo è una lezione con le stelle ottenute. In alto XP e streak, in basso la barra con Percorso, Palestra, Profilo.
- **Lezione**: barra di avanzamento in alto, una scheda alla volta, pulsante Continua in basso. Transizioni GSAP tra schede.
- **Scheda codice**: scena in alto, editor in basso, palette comandi e simboli sopra la tastiera, barra con Esegui, Passo, Ricomincia, Aiuto. In verticale la scena occupa circa il quaranta per cento dell'altezza; quando si apre la tastiera la scena si riduce e resta visibile.
- **Palestra**: elenco sfide con filtro per concetto e difficoltà, stelle, migliore soluzione personale in righe.
- **Profilo**: XP, streak, badge dei capitoli, statistiche.
- **Impostazioni**: lingua, audio, testo grande, ripristina acquisti, privacy.

Stile visivo: schede chiare e leggibili, scene scure con elementi interattivi molto contrastati, come nel mockup di TIME LOOP. Un solo font per il testo e un monospace per il codice. Le illustrazioni delle schede si generano con ChatGPT con lo stesso prompt di stile.

Tastiera iOS: autocorrezione, maiuscole automatiche e correttore disattivati nell'editor; palette con `( ) { } [ ] ; = . ' "` e frecce; inserimento da pulsante senza aprire la tastiera; layout basato su `visualViewport` nel browser e sul plugin Keyboard nell'app.

## Progressione e motivazione

- XP per scheda completata e per sfida, bonus per le stelle.
- Streak giornaliera con promemoria opzionale, senza penalità.
- Badge a fine capitolo.
- Stelle per sfida, con invito a migliorare la soluzione.
- Nessuna vita, nessun timer, nessuna classifica nella prima versione.

## Modello di vendita

App gratuita con i primi quattro capitoli. Un acquisto in-app unico sblocca tutto il corso e la Palestra. Serve il pulsante "Ripristina acquisti". Un abbonamento si valuta solo se in futuro arrivano contenuti nuovi ogni mese.

## Piano di sviluppo per milestone

Ogni milestone ha un criterio di "fatto".

**M0 · Fondamenta**. Progetto Vite, struttura cartelle, router con le schermate vuote, i18n, salvataggio in localStorage, vitest configurato, porta dedicata nel launch.json globale. Fatto quando `npm run dev` mostra la home su iPhone e `npm test` gira.

**M1 · Interprete, primi tre capitoli**. Parse, validate, evaluate con chiamate, variabili, `if`. Errori in italiano. Test unitari sui casi tipici e sugli errori. Fatto quando venti test passano e un ciclo infinito viene fermato.

**M2 · Player delle schede**. Schede spiegazione, scelta multipla, completa il codice. Avanzamento e transizioni. Fatto quando una lezione senza scena si completa da capo a fondo.

**M3 · Scena Robot e scheda codice**. Motore a tick, scena robot con API e obiettivi, editor CodeMirror, evidenziazione riga, Esegui, Passo, Ricomincia, verifica, stelle. Fatto quando la lezione di esempio qui sopra si risolve sull'iPhone.

**M4 · Capitolo Primi comandi completo**. Cinque o sei lezioni scritte, home con il percorso, XP. Questo è l'MVP: un capitolo giocabile end-to-end. Fatto quando tre persone che non programmano lo finiscono senza aiuto esterno, osservate.

**M5 · Correzioni dal playtest**. Ritmo, tastiera, messaggi d'errore, durata delle animazioni. Nessuna funzionalità nuova.

**M6 · Capitoli da Variabili a Ripetizioni, scena Luci**. Interprete esteso a `for` e `while`, seconda famiglia di scene, momenti "possiamo farlo meglio". Fatto quando i quattro capitoli gratuiti sono completi.

**M7 · Palestra e test di ingresso**. Sfide con test nascosti, obiettivi di stile letti dall'albero, salto capitolo. Fatto quando chi sa programmare trova almeno dieci sfide non banali.

**M8 · Capitoli da Funzioni a Oggetti, scene Serra, Negozio e Tela**. Interprete con funzioni, array e metodi con callback, oggetti.

**M9 · Arte, audio, inglese**. Illustrazioni delle schede, sprite delle scene, effetti sonori, traduzione completa dei contenuti.

**M10 · App**. Capacitor, Preferences, acquisto in-app, TestFlight, scheda dello store. Segue il piano già scritto.

**M11 · Capitoli finali e mini progetti**. Stringhe e numeri, Tempo ed eventi, scena Razzo, progetti completi.

Tempi indicativi: M0 fino a M4 in tre o quattro settimane di sessioni. Il corso completo richiede qualche mese, e il tempo va quasi tutto nella scrittura delle lezioni e delle sfide.

## Fuori dalla prima versione

Account e sync, classifiche, notifiche push, altri linguaggi, HTML e CSS, blocchi visuali, editor con autocompletamento avanzato, condivisione delle soluzioni, iPad in orizzontale.

## Rischi e cose da verificare nel playtest

- Scrivere codice sul telefono: la palette e i token devono bastare nei primi capitoli, altrimenti la gente abbandona.
- Le scene devono essere davvero divertenti da guardare: se l'animazione è lenta o piatta, il corso torna scolastico.
- L'interprete va costruito bene una volta sola. Ogni costrutto aggiunto va coperto da test.
- La scrittura delle lezioni è il lavoro più lungo. Conviene fissare un modello di lezione e produrle in serie, un capitolo per volta.
- Le illustrazioni generate vanno tenute coerenti con un prompt di stile unico e con schede di riferimento per il personaggio.
