// Player della lezione: barra di avanzamento, una scheda alla volta, pulsante Continua/Verifica, livello finale con stelle.
import * as spiegazione from './schede/spiegazione.js';
import * as scelta from './schede/scelta.js';
import * as completa from './schede/completa.js';
import { montaCodice } from './schede/codice.js';

const RENDER = { spiegazione: spiegazione.render, scelta: scelta.render, completa: completa.render };

export function avviaLezione(root, lezione, { homeUrl = 'home.html' } = {}) {
  root.className = 'lezione';
  root.innerHTML = `
    <header class="testa-lezione">
      <a class="chiudi" href="${homeUrl}" aria-label="Chiudi">✕</a>
      <div class="progresso"><b></b></div>
      <span class="passo"></span>
    </header>
    <div class="corpo"></div>
    <footer class="pie-lezione"><div class="feedback" hidden></div><button class="avanti" type="button">Continua</button></footer>`;
  const corpo = root.querySelector('.corpo'), pie = root.querySelector('.pie-lezione'), feedback = root.querySelector('.feedback'), avanti = root.querySelector('.avanti');
  const barra = root.querySelector('.progresso b'), passo = root.querySelector('.passo');
  const schede = lezione.schede; let i = 0, corrente = null, codice = null;

  function aggiornaBarra() { barra.style.width = `${Math.round((i / schede.length) * 100)}%`; passo.textContent = `${Math.min(i + 1, schede.length)}/${schede.length}`; }
  function mostraFeedback(testo, ok) { feedback.hidden = !testo; feedback.textContent = testo || ''; feedback.classList.toggle('ok', !!ok); feedback.classList.toggle('no', testo && !ok); }

  function mostra() {
    aggiornaBarra(); mostraFeedback(null); corpo.innerHTML = ''; root.classList.remove('in-codice');
    if (codice) { codice.distruggi(); codice = null; }
    const s = schede[i];
    if (s.tipo === 'codice') { mostraCodice(s); return; }
    corrente = RENDER[s.tipo](s, { onPronto: (v) => { avanti.disabled = !v; } });
    corpo.appendChild(corrente.el);
    pie.hidden = false; avanti.disabled = !corrente.pronta; avanti.textContent = corrente.verifica ? 'Verifica' : 'Continua'; avanti.dataset.modo = corrente.verifica ? 'verifica' : 'avanti';
    corpo.scrollTop = 0;
  }
  async function mostraCodice(s) {
    root.classList.add('in-codice'); pie.hidden = true;
    const box = document.createElement('div'); box.className = 'contenitore-codice'; corpo.appendChild(box);
    codice = await montaCodice(box, s, { onVittoria: (stelle) => setTimeout(() => fine(stelle), 900), onMenu: () => { location.href = homeUrl; } });
    window.__app = codice;
  }
  function fine(stelle) {
    root.classList.remove('in-codice'); if (codice) { codice.distruggi(); codice = null; }
    i = schede.length; aggiornaBarra(); corpo.innerHTML = '';
    const el = document.createElement('article'); el.className = 'scheda fine';
    el.innerHTML = `<img class="mascotte" src="${import.meta.env.BASE_URL}assets/mascotte/saluto.png" alt=""><h2>Livello completato!</h2>
      <div class="stelle">${stelle.map(st => `<div class="stella ${st.ok ? 'presa' : ''}"><span>★</span><small>${st.testo}</small></div>`).join('')}</div>
      <p>${stelle.filter(st => st.ok).length === stelle.length ? 'Tutte le stelle al primo colpo. Sei pronto per la prossima lezione.' : 'Puoi rigiocare il livello per prendere le stelle che mancano.'}</p>
      ${lezione.epilogo ? `<p class="epilogo">${lezione.epilogo}</p>` : ''}
      <div class="azioni">${lezione.prossima ? `<a class="bottone primario" href="lezione.html?l=${lezione.prossima}">Prossima lezione</a><a class="bottone" href="${homeUrl}">Torna alla home</a>` : `<a class="bottone primario" href="${homeUrl}">Torna alla home</a>`}<button class="bottone" type="button" data-r="rigioca">Rigioca il livello</button></div>`;
    el.querySelector('[data-r="rigioca"]').addEventListener('click', () => { i = schede.length - 1; mostra(); });
    corpo.appendChild(el); pie.hidden = true;
  }
  avanti.addEventListener('click', () => {
    if (avanti.dataset.modo === 'verifica' && corrente?.verifica && !corrente.el.dataset.bloccata) {
      const r = corrente.verifica(); mostraFeedback(r.messaggio, r.ok);
      if (r.ok) { avanti.textContent = 'Continua'; avanti.dataset.modo = 'avanti'; }
      else { avanti.textContent = 'Riprova'; avanti.dataset.modo = 'riprova'; }
      return;
    }
    if (avanti.dataset.modo === 'riprova') { corrente.azzera(); mostraFeedback(null); avanti.textContent = 'Verifica'; avanti.dataset.modo = 'verifica'; return; }
    i++; if (i < schede.length) mostra();
  });
  mostra();
  return { vai(n) { i = n; mostra(); }, get indice() { return i; } };
}
