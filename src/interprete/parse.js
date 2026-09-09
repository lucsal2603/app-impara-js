// Parsing con acorn e traduzione degli errori di sintassi in italiano.
import * as acorn from 'acorn';

export function analizza(codice) {
  try {
    return { ok: true, ast: acorn.parse(codice, { ecmaVersion: 2022, locations: true, sourceType: 'script' }) };
  } catch (e) {
    const riga = e.loc?.line || 1, testo = codice.split('\n')[riga - 1] || '';
    return { ok: false, errore: { riga, messaggio: traduci(e.message, riga, testo) } };
  }
}

function traduci(m, riga, testo) {
  const aperte = (testo.match(/\(/g) || []).length, chiuse = (testo.match(/\)/g) || []).length;
  const graffeA = (testo.match(/\{/g) || []).length, graffeC = (testo.match(/\}/g) || []).length;
  if (/Unexpected end of input/.test(m)) return 'Il programma finisce a metà: manca una parentesi o una graffa da chiudere.';
  if (/Unterminated string/.test(m)) return `Una stringa non è chiusa alla riga ${riga}: mancano le virgolette.`;
  if (/Unexpected token \)/.test(m) || (chiuse > aperte)) return `C'è una parentesi chiusa di troppo alla riga ${riga}.`;
  if (/Unexpected token \}/.test(m)) return `C'è una graffa chiusa di troppo alla riga ${riga}.`;
  if (aperte > chiuse) return `Manca una parentesi chiusa alla riga ${riga}.`;
  if (graffeA > graffeC) return `Manca una graffa chiusa } dopo la riga ${riga}.`;
  if (/Unexpected character/.test(m)) return `C'è un carattere che JavaScript non capisce alla riga ${riga}.`;
  if (/Unexpected token/.test(m)) return `C'è qualcosa che non torna alla riga ${riga}: controlla parentesi, graffe e virgole.`;
  if (/Assigning to rvalue/.test(m)) return `Alla riga ${riga} stai assegnando un valore a qualcosa che non è una variabile.`;
  return `Errore di scrittura alla riga ${riga}: ${m.replace(/\s*\(\d+:\d+\)$/, '')}.`;
}
