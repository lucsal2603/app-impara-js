// Valutazione delle stelle di un livello: risultato della scena, righe scritte e stile del codice (albero sintattico).
import { analizzaStile } from '../interprete/stile.js';

export function valutaStelle(livello, scena, righe, ast = null) {
  const st = ast ? analizzaStile(ast) : null;
  return (livello.stelle || []).map(s => {
    if (s.tipo === 'completa') return { ...s, ok: true };
    if (s.tipo === 'maxRighe') return { ...s, ok: righe <= s.valore };
    if (s.tipo === 'chiave') return { ...s, ok: scena.chiavi.length > 0 && scena.chiavi.every(k => k.presa) };
    if (s.tipo === 'monete') return { ...s, ok: scena.monete.length > 0 && scena.monete.every(m => m.presa) };
    if (s.tipo === 'usaCiclo') return { ...s, ok: !!st && st.cicli >= (s.valore || 1) };
    if (s.tipo === 'usaWhile') return { ...s, ok: !!st && st.whiles >= (s.valore || 1) };
    if (s.tipo === 'usaFor') return { ...s, ok: !!st && st.fors >= (s.valore || 1) };
    if (s.tipo === 'usaIf') return { ...s, ok: !!st && st.ifs >= (s.valore || 1) };
    if (s.tipo === 'usaVariabile') return { ...s, ok: !!st && st.variabili >= (s.valore || 1) };
    if (s.tipo === 'usaFunzione') return { ...s, ok: !!st && st.funzioni >= 1 && st.chiamateFunzioni >= (s.valore || 2) };
    if (s.tipo === 'usaSensore') return { ...s, ok: !!st && st.sensori >= (s.valore || 1) };
    if (s.tipo === 'nienteRipetizioni') return { ...s, ok: !!st && st.ripetizioni === 0 };
    return { ...s, ok: false };
  });
}
