// Giorni di fila: si conta un giorno ogni volta che l'app viene aperta in un giorno nuovo; se salti un giorno si riparte da 1.
// Giorno 1 = fiamma grigia e ferma; dal giorno 2 la fiamma si accende (gif animata).
const CHIAVE = 'codeplay.streak';
function giornoLocale(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function aggiornaStreak(adesso = new Date()) {
  let st = {}; try { st = JSON.parse(localStorage.getItem(CHIAVE) || '{}'); } catch {}
  const oggi = giornoLocale(adesso), ieri = giornoLocale(new Date(adesso.getTime() - 86400000));
  let giorni = st.giorni || 0;
  if (st.ultimo !== oggi) giorni = st.ultimo === ieri ? giorni + 1 : 1;
  try { localStorage.setItem(CHIAVE, JSON.stringify({ ultimo: oggi, giorni })); } catch {}
  return giorni;
}
export function disegnaStreak(el, giorni, base = '') {
  const img = el.querySelector('img'), n = el.querySelector('strong'), t = el.querySelector('small') || el.querySelector('div');
  if (img) { img.src = giorni >= 2 ? `${base}assets/home/fuoco_loop.gif` : `${base}assets/home/fuoco_grigio.png`; img.classList.toggle('spenta', giorni < 2); }
  if (n) n.textContent = String(giorni);
  if (t && t.tagName === 'SMALL') t.textContent = giorni === 1 ? 'giorno di fila' : 'giorni di fila';
  el.classList.toggle('accesa', giorni >= 2);
}
