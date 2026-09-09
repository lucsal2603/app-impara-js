// Palestra: elenco di esercizi, editor e test nascosti. Ogni esercizio superato viene salvato nel progresso.
import palestra from '../content/it/palestra.json';
import { Editor } from './ui/editor.js';
import { provaEsercizio } from './sfida/palestra.js';
import { leggiProgresso, salvaPalestra } from './sfida/progresso.js';
import { riempi } from './ui/testo.js';
import { aggiornaStreak, disegnaStreak } from './sfida/streak.js';

const A = `${import.meta.env.BASE_URL}assets`;
const root = document.getElementById('palestra'); root.className = 'lezione palestra';
for (const [k, v] of Object.entries({ sfondo: 'lezione/sfondo.jpg', pannello: 'lezione/pannello_quiz.png', pillola: 'lezione/pillola.png', lettera: 'lezione/lettera.png', bolla: 'lezione/bolla.png', bottone: 'fine/bottone.png' }))
  root.style.setProperty(`--img-${k}`, `url("${A}/${v}")`);
const q = new URLSearchParams(location.search);

function elenco() {
  const fatti = leggiProgresso().palestra || {};
  root.innerHTML = `
    <header class="testa-lezione">
      <a class="indietro" href="home.html" aria-label="Torna alla home"><img src="${A}/lezione/indietro.png" alt=""></a>
      <img class="logo" src="${A}/home/logo.png" alt="Code Play"><div class="chip-streak" data-r="streak"><img src="${A}/home/fuoco_grigio.png" alt=""><div><strong>1</strong><small>giorno di fila</small></div></div>
    </header>
    <div class="corpo"><article class="scheda">
      <div class="domanda"><h2>${palestra.titolo}</h2></div><p>${palestra.sottotitolo}</p>
      <div class="esercizi">${palestra.esercizi.map((e, i) => `<a class="esercizio ${fatti[e.id] ? 'fatto' : ''}" href="?e=${e.id}"><em>${fatti[e.id] ? '✓' : i + 1}</em><span><b>${e.titolo}</b><small>${e.capitolo}</small></span></a>`).join('')}</div>
    </article></div>`;
}

function esercizio(e) {
  root.innerHTML = `
    <header class="testa-lezione">
      <a class="indietro" href="palestra.html" aria-label="Torna alla palestra"><img src="${A}/lezione/indietro.png" alt=""></a>
      <img class="logo" src="${A}/home/logo.png" alt="Code Play"><div class="chip-streak" data-r="streak"><img src="${A}/home/fuoco_grigio.png" alt=""><div><strong>1</strong><small>giorno di fila</small></div></div>
    </header>
    <div class="corpo">
      <article class="scheda scheda-esercizio">
        <div class="domanda"><h2>${e.titolo}</h2></div>
        <p data-r="consegna"></p>
        <p class="esempio">Esempio: ${Object.entries(e.esempio).map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join(', ')} → <code>${e.casi[0].atteso.join(' · ') || '(niente)'}</code></p>
      </article>
      <section class="editor-wrap palestra-editor">
        <div class="editor" data-r="editor"></div>
        <div class="errore" data-r="errore" hidden></div>
        <div class="simboli" data-r="simboli"></div>
        <div class="palette" data-r="palette"></div>
        <div class="risultati" data-r="risultati" hidden></div>
      </section>
    </div>
    <footer class="pie-lezione"><div class="feedback" hidden></div><button class="avanti" type="button"><span>Prova</span><i>›</i></button></footer>`;
  const $ = r => root.querySelector(`[data-r="${r}"]`);
  riempi($('consegna'), e.consegna);
  const sensori = Object.keys(e.casi[0].variabili || {});
  const editor = new Editor({ contenitore: $('editor'), palette: $('palette'), simboli: $('simboli'), api: [], sensori: [], sintassi: e.sintassi, starter: e.starter || '' });
  for (const n of sensori) editor.bottone($('palette'), n, () => editor.inserisci(n, true), 'sensore');
  editor.bottone($('palette'), 'console.log()', () => editor.modello('log'));
  const feedback = root.querySelector('.feedback'), avanti = root.querySelector('.avanti');
  avanti.addEventListener('click', () => {
    if (avanti.dataset.modo === 'elenco') { location.href = 'palestra.html'; return; }
    const r = provaEsercizio(e, editor.codice());
    const err = $('errore'); err.hidden = !r.errore; if (r.errore) err.textContent = `Riga ${r.errore.riga}: ${r.errore.messaggio}`;
    const box = $('risultati'); box.hidden = !r.casi.length;
    box.innerHTML = r.casi.map(c => `<div class="caso ${c.ok ? 'ok' : 'no'}"><b>${c.ok ? '✓' : '✗'}</b><span>${Object.entries(c.variabili || {}).map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join(', ')}</span><code>${c.errore ? 'errore: ' + c.errore : (c.ottenuto.join(' · ') || '(niente)')}</code>${c.ok ? '' : `<small>atteso: ${c.atteso.join(' · ') || '(niente)'}</small>`}</div>`).join('');
    feedback.hidden = false; feedback.className = 'feedback ' + (r.ok ? 'ok' : 'no');
    feedback.textContent = r.ok ? 'Tutti i test passano. Esercizio superato!' : r.errore ? 'Il codice ha un errore: leggi il messaggio sopra.' : `${r.casi.filter(c => c.ok).length} test su ${r.casi.length}: guarda i casi rossi.`;
    if (r.ok) { salvaPalestra(e.id); avanti.querySelector('span').textContent = 'Torna agli esercizi'; avanti.dataset.modo = 'elenco'; }
  });
}

const e = palestra.esercizi.find(x => x.id === q.get('e'));
if (e) esercizio(e); else elenco();
for (const el of root.querySelectorAll('[data-r="streak"]')) disegnaStreak(el, aggiornaStreak(), import.meta.env.BASE_URL);
