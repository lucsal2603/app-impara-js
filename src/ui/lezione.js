// Player della lezione: barra di avanzamento, una scheda alla volta, pulsante Continua/Verifica, livello finale con stelle.
import * as spiegazione from './schede/spiegazione.js';
import * as scelta from './schede/scelta.js';
import * as completa from './schede/completa.js';
import * as riordina from './schede/riordina.js';
import * as trova_errore from './schede/trova_errore.js';
import { salvaLezione } from '../sfida/progresso.js';
import { montaCodice } from './schede/codice.js';
import { mostraFine } from './fine.js';

const RENDER = { spiegazione: spiegazione.render, scelta: scelta.render, completa: completa.render, riordina: riordina.render, trova_errore: trova_errore.render };

export function avviaLezione(root, lezione, { homeUrl = 'home.html' } = {}) {
  root.className = 'lezione';
  const A = `${import.meta.env.BASE_URL}assets`;
  for (const [k, v] of Object.entries({ sfondo: 'lezione/sfondo.jpg', pannello: 'lezione/pannello_quiz.png', pillola: 'lezione/pillola.png', lettera: 'lezione/lettera.png', bolla: 'lezione/bolla.png', bottone: 'fine/bottone.png', 'barra-vuota': 'lezione/barra_vuota.png', 'barra-piena': 'lezione/barra_piena.png', riquadro: 'fine/riquadro.png' }))
    root.style.setProperty(`--img-${k}`, `url("${A}/${v}")`);
  root.innerHTML = `
    <header class="testa-lezione">
      <a class="indietro" href="${homeUrl}" aria-label="Torna alla home"><img src="${A}/lezione/indietro.png" alt=""></a>
      <img class="logo" src="${A}/home/logo.png" alt="Code Play">
      <div class="chip-streak"><img src="${A}/home/fuoco_loop.gif" alt=""><div><strong>7</strong><small>giorni di fila</small></div></div>
    </header>
    <div class="progresso-wrap"><div class="progresso"><b></b></div><span class="passo"></span></div>
    <div class="corpo"></div>
    <footer class="pie-lezione"><div class="feedback" hidden></div><button class="avanti" type="button"><span>Continua</span><i>›</i></button></footer>`;
  const corpo = root.querySelector('.corpo'), pie = root.querySelector('.pie-lezione'), feedback = root.querySelector('.feedback'), avanti = root.querySelector('.avanti');
  const barra = root.querySelector('.progresso b'), passo = root.querySelector('.passo');
  const schede = lezione.schede; let i = 0, corrente = null, codice = null;

  function aggiornaBarra() { barra.style.width = `calc(${Math.round((i / schede.length) * 100)}% + 18px)`; passo.textContent = `${Math.min(i + 1, schede.length)}/${schede.length}`; }
  function etichetta(t) { avanti.querySelector('span').textContent = t; }
  function mostraFeedback(testo, ok) { feedback.hidden = !testo; feedback.textContent = testo || ''; feedback.classList.toggle('ok', !!ok); feedback.classList.toggle('no', testo && !ok); }

  function mostra() {
    aggiornaBarra(); mostraFeedback(null); corpo.innerHTML = ''; root.classList.remove('in-codice');
    if (codice) { codice.distruggi(); codice = null; }
    const s = schede[i];
    if (s.tipo === 'codice') { mostraCodice(s); return; }
    corrente = RENDER[s.tipo](s, { onPronto: (v) => { avanti.disabled = !v; } });
    corpo.appendChild(corrente.el);
    pie.hidden = false; avanti.disabled = !corrente.pronta; etichetta(corrente.verifica ? 'Conferma risposta' : 'Continua'); avanti.dataset.modo = corrente.verifica ? 'verifica' : 'avanti';
    corpo.scrollTop = 0;
  }
  async function mostraCodice(s) {
    root.classList.add('in-codice'); pie.hidden = true;
    const box = document.createElement('div'); box.className = 'contenitore-codice'; corpo.appendChild(box);
    const ultima = i === schede.length - 1;
    codice = await montaCodice(box, s, { onVittoria: (stelle) => setTimeout(() => (ultima ? fine(stelle) : tappa(stelle)), 900), onMenu: () => { location.href = homeUrl; } });
    window.__app = codice;
  }
  function tappa(stelle) {   // livello intermedio: si festeggia e si continua con la scheda dopo
    mostraFine(root, { stelle, capitolo: lezione.capitolo, titolo: schede[i].sottotitolo || lezione.titolo, homeUrl, onContinua: () => { i++; mostra(); }, onRigioca: () => mostra() });
  }
  function fine(stelle) {
    i = schede.length; aggiornaBarra(); salvaLezione(lezione.id, stelle);
    mostraFine(root, {
      stelle, capitolo: lezione.capitolo, titolo: lezione.titolo, epilogo: lezione.epilogo, homeUrl,
      continuaHref: lezione.prossima ? `lezione.html?l=${lezione.prossima}` : homeUrl,
      onRigioca: () => { i = schede.length - 1; mostra(); },
    });
  }
  avanti.addEventListener('click', () => {
    if (avanti.dataset.modo === 'verifica' && corrente?.verifica && !corrente.el.dataset.bloccata) {
      const r = corrente.verifica(); mostraFeedback(r.messaggio, r.ok);
      if (r.ok) { etichetta('Continua'); avanti.dataset.modo = 'avanti'; }
      else { etichetta('Riprova'); avanti.dataset.modo = 'riprova'; }
      return;
    }
    if (avanti.dataset.modo === 'riprova') { corrente.azzera(); mostraFeedback(null); etichetta('Conferma risposta'); avanti.dataset.modo = 'verifica'; return; }
    i++; if (i < schede.length) mostra();
  });
  mostra();
  return { vai(n) { i = n; mostra(); }, fine, get indice() { return i; } };
}
