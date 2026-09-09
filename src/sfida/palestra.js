// Esecuzione di un esercizio della palestra: le variabili nascoste diventano sensori (valori), i console.log sono il risultato.
import { compila } from '../interprete/index.js';

export function provaEsercizio(esercizio, codice) {
  const r = compila(codice, [], { sintassi: esercizio.sintassi || ['call', 'let', 'if', 'for', 'while'], sensori: Object.keys(esercizio.casi[0].variabili || {}) });
  if (!r.ok) return { ok: false, errore: r.errore, casi: [] };
  const casi = esercizio.casi.map(c => {
    const ottenuto = [];
    try {
      for (const ev of r.programma.esegui({ api: {}, sensori: c.variabili || {} })) if (ev.tipo === 'log') ottenuto.push(ev.testo);
    } catch (e) { return { ...c, ottenuto, ok: false, errore: e.message }; }
    return { ...c, ottenuto, ok: ottenuto.length === c.atteso.length && ottenuto.every((v, i) => v === c.atteso[i]) };
  });
  return { ok: casi.every(c => c.ok), casi, ast: r.ast };
}
