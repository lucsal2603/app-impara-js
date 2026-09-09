// Progresso salvato sul telefono: stelle per lezione e esercizi della palestra fatti.
const CHIAVE = 'codeplay.progresso';
export function leggiProgresso() { try { return JSON.parse(localStorage.getItem(CHIAVE) || '{}'); } catch { return {}; } }
export function salvaLezione(id, stelle) {
  const p = leggiProgresso(); const prese = stelle.filter(s => s.ok).length;
  p.lezioni = p.lezioni || {}; p.lezioni[id] = Math.max(p.lezioni[id] || 0, prese); p.ultima = id;
  try { localStorage.setItem(CHIAVE, JSON.stringify(p)); } catch {}
}
export function salvaPalestra(id) { const p = leggiProgresso(); p.palestra = p.palestra || {}; p.palestra[id] = true; try { localStorage.setItem(CHIAVE, JSON.stringify(p)); } catch {} }
