// Intestazione delle domande: bolla verde col "?" (render Blender) e testo con le parole tra ** in giallo; i comandi tipo wait(3) si evidenziano da soli.
export function intestazioneDomanda(testo) {
  const box = document.createElement('div'); box.className = 'domanda';
  const h = document.createElement('h2');
  const parti = testo.split(/(\*\*[^*]+\*\*|\b[a-zA-Z_.]+\([^)]*\))/g);
  for (const p of parti) {
    if (!p) continue;
    if (p.startsWith('**')) { const em = document.createElement('em'); em.textContent = p.slice(2, -2); h.appendChild(em); }
    else if (/^[a-zA-Z_.]+\(/.test(p)) { const c = document.createElement('code'); c.textContent = p; h.appendChild(c); }
    else h.append(p);
  }
  box.appendChild(h); return box;
}
