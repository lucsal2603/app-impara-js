// Scheda di spiegazione: titolo, immagine opzionale, blocco di codice opzionale, paragrafi.
export function render(scheda) {
  const el = document.createElement('article'); el.className = 'scheda scheda-testo';
  if (scheda.immagine) { const im = document.createElement('img'); im.src = scheda.immagine.startsWith('/') ? import.meta.env.BASE_URL + scheda.immagine.slice(1) : scheda.immagine; im.alt = ''; im.className = 'mascotte'; el.appendChild(im); }
  const h = document.createElement('h2'); h.textContent = scheda.titolo; el.appendChild(h);
  if (scheda.codice) { const pre = document.createElement('pre'); pre.className = 'codice'; pre.textContent = scheda.codice; el.appendChild(pre); }
  for (const t of scheda.testo || []) { const p = document.createElement('p'); p.textContent = t; el.appendChild(p); }
  return { el, pronta: true };
}
