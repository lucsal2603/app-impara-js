// Intestazione delle domande: bolla verde col "?" (render Blender) e testo con le parole tra ** in giallo; i comandi tipo wait(3) si evidenziano da soli.
import { conCodice } from '../testo.js';
export function intestazioneDomanda(testo) {
  const box = document.createElement('div'); box.className = 'domanda';
  const h = document.createElement('h2'); h.appendChild(conCodice(testo));
  box.appendChild(h); return box;
}
