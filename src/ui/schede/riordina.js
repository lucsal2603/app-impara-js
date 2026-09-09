// Scheda "metti in ordine": le righe di un programma sono mescolate, si spostano con le frecce su/giù.
import { intestazioneDomanda } from './domanda.js';
import { riempi } from '../testo.js';
export function render(scheda, { onPronto }) {
  const el = document.createElement('article'); el.className = 'scheda scheda-riordina';
  el.appendChild(intestazioneDomanda(scheda.domanda));
  if (scheda.testo) { const p = document.createElement('p'); riempi(p, scheda.testo); el.appendChild(p); }
  const lista = document.createElement('div'); lista.className = 'righe-ordine'; el.appendChild(lista);
  let ordine = (scheda.mescolate || mescola(scheda.righe.map((_, i) => i))).slice();
  function disegna() {
    lista.replaceChildren(...ordine.map((k, pos) => {
      const r = document.createElement('div'); r.className = 'riga-ordine'; r.dataset.k = k;
      r.innerHTML = `<code></code><span class="frecce"><button type="button" aria-label="Su">▲</button><button type="button" aria-label="Giù">▼</button></span>`;
      r.querySelector('code').textContent = scheda.righe[k];
      const [su, giu] = r.querySelectorAll('button'); su.disabled = pos === 0; giu.disabled = pos === ordine.length - 1;
      su.addEventListener('click', () => sposta(pos, -1)); giu.addEventListener('click', () => sposta(pos, 1));
      return r;
    }));
  }
  function sposta(pos, d) { if (el.dataset.bloccata) return; const j = pos + d; [ordine[pos], ordine[j]] = [ordine[j], ordine[pos]]; disegna(); onPronto(true); }
  disegna(); onPronto(true);
  return {
    el, pronta: true,
    verifica() {
      const ok = ordine.every((k, i) => k === i);
      [...lista.children].forEach((r, i) => r.classList.add(ordine[i] === i ? 'giusto' : 'sbagliato'));
      if (ok) el.dataset.bloccata = '1';
      return { ok, messaggio: ok ? scheda.spiegazione : 'L\'ordine non è ancora giusto: le righe rosse sono fuori posto.' };
    },
    azzera() { [...lista.children].forEach(r => r.classList.remove('giusto', 'sbagliato')); },
  };
}
function mescola(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]]; return a; }
