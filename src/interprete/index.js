// compila(codice, api, { sintassi, sensori }) → { ok, ast, programma } oppure { ok: false, errore: { riga, messaggio } }.
// programma.esegui({ api, sensori }) restituisce un generatore: {tipo:'riga', riga, variabili} | {tipo:'azione', azione, riga} | {tipo:'log', testo}.
import { analizza } from './parse.js';
import { valida } from './validate.js';
import { esegui } from './evaluate.js';
export { ErroreCodice } from './errori.js';

export function compila(codice, api, opzioni = {}) {
  const { sintassi = ['call'], sensori = [] } = opzioni;
  const p = analizza(codice); if (!p.ok) return p;
  if (!p.ast.body.length) return { ok: false, errore: { riga: 1, messaggio: 'Il programma è vuoto: scrivi almeno un comando.' } };
  const v = valida(p.ast, sintassi, api, sensori); if (!v.ok) return v;
  return { ok: true, ast: p.ast, programma: { ast: p.ast, esegui(ctx) { return esegui(p.ast, ctx); } } };
}
