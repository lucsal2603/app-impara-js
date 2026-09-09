// Schermata "Livello completato": pannello, stelle e bottone renderizzati da Blender (public/assets/fine).
// Le stelle prese appaiono da sinistra a destra crescendo e facendo un giro su se stesse (foglio 6x4 da 24 fotogrammi); quelle mancate restano grigie.
const BASE = `${import.meta.env.BASE_URL}assets/fine`;
const FRAMES = 24, COLONNE = 6, RIGHE_FOGLIO = 4, DURATA_GIRO = 780;

export function mostraFine(root, { stelle, capitolo, titolo, epilogo, continuaHref, homeUrl, onRigioca, onContinua }) {
  const prese = stelle.filter(s => s.ok).length, mancanti = stelle.filter(s => !s.ok);
  const el = document.createElement('div'); el.className = 'fine-overlay';
  const testo = prese === stelle.length ? (onContinua ? 'Tutte le stelle! La lezione continua.' : 'Tutte le stelle! Sei pronto per la prossima lezione.')
    : `Manca ${mancanti.length === 1 ? 'una stella' : mancanti.length + ' stelle'}: ${mancanti.map(m => m.testo.toLowerCase()).join(', ')}. Rigioca il livello quando vuoi.`;
  el.innerHTML = `
    <div class="fine-sfondo"></div>
    <div class="fine-card">
      <img class="fine-titolo" src="${BASE}/titolo.png" alt="Livello completato!">
      <div class="fine-pannello">
        <div class="fine-stelle">${stelle.map((s, i) => `<div class="fine-stella ${s.ok ? 'presa' : 'grigia'}" data-i="${i}" title="${s.testo}"><i class="giro"></i><img class="grigia" src="${BASE}/stella_grigia.png" alt=""></div>`).join('')}</div>
        <div class="fine-riquadro"><b>${capitolo ? capitolo + ' · ' : ''}${titolo}</b><p>${testo}</p>${epilogo ? `<p class="fine-epilogo">${epilogo}</p>` : ''}</div>
        <a class="fine-continua" href="${continuaHref || homeUrl}">${onContinua ? 'Continua' : (continuaHref && continuaHref !== homeUrl ? 'Continua' : 'Torna alla home')}</a>
        <div class="fine-link"><button type="button" data-r="rigioca">Rigioca il livello</button><span>·</span><a href="${homeUrl}">Home</a></div>
      </div>
    </div>`;
  el.querySelector('[data-r="rigioca"]').addEventListener('click', () => { el.remove(); onRigioca?.(); });
  if (onContinua) el.querySelector('.fine-continua').addEventListener('click', e => { e.preventDefault(); el.remove(); onContinua(); });
  const img = (sel, f) => el.querySelectorAll(sel).forEach(n => { n.style.backgroundImage = `url("${BASE}/${f}")`; });
  img('.fine-pannello', 'pannello.png'); img('.fine-riquadro', 'riquadro.png'); img('.fine-continua', 'bottone.png'); img('.fine-stella .giro', 'stella_giro.png');
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('aperta'));

  // stelle prese: una alla volta, da sinistra a destra
  const preseEl = [...el.querySelectorAll('.fine-stella.presa')];
  preseEl.forEach((st, k) => setTimeout(() => appari(st), 650 + k * 520));
  setTimeout(() => el.classList.add('pronta'), 650 + preseEl.length * 520 + 300);
  return el;
}

function appari(st) {
  st.classList.add('appare');
  const giro = st.querySelector('.giro'); const t0 = performance.now();
  for (let i = 0; i < 6; i++) { const l = document.createElement('img'); l.src = `${BASE}/lampo.png`; l.className = 'lampo'; l.style.setProperty('--a', `${i * 60 + 30}deg`); l.style.setProperty('--r', `${(i % 2 ? 1 : 1.3)}`); st.appendChild(l); }
  function frame(now) {
    const f = Math.min(FRAMES - 1, Math.floor(((now - t0) / DURATA_GIRO) * FRAMES));
    giro.style.backgroundPosition = `${(f % COLONNE) / (COLONNE - 1) * 100}% ${Math.floor(f / COLONNE) / (RIGHE_FOGLIO - 1) * 100}%`;
    if (now - t0 < DURATA_GIRO) requestAnimationFrame(frame); else { giro.style.backgroundPosition = '0% 0%'; st.classList.add('ferma'); }
  }
  requestAnimationFrame(frame);
}
