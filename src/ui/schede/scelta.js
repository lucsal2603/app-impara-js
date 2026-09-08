// Scheda a scelta multipla: una domanda, opzioni, verifica con spiegazione.
export function render(scheda, { onPronto }) {
  const el = document.createElement('article'); el.className = 'scheda scheda-scelta';
  const h = document.createElement('h2'); h.textContent = scheda.domanda; el.appendChild(h);
  if (scheda.codice) { const pre = document.createElement('pre'); pre.className = 'codice'; pre.textContent = scheda.codice; el.appendChild(pre); }
  const lista = document.createElement('div'); lista.className = 'opzioni'; el.appendChild(lista);
  let scelta = null; const bottoni = [];
  scheda.opzioni.forEach((testo, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opzione'; b.textContent = testo;
    b.addEventListener('click', () => { if (el.dataset.bloccata) return; scelta = i; bottoni.forEach((x, k) => x.classList.toggle('selezionata', k === i)); onPronto(true); });
    lista.appendChild(b); bottoni.push(b);
  });
  return {
    el, pronta: false,
    verifica() {
      const ok = scelta === scheda.risposta;
      bottoni[scelta]?.classList.add(ok ? 'giusta' : 'sbagliata');
      if (ok) { el.dataset.bloccata = '1'; bottoni.forEach(b => b.disabled = true); }
      return { ok, messaggio: ok ? scheda.spiegazione : 'Non è questa. Riprova.' };
    },
    azzera() { bottoni.forEach(b => b.classList.remove('selezionata', 'sbagliata')); scelta = null; onPronto(false); },
  };
}
