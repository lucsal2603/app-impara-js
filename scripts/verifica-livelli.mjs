// Verifica in Node che la soluzione (ultimo aiuto) di ogni livello superi tutte le stanze e quali stelle prende.
// Uso: node scripts/verifica-livelli.mjs [c2-l1 ...]
import { readdirSync, readFileSync } from 'node:fs';
import { ScenaPlatform } from '../src/scene/platform/index.js';
import { Sessione } from '../src/sfida/sessione.js';
import { valutaStelle } from '../src/sfida/stelle.js';

const filtro = process.argv.slice(2);
const risorse = { tilesMeta: { animazioni: {} }, tiles: {}, sprites: {}, spritesMeta: {} };
let errori = 0;
for (const cap of readdirSync('content/it').filter(d => d.startsWith('c')).sort()) {
  for (const f of readdirSync(`content/it/${cap}`).filter(f => /^l\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
    const id = `${cap}-${f.replace('.json', '')}`; if (filtro.length && !filtro.includes(id)) continue;
    const lez = JSON.parse(readFileSync(`content/it/${cap}/${f}`, 'utf8'));
    for (const [k, card] of lez.schede.entries()) {
      if (card.tipo !== 'codice') continue;
      const soluzione = (card.aiuti || []).at(-1) || '';
      const r = prova(card, soluzione);
      const st = r.stelle ? r.stelle.map(s => (s.ok ? '★' : '☆') + ' ' + s.testo).join('  ') : '';
      const ok = r.vinto && r.stelle.every(s => s.ok);
      if (!ok) errori++;
      console.log(`${ok ? 'OK ' : 'NO '} ${id} scheda ${k} (${card.sottotitolo || card.titolo}) → ${r.vinto ? 'vinto' : 'NON VINTO: ' + r.motivo} | righe ${r.righe} | ${st}`);
    }
  }
}
process.exit(errori ? 1 : 0);

function prova(card, codice) {
  const scena = new ScenaPlatform(card.config, risorse);
  const righe = codice.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
  let err = null, msg = null;
  const editor = { codice: () => codice, evidenzia() {}, solaLettura() {}, righeCodice: () => righe };
  const ui = { stato() {}, errore: e => { if (e) err = e; }, messaggio: m => { if (m) msg = m; }, console() {}, variabili() {} };
  const sessione = new Sessione({ scena, editor, api: card.api, ui, sintassi: card.sintassi || ['call'], varianti: [card.config, ...(card.varianti || [])] });
  sessione.esegui();
  if (err) return { vinto: false, motivo: `errore riga ${err.riga}: ${err.messaggio}`, righe };
  for (let t = 0; t < 60 * 600; t++) {
    sessione.tick();
    if (err) return { vinto: false, motivo: `errore riga ${err.riga}: ${err.messaggio}`, righe };
    if (scena.esito === 'vinto' && sessione.stato === 'finito') return { vinto: true, righe, stelle: valutaStelle(card, scena, righe, sessione.ast) };
    if (scena.esito === 'morto') return { vinto: false, motivo: `morto in stanza ${sessione.variante + 1} a x=${scena.player.gx}`, righe };
    if (sessione.stato === 'finito') return { vinto: false, motivo: `programma finito senza uscita (stanza ${sessione.variante + 1}, x=${scena.player.gx}, y=${scena.player.gy})`, righe };
    if (sessione.stato === 'pronto') return { vinto: false, motivo: 'ricominciato: ' + msg, righe };
  }
  return { vinto: false, motivo: 'tempo scaduto', righe };
}
