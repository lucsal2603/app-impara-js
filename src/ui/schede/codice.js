// Scheda codice: scena in alto, editor sotto, controlli. Si monta in un contenitore e restituisce sessione, scena, editor e loop.
import { COLONNE, RIGHE } from '../../config.js';
import { Loop } from '../../motore/loop.js';
import { Renderer } from '../../motore/renderer.js';
import { ScenaPlatform } from '../../scene/platform/index.js';
import { Sessione } from '../../sfida/sessione.js';
import { Editor } from '../editor.js';

const BASE = `${import.meta.env.BASE_URL}assets/scene/platform`;
let risorseCache = null;

function caricaImmagine(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('immagine mancante: ' + src)); i.src = src; }); }
export async function caricaRisorse() {
  if (risorseCache) return risorseCache;
  const [tilesMeta, spritesMeta] = await Promise.all([fetch(`${BASE}/tiles/tiles.json`).then(r => r.json()), fetch(`${BASE}/sprites/sprites.json`).then(r => r.json())]);
  const tiles = {}, sprites = {};
  await Promise.all([
    ...Object.keys(tilesMeta.pezzi).map(async n => { tiles[n] = await caricaImmagine(`${BASE}/tiles/${n}.png`); }),
    ...Object.keys(spritesMeta).map(async n => { sprites[n] = await caricaImmagine(`${BASE}/sprites/${spritesMeta[n].file}`); }),
  ]);
  return (risorseCache = { tiles, tilesMeta, sprites, spritesMeta });
}

const TEMPLATE = `
  <header class="barra">
    <button class="icona" data-r="btn-menu" aria-label="Menu">II</button>
    <div class="titolo"><strong data-r="titolo"></strong><span data-r="sottotitolo"></span></div>
    <div class="contatore" data-r="contatore" title="righe di codice">0</div>
  </header>
  <div class="scena-wrap"><canvas data-r="canvas"></canvas><div class="messaggio" data-r="messaggio" hidden></div></div>
  <div class="hud"><span data-r="obiettivo"></span><span><span data-r="stato">pronto</span> <button class="aiuto" data-r="btn-aiuto" aria-label="Aiuto">?</button></span></div>
  <section class="editor-wrap">
    <div class="editor">
      <pre class="righe" data-r="righe" aria-hidden="true"></pre>
      <pre class="evidenzia" data-r="evidenzia" aria-hidden="true"></pre>
      <textarea data-r="codice" wrap="off" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" aria-label="Codice"></textarea>
    </div>
    <div class="errore" data-r="errore" hidden></div>
    <div class="suggerimento" data-r="aiuto" hidden></div>
    <div class="palette" data-r="palette"></div>
    <div class="controlli">
      <button data-r="btn-esegui" class="primario">ESEGUI</button>
      <button data-r="btn-pausa">PAUSA</button>
      <button data-r="btn-passo">PASSO</button>
      <button data-r="btn-ricomincia">RICOMINCIA</button>
    </div>
  </section>`;

export function valutaStelle(livello, scena, editor) {
  return (livello.stelle || []).map(s => {
    if (s.tipo === 'completa') return { ...s, ok: true };
    if (s.tipo === 'maxRighe') return { ...s, ok: editor.righeCodice() <= s.valore };
    if (s.tipo === 'chiave') return { ...s, ok: scena.chiavi.length > 0 && scena.chiavi.every(k => k.presa) };
    return { ...s, ok: false };
  });
}

export async function montaCodice(root, livello, opzioni = {}) {
  const risorse = await caricaRisorse();
  root.classList.add('scheda-codice'); root.innerHTML = TEMPLATE;
  const $ = (r) => root.querySelector(`[data-r="${r}"]`);
  $('titolo').textContent = livello.titolo || ''; $('sottotitolo').textContent = livello.sottotitolo || '';
  $('obiettivo').textContent = livello.obiettivo?.testo || '';

  const scena = new ScenaPlatform(livello.config, risorse);
  const renderer = new Renderer($('canvas'), COLONNE, RIGHE);
  const editor = new Editor({ textarea: $('codice'), righe: $('righe'), evidenzia: $('evidenzia'), palette: $('palette'), api: livello.api, contatore: $('contatore'), starter: livello.starter || '' });
  const ui = {
    stato: (s) => { $('stato').textContent = { pronto: 'pronto', esecuzione: 'in esecuzione', passo: 'passo', pausa: 'in pausa', finito: 'finito' }[s] || s; $('btn-pausa').textContent = s === 'pausa' ? 'RIPRENDI' : 'PAUSA'; },
    errore: (e) => { const el = $('errore'); if (!e) { el.hidden = true; return; } el.hidden = false; el.textContent = `Riga ${e.riga}: ${e.messaggio}`; },
    messaggio: (m) => { const el = $('messaggio'); if (!m) { el.hidden = true; return; } el.hidden = false; el.textContent = m; },
  };
  const sessione = new Sessione({ scena, editor, api: livello.api, ui, onVittoria: () => opzioni.onVittoria?.(valutaStelle(livello, scena, editor)) });
  $('btn-esegui').addEventListener('click', () => sessione.esegui());
  $('btn-pausa').addEventListener('click', () => sessione.pausa());
  $('btn-passo').addEventListener('click', () => sessione.passo());
  $('btn-ricomincia').addEventListener('click', () => sessione.ricomincia());
  $('btn-menu').addEventListener('click', () => opzioni.onMenu?.());
  // aiuti progressivi: ogni tocco mostra il suggerimento successivo
  let nAiuto = 0; const aiuti = livello.aiuti || [];
  $('btn-aiuto').addEventListener('click', () => {
    if (!aiuti.length) return;
    const el = $('aiuto'); el.hidden = false; nAiuto = Math.min(nAiuto + 1, aiuti.length);
    const testo = aiuti[nAiuto - 1]; el.textContent = ''; el.append(`Aiuto ${nAiuto} di ${aiuti.length}: `);
    if (testo.includes('\n')) { const pre = document.createElement('pre'); pre.textContent = testo; el.appendChild(pre); } else el.append(testo);
  });
  const loop = new Loop({ tick: () => sessione.tick(), disegna: () => renderer.disegna(scena) });
  loop.avvia();
  return { scena, sessione, editor, loop, renderer, distruggi() { loop.ferma(); root.innerHTML = ''; root.classList.remove('scheda-codice'); } };
}
