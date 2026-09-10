// Verifica le lezioni della sezione "Il linguaggio": ogni esercizio con la sua soluzione passa i casi, ogni prova con `atteso` è risolvibile,
// e i pezzi di codice delle spiegazioni e delle prove girano senza errori.
import { readdirSync, readFileSync } from 'node:fs';
import { provaCasi, eseguiConsole } from '../src/sfida/esegui.js';
let errori = 0;
for (const f of readdirSync('content/it/js').filter(f => /^l\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
  const lez = JSON.parse(readFileSync(`content/it/js/${f}`, 'utf8'));
  for (const [k, c] of lez.schede.entries()) {
    let esito = null;
    if (c.tipo === 'esercizio') { const r = provaCasi(c, c.soluzione); esito = r.ok ? 'OK' : 'NO ' + (r.errore ? r.errore.messaggio : r.casi.filter(x => !x.ok).map(x => JSON.stringify(x.ottenuto) + ' vs ' + JSON.stringify(x.atteso)).join(' ; ')); }
    else if (c.tipo === 'prova') { const r = eseguiConsole(c.soluzione || c.codice, { variabili: c.variabili || {} }); esito = !r.ok ? 'NO ' + r.errore.messaggio : c.atteso ? (r.righe.join('|') === c.atteso.join('|') ? 'OK' : 'NO ' + r.righe.join('|') + ' vs ' + c.atteso.join('|')) : 'OK (libera: ' + r.righe.length + ' righe)'; }
    else if (c.tipo === 'spiegazione' && c.codice && !/\.\.\./.test(c.codice)) { const r = eseguiConsole(c.codice); esito = r.ok ? 'OK (esempio)' : 'NO esempio: ' + r.errore.messaggio; }
    if (!esito) continue;
    if (!esito.startsWith('OK')) errori++;
    console.log(`${esito.startsWith('OK') ? 'OK ' : 'NO '} ${lez.id} scheda ${k} (${c.tipo}: ${c.titolo || c.domanda || ''}) ${esito.startsWith('OK') ? '' : esito}`);
  }
}
console.log(errori ? `ERRORI: ${errori}` : 'tutto ok'); process.exit(errori ? 1 : 0);
