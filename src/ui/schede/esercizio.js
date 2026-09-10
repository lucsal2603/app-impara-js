// Scheda "esercizio": consegna, editor e test nascosti (come la palestra). Si va avanti solo quando tutti i casi passano.
import { Editor } from '../editor.js';
import { riempi } from '../testo.js';
import { provaCasi, TUTTA_LA_SINTASSI } from '../../sfida/esegui.js';

export function render(scheda, { onPronto }) {
  const el = document.createElement('article'); el.className = 'scheda scheda-esercizio';
  const h = document.createElement('h2'); h.textContent = scheda.titolo || 'Esercizio'; el.appendChild(h);
  for (const t of [].concat(scheda.consegna || [])) { const p = document.createElement('p'); riempi(p, t); el.appendChild(p); }
  if (scheda.esempio) { const p = document.createElement('p'); p.className = 'esempio'; riempi(p, scheda.esempio); el.appendChild(p); }
  el.insertAdjacentHTML('beforeend', `
    <div class="mini-editor"><div class="editor" data-r="editor"></div><div class="simboli" data-r="simboli"></div><div class="palette" data-r="palette"></div></div>
    <button type="button" class="esegui-mini" data-r="prova">▶ Prova i test</button>
    <div class="errore" data-r="errore" hidden></div>
    <div class="risultati" data-r="risultati" hidden></div>
    <div class="suggerimento" data-r="aiuto" hidden></div>`);
  const $ = r => el.querySelector(`[data-r="${r}"]`);
  const sintassi = scheda.sintassi || TUTTA_LA_SINTASSI;
  const editor = new Editor({ contenitore: $('editor'), palette: $('palette'), simboli: $('simboli'), api: [], sintassi, starter: scheda.starter || '' });
  for (const n of Object.keys(scheda.casi?.[0]?.variabili || {})) editor.bottone($('palette'), n, () => editor.inserisci(n, true), 'sensore');
  editor.bottone($('palette'), 'console.log()', () => editor.modello('log'));
  let tentativi = 0; const aiuti = scheda.aiuti || [];
  $('prova').addEventListener('click', () => {
    const r = provaCasi(scheda, editor.codice()); tentativi++;
    const e = $('errore'); e.hidden = !r.errore; if (r.errore) e.textContent = `Riga ${r.errore.riga}: ${r.errore.messaggio}`;
    const box = $('risultati'); box.hidden = false;
    box.innerHTML = r.casi.map(c => `<div class="caso ${c.ok ? 'ok' : 'no'}"><b>${c.ok ? '✓' : '✗'}</b><span>${[...Object.entries(c.variabili || {}).map(([k, v]) => `${k} = ${JSON.stringify(v)}`), c.chiama ? c.chiama : ''].filter(Boolean).join(', ') || 'senza dati'}</span><code>${c.errore ? 'errore: ' + c.errore : (c.ottenuto.join(' · ') || '(niente)')}</code>${c.ok ? '' : `<small>atteso: ${c.atteso.join(' · ') || '(niente)'}</small>`}</div>`).join('');
    if (r.ok) { onPronto(true); const d = document.createElement('div'); d.className = 'caso ok tutti'; d.textContent = '✓ ' + (scheda.spiegazione || 'Tutti i test passano.'); box.prepend(d); }
    else if (aiuti.length && tentativi >= 2) { const a = $('aiuto'); a.hidden = false; a.textContent = 'Aiuto: ' + aiuti[Math.min(aiuti.length - 1, tentativi - 2)]; }
  });
  return { el, pronta: false, azzera() {} };
}
