// Esecuzione "in console" di un programma senza scena: variabili nascoste come valori, righe di console.log come risultato.
import { compila } from '../interprete/index.js';
export const TUTTA_LA_SINTASSI = ['call', 'let', 'if', 'for', 'while', 'function', 'array', 'object'];

export function eseguiConsole(codice, { sintassi = TUTTA_LA_SINTASSI, variabili = {}, extra = '' } = {}) {
  const r = compila(codice + (extra ? '\n' + extra : ''), [], { sintassi, sensori: Object.keys(variabili) });
  if (!r.ok) return { ok: false, errore: r.errore, righe: [] };
  const righe = []; let ultime = {};
  try {
    for (const ev of r.programma.esegui({ api: {}, sensori: variabili })) {
      if (ev.tipo === 'log') righe.push(ev.testo);
      if (ev.tipo === 'variabili') ultime = ev.variabili;
      if (righe.length > 500) { righe.push('... (troppe righe)'); break; }
    }
  } catch (e) { return { ok: false, errore: { riga: e.riga || 1, messaggio: e.message }, righe, variabili: ultime }; }
  return { ok: true, righe, variabili: ultime, ast: r.ast };
}

// Esercizio con casi nascosti: ogni caso può dare variabili, righe di codice da aggiungere in coda (es. una chiamata alla funzione) e l'output atteso.
export function provaCasi(esercizio, codice) {
  const casi = esercizio.casi.map(c => {
    const r = eseguiConsole(codice, { sintassi: esercizio.sintassi || TUTTA_LA_SINTASSI, variabili: c.variabili || {}, extra: c.chiama ? `console.log(${c.chiama})` : (c.extra || '') });
    if (!r.ok) return { ...c, ottenuto: r.righe, ok: false, errore: r.errore.messaggio };
    return { ...c, ottenuto: r.righe, ok: r.righe.length === c.atteso.length && r.righe.every((v, i) => v === String(c.atteso[i])) };
  });
  const compilato = compila(codice, [], { sintassi: esercizio.sintassi || TUTTA_LA_SINTASSI, sensori: Object.keys(esercizio.casi[0]?.variabili || {}) });
  return { ok: casi.every(c => c.ok), casi, errore: compilato.ok ? null : compilato.errore, ast: compilato.ok ? compilato.ast : null };
}
