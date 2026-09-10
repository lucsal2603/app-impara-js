// Scheda "prova": un pezzo di codice da eseguire e modificare, con la console sotto. Se ha `atteso`, la scheda si sblocca quando l'output coincide.
import { Editor } from '../editor.js';
import { riempi } from '../testo.js';
import { eseguiConsole, TUTTA_LA_SINTASSI } from '../../sfida/esegui.js';

export function render(scheda, { onPronto }) {
  const el = document.createElement('article'); el.className = 'scheda scheda-prova';
  const h = document.createElement('h2'); h.textContent = scheda.titolo || 'Prova tu'; el.appendChild(h);
  if (scheda.testo) for (const t of [].concat(scheda.testo)) { const p = document.createElement('p'); riempi(p, t); el.appendChild(p); }
  el.insertAdjacentHTML('beforeend', `
    <div class="mini-editor"><div class="editor" data-r="editor"></div><div class="simboli" data-r="simboli"></div><div class="palette" data-r="palette"></div></div>
    <button type="button" class="esegui-mini" data-r="esegui">▶ Esegui</button>
    <div class="console-prova" data-r="console" hidden></div>
    <div class="errore" data-r="errore" hidden></div>`);
  const $ = r => el.querySelector(`[data-r="${r}"]`);
  const sintassi = scheda.sintassi || TUTTA_LA_SINTASSI;
  const editor = new Editor({ contenitore: $('editor'), palette: $('palette'), simboli: $('simboli'), api: [], sintassi, starter: scheda.codice || '' });
  let pronta = !scheda.atteso && !scheda.obbligatoria;
  $('esegui').addEventListener('click', () => {
    const r = eseguiConsole(editor.codice(), { sintassi, variabili: scheda.variabili || {} });
    const c = $('console'); c.hidden = false; c.replaceChildren(...(r.righe.length ? r.righe : ['(nessun output)']).map(t => { const d = document.createElement('div'); d.textContent = '› ' + t; return d; }));
    const e = $('errore'); e.hidden = r.ok; if (!r.ok) e.textContent = `Riga ${r.errore.riga}: ${r.errore.messaggio}`;
    if (scheda.atteso) {
      const ok = r.ok && r.righe.length === scheda.atteso.length && r.righe.every((v, i) => v === String(scheda.atteso[i]));
      c.classList.toggle('giusta', ok); c.classList.toggle('sbagliata', !ok);
      if (ok) { pronta = true; onPronto(true); const d = document.createElement('div'); d.className = 'esito'; d.textContent = '✓ ' + (scheda.spiegazione || 'Esatto!'); c.appendChild(d); }
      else if (r.ok) { const d = document.createElement('div'); d.className = 'esito'; d.textContent = `Atteso: ${scheda.atteso.join(' · ')}`; c.appendChild(d); }
    } else if (r.ok) { pronta = true; onPronto(true); }
  });
  return { el, pronta, azzera() {} };
}
