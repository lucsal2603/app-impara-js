// Scheda "completa il codice": il codice ha uno o più buchi ___, si riempiono toccando le scelte.
export function render(scheda, { onPronto }) {
  const el = document.createElement('article'); el.className = 'scheda scheda-completa';
  const h = document.createElement('h2'); h.textContent = scheda.domanda; el.appendChild(h);
  const pre = document.createElement('pre'); pre.className = 'codice'; el.appendChild(pre);
  const parti = scheda.codice.split('___'); const slot = [];
  parti.forEach((p, i) => {
    pre.append(p);
    if (i < parti.length - 1) { const s = document.createElement('button'); s.type = 'button'; s.className = 'slot'; s.textContent = '…'; s.dataset.i = i; s.addEventListener('click', () => { if (el.dataset.bloccata) return; attivo = i; slot.forEach((x, k) => x.classList.toggle('attivo', k === i)); }); pre.appendChild(s); slot.push(s); }
  });
  let attivo = 0; slot[0]?.classList.add('attivo');
  const valori = Array(slot.length).fill(null);
  const chips = document.createElement('div'); chips.className = 'chips'; el.appendChild(chips);
  for (const c of scheda.scelte) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip-scelta'; b.textContent = c;
    b.addEventListener('click', () => {
      if (el.dataset.bloccata) return;
      valori[attivo] = c; slot[attivo].textContent = c; slot[attivo].classList.add('pieno');
      const prossimo = valori.findIndex(v => v === null); if (prossimo >= 0) { attivo = prossimo; slot.forEach((x, k) => x.classList.toggle('attivo', k === attivo)); }
      onPronto(valori.every(v => v !== null));
    });
    chips.appendChild(b);
  }
  return {
    el, pronta: false,
    verifica() {
      const ok = valori.every((v, i) => v === scheda.risposta[i]);
      slot.forEach((s, i) => s.classList.add(valori[i] === scheda.risposta[i] ? 'giusto' : 'sbagliato'));
      if (ok) el.dataset.bloccata = '1';
      return { ok, messaggio: ok ? scheda.spiegazione : 'Non è quello giusto. Riprova.' };
    },
    azzera() { valori.fill(null); slot.forEach((s, i) => { s.textContent = '…'; s.className = 'slot' + (i === 0 ? ' attivo' : ''); }); attivo = 0; onPronto(false); },
  };
}
