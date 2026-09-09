// Scheda "trova l'errore": un programma con una riga sbagliata, si tocca la riga colpevole.
import { intestazioneDomanda } from './domanda.js';
import { riempi } from '../testo.js';
export function render(scheda, { onPronto }) {
  const el = document.createElement('article'); el.className = 'scheda scheda-errore';
  el.appendChild(intestazioneDomanda(scheda.domanda));
  if (scheda.testo) { const p = document.createElement('p'); riempi(p, scheda.testo); el.appendChild(p); }
  const pre = document.createElement('div'); pre.className = 'codice-righe'; el.appendChild(pre);
  let scelta = null; const righe = [];
  scheda.codice.split('\n').forEach((t, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'riga-codice'; b.innerHTML = `<small></small><code></code>`;
    b.querySelector('small').textContent = i + 1; b.querySelector('code').textContent = t;
    b.addEventListener('click', () => { if (el.dataset.bloccata) return; scelta = i; righe.forEach((r, k) => r.classList.toggle('selezionata', k === i)); onPronto(true); });
    pre.appendChild(b); righe.push(b);
  });
  return {
    el, pronta: false,
    verifica() {
      const ok = scelta === scheda.riga - 1;
      righe[scelta]?.classList.add(ok ? 'giusta' : 'sbagliata');
      if (ok) el.dataset.bloccata = '1';
      return { ok, messaggio: ok ? scheda.spiegazione : (scheda.indizio || 'Quella riga va bene. Cerca ancora.') };
    },
    azzera() { righe.forEach(r => r.classList.remove('selezionata', 'sbagliata')); scelta = null; onPronto(false); },
  };
}
